import { NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'

// Søkenavn brukt for å slå opp korrekt region-ID via multicomplete
const DESTINATIONS = [
  { query: 'Oslo', name: 'Oslo', country: 'Norge', hotels: '500+ hoteller' },
  { query: 'Copenhagen', name: 'København', country: 'Danmark', hotels: '400+ hoteller' },
  { query: 'Paris', name: 'Paris', country: 'Frankrike', hotels: '3000+ hoteller' },
  { query: 'London', name: 'London', country: 'Storbritannia', hotels: '2000+ hoteller' },
]

const PLACEHOLDER_SVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450"%3E%3Crect fill="%23e5e7eb" width="800" height="450"/%3E%3Ctext fill="%239ca3af" font-family="system-ui" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E' + encodeURIComponent('Ingen bilde') + '%3C/text%3E%3C/svg%3E'

const CACHE_MS = 60 * 60 * 1000 // 1 time
let cache: { data: DestinationResult[]; timestamp: number } | null = null

interface DestinationResult {
  id: string
  name: string
  country: string
  hotels: string
  image: string
}

async function resolveRegionId(query: string): Promise<string | null> {
  try {
    const suggestions = await ratehawkClient.searchDestinations(query)
    // Finn første region/city-resultat (ikke hotel)
    const region = suggestions.find((s: any) => s.type !== 'hotel')
    if (region?.id) {
      console.log(`📍 Resolved "${query}" → region id ${region.id} (${region.name})`)
      return region.id.toString()
    }
    return null
  } catch {
    return null
  }
}

async function fetchDestinationsWithImages(): Promise<DestinationResult[]> {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter = new Date(tomorrow)
  dayAfter.setDate(dayAfter.getDate() + 1)
  const checkIn = tomorrow.toISOString().split('T')[0]
  const checkOut = dayAfter.toISOString().split('T')[0]

  // Prosesser én destinasjon om gangen for å unngå å sprenge rate-limit (30 req/60s)
  const destinations: DestinationResult[] = []
  for (const dest of DESTINATIONS) {
    const regionId = await resolveRegionId(dest.query)
    if (!regionId) {
      console.warn(`⚠️ Kunne ikke finne region-ID for "${dest.query}"`)
      destinations.push({ ...dest, id: '', image: PLACEHOLDER_SVG })
      continue
    }

    try {
      // Hent kun ett bilde for destinasjonskortet – maks 5 /hotel/info/-kall
      const image = await ratehawkClient.getRegionPreviewImage(regionId, checkIn, checkOut)
      destinations.push({ ...dest, id: regionId, image: image || PLACEHOLDER_SVG })
    } catch {
      destinations.push({ ...dest, id: regionId, image: PLACEHOLDER_SVG })
    }
  }
  return destinations
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
  } catch {
    const fallback = DESTINATIONS.map((d) => ({ ...d, id: '', image: PLACEHOLDER_SVG }))
    return NextResponse.json({ success: true, destinations: fallback })
  }
}
