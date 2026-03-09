import { NextRequest, NextResponse } from 'next/server'
import { getHotelReviews } from '@/lib/google-places'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const hotelId = searchParams.get('hotelId')
  const hotelName = searchParams.get('name')
  const address = searchParams.get('address') ?? ''

  if (!hotelId || !hotelName) {
    return NextResponse.json(
      { error: { code: 'MISSING_PARAMS', message: 'hotelId og name er påkrevd' } },
      { status: 400 },
    )
  }

  console.log('⭐ [reviews route] hotelId:', hotelId, '| name:', hotelName, '| address:', address)

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.warn('⭐ [reviews route] GOOGLE_PLACES_API_KEY mangler')
    return NextResponse.json({ rating: 0, totalRatings: 0, reviews: [] })
  }

  try {
    const result = await getHotelReviews(hotelId, hotelName, address)
    console.log('⭐ [reviews route] result:', result ? `rating ${result.rating}, ${result.reviews.length} reviews` : 'null')
    if (!result) {
      return NextResponse.json({ rating: 0, totalRatings: 0, reviews: [] })
    }
    return NextResponse.json(result)
  } catch (err) {
    console.error('⭐ [reviews route] feil:', err)
    return NextResponse.json({ rating: 0, totalRatings: 0, reviews: [] })
  }
}
