const PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place'

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
  // Inkluder place_id i fields så vi slipper ekstra runde-trip
  url.searchParams.set('fields', 'place_id')
  url.searchParams.set('key', apiKey)

  console.log('⭐ Google textSearch URL (uten key):', url.toString().replace(apiKey, '***'))

  // Ikke cache – vi vil alltid ha ferske resultater
  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    console.warn('⭐ Google textSearch HTTP error:', res.status, await res.text())
    return null
  }

  const data = await res.json()
  console.log('⭐ Google textSearch status:', data.status, '| results:', data.results?.length ?? 0, '| error:', data.error_message ?? 'none')
  if (data.status === 'REQUEST_DENIED') {
    console.error('⭐ Google Places API avvist – sjekk at Places API er aktivert og fakturering er satt opp:', data.error_message)
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
  if (!res.ok) {
    console.warn('⭐ Google placeDetails HTTP error:', res.status)
    return null
  }

  const data = await res.json()
  console.log('⭐ Google placeDetails status:', data.status, '| rating:', data.result?.rating, '| reviews:', data.result?.reviews?.length ?? 0, '| error:', data.error_message ?? 'none')
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

// Modulnivå-cache: hotelId → PlaceResult (lever så lenge prosessen kjører)
const cache = new Map<string, PlaceResult | null>()

export async function getHotelReviews(
  hotelId: string,
  hotelName: string,
  address: string,
): Promise<PlaceResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    console.warn('⭐ GOOGLE_PLACES_API_KEY er ikke satt')
    return null
  }

  if (cache.has(hotelId)) {
    console.log('⭐ Cache-treff for hotelId:', hotelId)
    return cache.get(hotelId)!
  }

  // Bygg en spesifikk søkestreng: hotellnavn + adresse gir best treff
  const cleanAddress = address && address !== 'Address not available' ? address : ''
  const query = cleanAddress ? `${hotelName} ${cleanAddress}` : `hotel ${hotelName}`
  console.log('⭐ Google Places søk:', query)

  const placeId = await textSearch(query, apiKey)
  console.log('⭐ Google Places placeId:', placeId)
  if (!placeId) {
    cache.set(hotelId, null)
    return null
  }

  const result = await placeDetails(placeId, apiKey)
  console.log('⭐ Google Places resultat:', result ? `rating ${result.rating}, ${result.reviews.length} anmeldelser, totalt ${result.totalRatings}` : 'null')
  cache.set(hotelId, result)
  return result
}
