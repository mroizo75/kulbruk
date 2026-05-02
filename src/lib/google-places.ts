import { prisma } from '@/lib/prisma'

const PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place'
const CACHE_TTL_DAYS = 30

export interface PlaceReview {
  author: string
  rating: number
  text: string
  time: number
  relativeTime: string
  language: string
  authorPhotoUrl?: string
}

export interface PlaceResult {
  placeId: string
  rating: number
  totalRatings: number
  reviews: PlaceReview[]
}

async function textSearch(query: string, apiKey: string): Promise<string | null> {
  const url = new URL(`${PLACES_API_BASE}/textsearch/json`)
  url.searchParams.set('query', query)
  url.searchParams.set('type', 'lodging')
  url.searchParams.set('fields', 'place_id')
  url.searchParams.set('key', apiKey)

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) return null

  const data = await res.json()
  if (data.status === 'REQUEST_DENIED') {
    console.error('Google Places API avvist:', data.error_message)
    return null
  }
  if (data.status !== 'OK' || !data.results?.length) return null

  return data.results[0].place_id as string
}

async function placeDetails(placeId: string, apiKey: string): Promise<PlaceResult | null> {
  const url = new URL(`${PLACES_API_BASE}/details/json`)
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields', 'rating,user_ratings_total,reviews')
  url.searchParams.set('language', 'no')
  url.searchParams.set('reviews_sort', 'most_relevant')
  url.searchParams.set('key', apiKey)

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) return null

  const data = await res.json()
  if (data.status !== 'OK' || !data.result) return null

  const r = data.result
  return {
    placeId,
    rating: r.rating ?? 0,
    totalRatings: r.user_ratings_total ?? 0,
    reviews: (r.reviews ?? [])
      .map((rv: any) => ({
        author: rv.author_name ?? 'Anonym',
        rating: rv.rating ?? 0,
        text: rv.text ?? '',
        time: rv.time ?? 0,
        relativeTime: rv.relative_time_description ?? '',
        language: rv.language ?? 'no',
        authorPhotoUrl: rv.profile_photo_url ?? undefined,
      }))
      .filter((rv: PlaceReview) => rv.text.length > 10),
  }
}

export async function getHotelReviews(
  hotelId: string,
  hotelName: string,
  address: string,
): Promise<PlaceResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return null

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - CACHE_TTL_DAYS)

  const cached = await prisma.googlePlacesCache.findUnique({
    where: { hotelId },
  })

  if (cached && cached.fetchedAt > cutoff) {
    return {
      placeId: cached.placeId ?? '',
      rating: cached.rating,
      totalRatings: cached.totalRatings,
      reviews: JSON.parse(cached.reviewsJson) as PlaceReview[],
    }
  }

  const cleanAddress = address && address !== 'Address not available' ? address : ''
  const query = cleanAddress ? `${hotelName} ${cleanAddress}` : `hotel ${hotelName}`

  const placeId = await textSearch(query, apiKey)
  if (!placeId) {
    await prisma.googlePlacesCache.upsert({
      where: { hotelId },
      create: { hotelId, placeId: null, rating: 0, totalRatings: 0, reviewsJson: '[]' },
      update: { placeId: null, rating: 0, totalRatings: 0, reviewsJson: '[]', fetchedAt: new Date() },
    })
    return null
  }

  const result = await placeDetails(placeId, apiKey)
  await prisma.googlePlacesCache.upsert({
    where: { hotelId },
    create: {
      hotelId,
      placeId: result?.placeId ?? placeId,
      rating: result?.rating ?? 0,
      totalRatings: result?.totalRatings ?? 0,
      reviewsJson: JSON.stringify(result?.reviews ?? []),
    },
    update: {
      placeId: result?.placeId ?? placeId,
      rating: result?.rating ?? 0,
      totalRatings: result?.totalRatings ?? 0,
      reviewsJson: JSON.stringify(result?.reviews ?? []),
      fetchedAt: new Date(),
    },
  })

  return result
}
