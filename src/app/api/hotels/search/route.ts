import { NextRequest, NextResponse } from 'next/server'
import { amadeusClient } from '@/lib/amadeus-client'

// POST /api/hotels/search - Søk etter hoteller
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      cityCode,
      checkInDate, 
      checkOutDate, 
      adults = 1, 
      children = 0,
      rooms = 1,
      currency = 'NOK'
    } = body

    // Valider påkrevde felt
    if (!cityCode || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: 'cityCode, checkInDate og checkOutDate er påkrevd' },
        { status: 400 }
      )
    }

    console.log('🏨 Søker etter hoteller:', { cityCode, checkInDate, checkOutDate, adults, rooms })

    const result = await amadeusClient.searchHotels({
      cityCode,
      checkInDate,
      checkOutDate,
      adults,
      children,
      rooms,
      currency
    })

    if (result.success) {
      // Format hotel offers for frontend
      const formattedOffers = result.data?.map((offer: any) => ({
        id: offer.id,
        hotel: {
          hotelId: offer.hotel?.hotelId,
          name: offer.hotel?.name,
          rating: offer.hotel?.rating,
          contact: offer.hotel?.contact,
          address: offer.hotel?.address,
          distance: offer.hotel?.distance
        },
        available: offer.available,
        offers: offer.offers?.map((hotelOffer: any) => ({
          id: hotelOffer.id,
          checkInDate: hotelOffer.checkInDate,
          checkOutDate: hotelOffer.checkOutDate,
          rateCode: hotelOffer.rateCode,
          room: hotelOffer.room,
          guests: hotelOffer.guests,
          price: {
            currency: hotelOffer.price?.currency,
            base: hotelOffer.price?.base,
            total: hotelOffer.price?.total,
            taxes: hotelOffer.price?.taxes,
            formattedNOK: `${Math.round(parseFloat(hotelOffer.price?.total || '0'))} kr`
          },
          policies: hotelOffer.policies,
          self: hotelOffer.self
        })),
        self: offer.self
      })) || []

      return NextResponse.json({
        success: true,
        offers: formattedOffers,
        meta: result.meta,
        message: `Fant ${formattedOffers.length} hoteller i ${cityCode}`
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          code: result.code 
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Hotel search error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'En feil oppstod under hotellsøket' 
      },
      { status: 500 }
    )
  }
}
