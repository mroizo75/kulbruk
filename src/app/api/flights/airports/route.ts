import { NextRequest, NextResponse } from 'next/server'
import { amadeusClient, NORWEGIAN_AIRPORTS, POPULAR_DESTINATIONS } from '@/lib/amadeus-client'

// GET /api/flights/airports - Søk flyplasser
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get('search')

    if (!keyword) {
      // Returner forhåndsdefinerte norske flyplasser og populære destinasjoner
      const airports = [
        ...Object.values(NORWEGIAN_AIRPORTS).map(airport => ({
          ...airport,
          type: 'domestic',
          iataCode: airport.code,
          name: airport.name,
          city: airport.city,
          country: 'Norge'
        })),
        ...Object.values(POPULAR_DESTINATIONS).map(dest => ({
          ...dest,
          type: 'international',
          iataCode: dest.code,
          name: dest.name,
          city: dest.city,
          country: dest.country
        }))
      ]

      return NextResponse.json({
        success: true,
        airports,
        message: `Returnerer ${airports.length} forhåndsdefinerte flyplasser`
      })
    }

    // Søk via Amadeus API
    const searchResult = await amadeusClient.searchAirports(keyword)

    if (!searchResult.success) {
      console.error('Amadeus Airport Search feil:', searchResult.error)
      
      // Fallback: søk i forhåndsdefinerte flyplasser
      const allAirports = [
        ...Object.values(NORWEGIAN_AIRPORTS),
        ...Object.values(POPULAR_DESTINATIONS)
      ]
      
      const filteredAirports = allAirports.filter(airport => 
        airport.name.toLowerCase().includes(keyword.toLowerCase()) ||
        airport.city.toLowerCase().includes(keyword.toLowerCase()) ||
        airport.code.toLowerCase().includes(keyword.toLowerCase())
      )

      return NextResponse.json({
        success: true,
        airports: filteredAirports.map(airport => ({
          iataCode: airport.code,
          name: airport.name,
          city: airport.city,
          country: 'country' in airport ? airport.country : 'Norge',
          type: 'country' in airport ? 'international' : 'domestic'
        })),
        fallback: true,
        message: `Fant ${filteredAirports.length} flyplasser (lokal søk)`
      })
    }

    // Prosesser Amadeus-resultater
    const processedAirports = searchResult.data?.map((location: any) => ({
      iataCode: location.iataCode,
      name: location.name,
      city: location.address?.cityName,
      country: location.address?.countryName,
      type: 'api'
    })) || []

    return NextResponse.json({
      success: true,
      airports: processedAirports,
      message: `Fant ${processedAirports.length} flyplasser via Amadeus API`
    })

  } catch (error) {
    console.error('Airport Search API feil:', error)
    return NextResponse.json(
      { error: 'Kunne ikke søke etter flyplasser' },
      { status: 500 }
    )
  }
}
