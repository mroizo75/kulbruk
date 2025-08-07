import { NextRequest, NextResponse } from 'next/server'
import { amadeusClient } from '@/lib/amadeus-client'

// POST /api/cars/search - Søk etter leiebiler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      pickUpLocationCode,
      dropOffLocationCode,
      pickUpDate, 
      dropOffDate,
      currency = 'NOK'
    } = body

    // Valider påkrevde felt
    if (!pickUpLocationCode || !pickUpDate || !dropOffDate) {
      return NextResponse.json(
        { error: 'pickUpLocationCode, pickUpDate og dropOffDate er påkrevd' },
        { status: 400 }
      )
    }

    console.log('🚗 Søker etter leiebiler:', { 
      pickUpLocationCode, 
      dropOffLocationCode: dropOffLocationCode || pickUpLocationCode,
      pickUpDate, 
      dropOffDate 
    })

    const result = await amadeusClient.searchCarRentals({
      pickUpLocationCode,
      dropOffLocationCode: dropOffLocationCode || pickUpLocationCode,
      pickUpDate,
      dropOffDate,
      currency
    })

    if (result.success) {
      // Format car rental offers for frontend
      const formattedOffers = result.data?.map((offer: any) => ({
        id: offer.id,
        vehicle: {
          category: offer.vehicle?.category,
          description: offer.vehicle?.description,
          seats: offer.vehicle?.seats,
          bags: offer.vehicle?.bags,
          doors: offer.vehicle?.doors,
          transmission: offer.vehicle?.transmission,
          fuel: offer.vehicle?.fuel,
          airConditioning: offer.vehicle?.airConditioning,
          image: offer.vehicle?.imageURL
        },
        rate: {
          type: offer.rate?.type,
          price: {
            currency: offer.rate?.price?.currency,
            amount: offer.rate?.price?.amount,
            formattedNOK: `${Math.round(parseFloat(offer.rate?.price?.amount || '0'))} kr`
          },
          rateTaxes: offer.rate?.rateTaxes
        },
        pickupInformation: offer.pickupInformation,
        dropoffInformation: offer.dropoffInformation,
        mileage: offer.mileage,
        vendor: offer.vendor,
        terms: offer.terms,
        estimatedTotal: {
          currency: offer.estimatedTotal?.currency,
          amount: offer.estimatedTotal?.amount,
          formattedNOK: `${Math.round(parseFloat(offer.estimatedTotal?.amount || '0'))} kr`
        },
        self: offer.self
      })) || []

      return NextResponse.json({
        success: true,
        offers: formattedOffers,
        meta: result.meta,
        message: `Fant ${formattedOffers.length} leiebiler`
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
    console.error('Car rental search error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'En feil oppstod under bilsøket' 
      },
      { status: 500 }
    )
  }
}
