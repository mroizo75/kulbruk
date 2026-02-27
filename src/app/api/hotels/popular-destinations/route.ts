import { NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'

const DESTINATIONS = [
  { id: '2563', name: 'Oslo', country: 'Norge', hotels: '500+ hoteller' },
  { id: '1953', name: 'København', country: 'Danmark', hotels: '400+ hoteller' },
  { id: '1775', name: 'Paris', country: 'Frankrike', hotels: '3000+ hoteller' },
  { id: '1869', name: 'London', country: 'Storbritannia', hotels: '2000+ hoteller' },
] as const

const PLACEHOLDER_SVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450"%3E%3Crect fill="%23e5e7eb" width="800" height="450"/%3E%3Ctext fill="%239ca3af" font-family="system-ui" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E' + encodeURIComponent('Ingen bilde') + '%3C/text%3E%3C/svg%3E'

const CACHE_MS = 60 * 60 * 1000 // 1 time
let cache: { data: Awaited<ReturnType<typeof fetchDestinationsWithImages>>; timestamp: number } | null = null

async function fetchDestinationsWithImages() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter = new Date(tomorrow)
  dayAfter.setDate(dayAfter.getDate() + 1)
  const checkIn = tomorrow.toISOString().split('T')[0]
  const checkOut = dayAfter.toISOString().split('T')[0]

  const results = await Promise.allSettled(
    DESTINATIONS.map(async (dest) => {
      try {
        const result = await ratehawkClient.searchHotels(
          {
            destination: dest.id,
            checkIn,
            checkOut,
            adults: 2,
            children: [],
            rooms: 1,
            currency: 'NOK',
          },
          null
        )
        const firstWithImage = result.hotels?.find((h) => h.image && !h.image.startsWith('data:image/svg'))
        return {
          ...dest,
          image: firstWithImage?.image || PLACEHOLDER_SVG,
        }
      } catch {
        return { ...dest, image: PLACEHOLDER_SVG }
      }
    })
  )

  return results.map((r, i) => (r.status === 'fulfilled' ? r.value : { ...DESTINATIONS[i], image: PLACEHOLDER_SVG }))
}

export async function GET() {
  const now = Date.now()
  if (cache && now - cache.timestamp < CACHE_MS) {
    return NextResponse.json({ success: true, destinations: cache.data })
  }

  try {
    const data = await fetchDestinationsWithImages()
    cache = { data, timestamp: now }
    return NextResponse.json({ success: true, destinations: data })
  } catch (error) {
    const fallback = DESTINATIONS.map((d) => ({ ...d, image: PLACEHOLDER_SVG }))
    return NextResponse.json({ success: true, destinations: fallback })
  }
}
