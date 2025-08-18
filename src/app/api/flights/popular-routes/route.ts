import { NextRequest, NextResponse } from 'next/server'
import { amadeusClient } from '@/lib/amadeus-client'

// Populære ruter fra norske flyplasser
const POPULAR_ROUTES = [
  { from: 'OSL', fromName: 'Oslo', to: 'LHR', toName: 'London' },
  { from: 'OSL', fromName: 'Oslo', to: 'CPH', toName: 'København' }, 
  { from: 'OSL', fromName: 'Oslo', to: 'ARN', toName: 'Stockholm' },
  { from: 'BGO', fromName: 'Bergen', to: 'LHR', toName: 'London' },
  { from: 'OSL', fromName: 'Oslo', to: 'BCN', toName: 'Barcelona' },
  { from: 'OSL', fromName: 'Oslo', to: 'AMS', toName: 'Amsterdam' },
  { from: 'TRD', fromName: 'Trondheim', to: 'OSL', toName: 'Oslo' },
  { from: 'SVG', fromName: 'Stavanger', to: 'OSL', toName: 'Oslo' }
]

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching popular route prices...')
    
    const results = []
    
    // Hent priser for hver populære rute (begrens til 6 for ytelse)
    for (const route of POPULAR_ROUTES.slice(0, 6)) {
      try {
        console.log(`📡 Checking prices for ${route.fromName} → ${route.toName}`)
        
        // Søk etter billigste pris de neste 30 dagene
        const searchParams = {
          originLocationCode: route.from,
          destinationLocationCode: route.to,
          departureDate: getDateInFuture(7), // 1 uke fram i tid
          returnDate: getDateInFuture(10),   // 3 dager senere
          adults: 1,
          currencyCode: 'NOK'
        }
        
        const searchResult = await amadeusClient.searchFlights(searchParams)
        
        if (searchResult.success && searchResult.data && searchResult.data.length > 0) {
          // Finn billigste pris
          const cheapestOffer = searchResult.data.reduce((min: any, offer: any) => 
            parseFloat(offer.price.total) < parseFloat(min.price.total) ? offer : min
          )
          
          const price = parseFloat(cheapestOffer.price.total)
          
          results.push({
            from: route.fromName,
            to: route.toName,
            code: `${route.from}-${route.to}`,
            price: Math.round(price).toString(),
            formattedPrice: `${Math.round(price).toLocaleString('nb-NO')} kr`,
            currency: 'NOK',
            month: getMonthName(new Date()),
            trend: Math.random() > 0.5 ? 'ned' : 'opp', // Dummy trend for nå
            isLive: true
          })
        } else {
          // Fallback til statisk data hvis API feiler
          results.push({
            from: route.fromName,
            to: route.toName,
            code: `${route.from}-${route.to}`,
            price: '999',
            formattedPrice: '999 kr',
            currency: 'NOK',
            month: getMonthName(new Date()),
            trend: 'ned',
            isLive: false
          })
        }
      } catch (routeError) {
        console.error(`Error fetching ${route.fromName} → ${route.toName}:`, routeError)
        // Legg til fallback-data
        results.push({
          from: route.fromName,
          to: route.toName,
          code: `${route.from}-${route.to}`,
          price: '899',
          formattedPrice: '899 kr',
          currency: 'NOK',
          month: getMonthName(new Date()),
          trend: 'ned',
          isLive: false
        })
      }
    }
    
    console.log(`✅ Popular routes fetched: ${results.length} routes`)
    
    return NextResponse.json({
      success: true,
      routes: results,
      lastUpdated: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Popular routes API error:', error)
    
    // Returnér statiske data som fallback
    const fallbackRoutes = [
      { from: 'Oslo', to: 'London', price: '612', formattedPrice: '612 kr', month: 'oktober 2025', code: 'OSL-LHR', trend: 'ned', isLive: false },
      { from: 'Oslo', to: 'København', price: '889', formattedPrice: '889 kr', month: 'august 2025', code: 'OSL-CPH', trend: 'ned', isLive: false },
      { from: 'Oslo', to: 'Stockholm', price: '959', formattedPrice: '959 kr', month: 'august 2025', code: 'OSL-ARN', trend: 'opp', isLive: false },
      { from: 'Bergen', to: 'London', price: '745', formattedPrice: '745 kr', month: 'september 2025', code: 'BGO-LHR', trend: 'ned', isLive: false },
      { from: 'Oslo', to: 'Barcelona', price: '828', formattedPrice: '828 kr', month: 'mai 2026', code: 'OSL-BCN', trend: 'ned', isLive: false },
      { from: 'Oslo', to: 'Amsterdam', price: '687', formattedPrice: '687 kr', month: 'juni 2025', code: 'OSL-AMS', trend: 'ned', isLive: false }
    ]
    
    return NextResponse.json({
      success: false,
      routes: fallbackRoutes,
      error: 'Using fallback data',
      lastUpdated: new Date().toISOString()
    })
  }
}

// Hjelpefunksjoner
function getDateInFuture(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

function getMonthName(date: Date): string {
  const months = [
    'januar', 'februar', 'mars', 'april', 'mai', 'juni',
    'juli', 'august', 'september', 'oktober', 'november', 'desember'
  ]
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}
