import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    console.log('📍 API: Destination search:', query)
    console.log('📍 Environment check:', {
      nodeEnv: process.env.NODE_ENV,
      hasRatehawkKeyId: !!process.env.RATEHAWK_KEY_ID,
      hasRatehawkApiKey: !!process.env.RATEHAWK_API_KEY,
      ratehawkBaseUrl: process.env.RATEHAWK_BASE_URL
    })

    // Hent destinasjoner fra RateHawk (inkludert når query er tom - får populære destinasjoner)
    const destinations = await ratehawkClient.searchDestinations(query)

    console.log('📍 API: Found destinations:', destinations?.length || 0)

    return NextResponse.json({
      success: true,
      destinations: destinations || []
    })

  } catch (error: any) {
    console.error('❌ API: Destination search error:', {
      message: error.message,
      name: error.name,
      hasCredentials: {
        keyId: !!process.env.RATEHAWK_KEY_ID,
        apiKey: !!process.env.RATEHAWK_API_KEY
      }
    })
    
    // I production: Returner fallback destinasjoner i stedet for tom liste
    const fallbackDestinations = [
      { id: '2563', name: 'Oslo, Norway', type: 'city', country: 'Norway' },
      { id: '1953', name: 'Copenhagen, Denmark', type: 'city', country: 'Denmark' },
      { id: '1382', name: 'Berlin, Germany', type: 'city', country: 'Germany' },
      { id: '1775', name: 'Paris, France', type: 'city', country: 'France' },
      { id: '1869', name: 'London, United Kingdom', type: 'city', country: 'UK' },
      { id: '1783', name: 'Amsterdam, Netherlands', type: 'city', country: 'Netherlands' },
      { id: '8473727', name: 'Test Hotel Do Not Book', type: 'hotel', country: 'Test' }
    ]
    
    return NextResponse.json(
      {
        success: true,
        destinations: fallbackDestinations,
        _fallback: true,
        _error: process.env.NODE_ENV === 'development' ? error.message : 'Using fallback destinations'
      },
      { status: 200 } // Return 200 med fallback i stedet for 500
    )
  }
}
