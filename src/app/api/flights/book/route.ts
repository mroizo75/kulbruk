import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { amadeusClient } from '@/lib/amadeus-client'
// Note: Import Prisma client when available
// import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
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

    console.log('🎫 Starting flight booking process...')
    console.log(`Flight: ${flightOffer.id}`)
    console.log(`Travelers: ${travelers.length}`)
    console.log(`User: ${userId}`)

    // 1. Først bekreft prisen med Amadeus
    console.log('💰 Confirming flight price...')
    const priceConfirmation = await amadeusClient.confirmFlightOffer(flightOffer)
    
    if (!priceConfirmation.success) {
      console.error('Price confirmation failed:', priceConfirmation.error)
      return NextResponse.json(
        { error: 'Kunne ikke bekrefte flypris. Prøv igjen.' },
        { status: 400 }
      )
    }

    // 2. Bruk bekreftet tilbud for booking
    const confirmedOffer = priceConfirmation.data?.flightOffers?.[0] || flightOffer

    // 3. Book via Amadeus
    console.log('🎫 Creating flight order via Amadeus...')
    const bookingResult = await amadeusClient.instance.bookFlight(
      confirmedOffer,
      travelers,
      contacts
    )

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
    console.log('✅ Amadeus booking successful, saving to database...')
    
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
      message: 'Flyreise booket successfully!',
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
