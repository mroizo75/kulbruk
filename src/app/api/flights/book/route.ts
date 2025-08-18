import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { amadeusClient } from '@/lib/amadeus-client'
// Note: Import Prisma client when available
// import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = (session?.user as any)?.id
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Ikke autentisert. Logg inn for å booke flyreiser.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      flightOffer, 
      travelers, 
      contacts,
      paymentInfo 
    } = body

    // Valider påkrevde felt
    if (!flightOffer || !travelers || travelers.length === 0) {
      return NextResponse.json(
        { error: 'FlightOffer og passasjerdetaljer er påkrevd' },
        { status: 400 }
      )
    }

    // Valider passasjerdetaljer
    for (const traveler of travelers) {
      if (!traveler.name?.firstName || !traveler.name?.lastName || !traveler.dateOfBirth || !traveler.gender) {
        return NextResponse.json(
          { error: 'Alle passasjerdetaljer (navn, fødselsdato, kjønn) er påkrevd' },
          { status: 400 }
        )
      }
    }

    // Valider kontaktinformasjon
    if (!contacts || contacts.length === 0 || !contacts[0]?.emailAddress) {
      return NextResponse.json(
        { error: 'E-postadresse er påkrevd for booking' },
        { status: 400 }
      )
    }

    if (!contacts[0]?.phones || contacts[0]?.phones.length === 0) {
      return NextResponse.json(
        { error: 'Telefonnummer er påkrevd for booking' },
        { status: 400 }
      )
    }

    console.log('🎫 Starting flight booking process...')
    console.log(`Flight: ${flightOffer.id}`)
    console.log(`Travelers: ${travelers.length}`)
    console.log(`User: ${userId}`)
    console.log('📊 Received data:', {
      flightOffer: flightOffer ? 'Present' : 'Missing',
      travelers: travelers?.map(t => ({ name: t.name, dob: t.dateOfBirth, gender: t.gender })),
      contacts: contacts?.map(c => ({ email: c.emailAddress, hasPhone: !!c.phones?.length }))
    })

    // 1. Sjekk om dette er mock-data (test-miljø)
    const isMockData = flightOffer.id?.startsWith('COMPETITIVE_') || flightOffer.id?.startsWith('MOCK_')
    
    let confirmedOffer = flightOffer
    
    if (!isMockData) {
      // Kun bekreft pris for ekte Amadeus-data
      console.log('💰 Confirming flight price with Amadeus...')
      const priceConfirmation = await amadeusClient.confirmFlightOffer(flightOffer)
      
      if (!priceConfirmation.success) {
        console.error('Price confirmation failed:', priceConfirmation.error)
        return NextResponse.json(
          { error: 'Kunne ikke bekrefte flypris. Prøv igjen.' },
          { status: 400 }
        )
      }
      confirmedOffer = priceConfirmation.data?.flightOffers?.[0] || flightOffer
    } else {
      console.log('🎭 Using mock data - skipping price confirmation')
    }

    // 3. Book via Amadeus (kun for ekte data)
    let bookingResult
    
    if (!isMockData) {
      console.log('🎫 Creating flight order via Amadeus...')
      bookingResult = await amadeusClient.instance.bookFlight(
        confirmedOffer,
        travelers,
        contacts
      )
    } else {
      console.log('🎭 Simulating booking for mock data...')
      // Simuler en vellykket booking for test-data
      bookingResult = {
        success: true,
        data: {
          id: 'DEMO_BOOKING_' + Date.now(),
          associatedRecords: [{
            reference: 'DEMO_REF_' + Math.random().toString(36).substr(2, 6).toUpperCase()
          }]
        }
      }
    }

    if (!bookingResult.success) {
      console.error('Amadeus booking failed:', bookingResult.error)
      
      // Fallback: Opprett lokal booking selv om Amadeus feiler
      console.log('⚠️ Amadeus booking failed, creating local booking record...')
      
      const localBooking = {
        id: `local_${Date.now()}`,
        bookingReference: `LOCAL_${Date.now()}`,
        status: 'PENDING'
      }
      
      // TODO: Implement database save when Prisma is configured
      // const localBooking = await prisma.flightBooking.create({ ... })

      return NextResponse.json({
        success: false,
        error: 'Booking kunne ikke fullføres gjennom flyselskapet. Din forespørsel er registrert og vi vil kontakte deg.',
        bookingId: localBooking.id,
        bookingReference: localBooking.bookingReference,
        status: 'PENDING'
      })
    }

    // 4. Success - Lagre booking i database
    console.log(isMockData ? '✅ Demo booking successful, saving to database...' : '✅ Amadeus booking successful, saving to database...')
    
    const booking = {
      id: `booking_${Date.now()}`,
      bookingReference: bookingResult.data?.associatedRecords?.[0]?.reference || bookingResult.data?.id || `KUL_${Date.now()}`,
      amadeusOrderId: bookingResult.data?.id,
      totalPrice: parseFloat(confirmedOffer.price.total),
      currency: confirmedOffer.price.currency,
      status: 'CONFIRMED',
      departureDate: new Date(confirmedOffer.itineraries[0].segments[0].departure.at),
      returnDate: confirmedOffer.itineraries[1] ? new Date(confirmedOffer.itineraries[1].segments[0].departure.at) : null,
      passengers: travelers.length
    }
    
    // TODO: Implement database save when Prisma is configured
    // const booking = await prisma.flightBooking.create({ ... })

    console.log('✅ Flight booking completed successfully!')
    console.log(`Booking ID: ${booking.id}`)
    console.log(`Amadeus Order ID: ${bookingResult.data?.id}`)

    return NextResponse.json({
      success: true,
      message: isMockData ? 'Demo flyreise booket successfully!' : 'Flyreise booket successfully!',
      demo: isMockData,
      booking: {
        id: booking.id,
        bookingReference: booking.bookingReference,
        amadeusOrderId: booking.amadeusOrderId,
        totalPrice: booking.totalPrice,
        currency: booking.currency,
        status: booking.status,
        departureDate: booking.departureDate,
        returnDate: booking.returnDate,
        passengers: booking.passengers
      },
      amadeusOrder: bookingResult.data
    })

  } catch (error) {
    console.error('Flight booking API error:', error)
    return NextResponse.json(
      { error: 'Intern server feil under booking' },
      { status: 500 }
    )
  }
}
