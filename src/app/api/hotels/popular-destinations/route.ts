import { NextResponse } from 'next/server'

// Region-IDer og bilder er hardkodet – de endrer seg ikke og sparer ~60 sek lastingstid
// Unsplash photo-IDer er stabile permalenker
const DESTINATIONS = [
  {
    id: '2563',
    name: 'Oslo',
    country: 'Norge',
    hotels: '500+ hoteller',
    // Modern buildings in Oslo – havn og skyline (verifisert Unsplash)
    image: 'https://images.unsplash.com/photo-1664487235579-251b3541dd5d?w=800&h=450&fit=crop&auto=format&q=80',
  },
  {
    id: '1953',
    name: 'København',
    country: 'Danmark',
    hotels: '400+ hoteller',
    // Nyhavn-kanalen, København (verifisert Unsplash)
    image: 'https://images.unsplash.com/photo-1526662075745-edd1c71a4cff?w=800&h=450&fit=crop&auto=format&q=80',
  },
  {
    id: '1775',
    name: 'Paris',
    country: 'Frankrike',
    hotels: '3000+ hoteller',
    // Eiffeltårnet med bybilde, Paris (verifisert Unsplash)
    image: 'https://images.unsplash.com/photo-1492136344046-866c85e0bf04?w=800&h=450&fit=crop&auto=format&q=80',
  },
  {
    id: '1869',
    name: 'London',
    country: 'Storbritannia',
    hotels: '2000+ hoteller',
    // Big Ben, London (verifisert Unsplash)
    image: 'https://images.unsplash.com/photo-1454793147212-9e7e57e89a4f?w=800&h=450&fit=crop&auto=format&q=80',
  },
]

export async function GET() {
  return NextResponse.json(
    { success: true, destinations: DESTINATIONS },
    {
      headers: {
        // Nettleser cacher 1 dag, CDN cacher 30 dager
        'Cache-Control': 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400',
      },
    },
  )
}
