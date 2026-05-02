import { NextResponse } from 'next/server'

// Region-IDer og bilder er hardkodet – de endrer seg ikke og sparer ~60 sek lastingstid
// Unsplash photo-IDer er stabile permalenker
const DESTINATIONS = [
  {
    id: '2563',
    name: 'Oslo',
    country: 'Norge',
    hotels: '500+ hoteller',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a5?w=800&h=450&fit=crop&auto=format&q=80',
  },
  {
    id: '1953',
    name: 'København',
    country: 'Danmark',
    hotels: '400+ hoteller',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=450&fit=crop&auto=format&q=80',
  },
  {
    id: '1775',
    name: 'Paris',
    country: 'Frankrike',
    hotels: '3000+ hoteller',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&h=450&fit=crop&auto=format&q=80',
  },
  {
    id: '1869',
    name: 'London',
    country: 'Storbritannia',
    hotels: '2000+ hoteller',
    image: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=800&h=450&fit=crop&auto=format&q=80',
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
