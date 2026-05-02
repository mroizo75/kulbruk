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

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({ rating: 0, totalRatings: 0, reviews: [] })
  }

  try {
    const result = await getHotelReviews(hotelId, hotelName, address)
    const payload = result ?? { rating: 0, totalRatings: 0, reviews: [] }

    return NextResponse.json(payload, {
      headers: {
        // Nettleser cacher 24t, CDN cacher 7 dager — matcher DB TTL
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      },
    })
  } catch (err) {
    console.error('[reviews route] feil:', err)
    return NextResponse.json({ rating: 0, totalRatings: 0, reviews: [] })
  }
}
