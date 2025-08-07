import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { amadeusClient } from '@/lib/amadeus-client'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/flights/confirm - Bekreft flytilbud og pris
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Du må være logget inn for å bekrefte flytilbud' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { flightOffer, passengers } = body

    if (!flightOffer) {
      return NextResponse.json(
        { error: 'flightOffer er påkrevd' },
        { status: 400 }
      )
    }

    console.log('🎫 Bekrefter flytilbud:', flightOffer.id)

    // Bekreft tilgjengelighet og pris via Amadeus
    const confirmResult = await amadeusClient.confirmFlightOffer(flightOffer)

    if (!confirmResult.success) {
      console.error('Amadeus Confirm feil:', confirmResult.error)
      return NextResponse.json(
        { error: 'Kunne ikke bekrefte flytilbudet. Det kan være utsolgt eller priset har endret seg.' },
        { status: 400 }
      )
    }

    const confirmedOffer = confirmResult.data?.flightOffers?.[0]
    
    if (!confirmedOffer) {
      return NextResponse.json(
        { error: 'Flytilbudet er ikke lenger tilgjengelig' },
        { status: 400 }
      )
    }

    // Sjekk om brukeren eksisterer i databasen
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Bruker ikke funnet. Logg ut og inn igjen.' },
        { status: 404 }
      )
    }

    // Hent rute-informasjon fra det bekreftede tilbudet
    const firstItinerary = confirmedOffer.itineraries?.[0]
    const firstSegment = firstItinerary?.segments?.[0]
    const lastSegment = firstItinerary?.segments?.[firstItinerary.segments.length - 1]

    if (!firstSegment || !lastSegment) {
      return NextResponse.json(
        { error: 'Ugyldig flight data' },
        { status: 400 }
      )
    }

    // Opprett booking i database
    const flightBooking = await prisma.flightBooking.create({
      data: {
        userId: dbUser.id,
        origin: firstSegment.departure.iataCode,
        destination: lastSegment.arrival.iataCode,
        departureDate: new Date(firstSegment.departure.at),
        returnDate: confirmedOffer.itineraries?.[1]?.segments?.[0]?.departure?.at 
          ? new Date(confirmedOffer.itineraries[1].segments[0].departure.at) 
          : null,
        passengers: passengers || 1,
        cabinClass: firstSegment.cabin || 'ECONOMY',
        amadeusOfferId: confirmedOffer.id,
        flightOfferData: confirmedOffer,
        totalPrice: parseFloat(confirmedOffer.price.total),
        currency: confirmedOffer.price.currency,
        status: 'OFFER_SELECTED'
      }
    })

    // Opprett flight segments
    for (const itinerary of confirmedOffer.itineraries) {
      for (let i = 0; i < itinerary.segments.length; i++) {
        const segment = itinerary.segments[i]
        
        await prisma.flightSegment.create({
          data: {
            flightBookingId: flightBooking.id,
            carrierCode: segment.carrierCode,
            flightNumber: segment.number,
            departureAirport: segment.departure.iataCode,
            arrivalAirport: segment.arrival.iataCode,
            departureTime: new Date(segment.departure.at),
            arrivalTime: new Date(segment.arrival.at),
            aircraftCode: segment.aircraft?.code,
            duration: segment.duration,
            cabinClass: segment.cabin || 'ECONOMY',
            fareBasis: segment.pricingDetailPerAdult?.fareDetailsBySegment?.[0]?.fareBasis,
            segmentNumber: i + 1
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: flightBooking.id,
        totalPrice: flightBooking.totalPrice,
        currency: flightBooking.currency,
        status: flightBooking.status,
        route: `${flightBooking.origin} → ${flightBooking.destination}`,
        departureDate: flightBooking.departureDate,
        returnDate: flightBooking.returnDate
      },
      confirmedOffer,
      message: 'Flytilbud bekreftet og lagret. Nå kan du gå videre til booking.'
    })

  } catch (error) {
    console.error('Flight Confirm API feil:', error)
    return NextResponse.json(
      { error: 'Intern server feil' },
      { status: 500 }
    )
  }
}
