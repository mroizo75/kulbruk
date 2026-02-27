import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'
import { getSupportSessionId, logHotelRequest } from '@/lib/support-session-logger'

export async function GET(request: NextRequest) {
  const start = Date.now()
  const supportSessionId = getSupportSessionId(request)

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

    const resBody = { success: true, destinations: destinations || [] }
    if (supportSessionId) {
      void logHotelRequest({
        supportSessionId,
        path: '/api/hotels/destinations',
        method: 'GET',
        requestBody: { q },
        responseStatus: 200,
        responseBody: resBody,
        durationMs: Date.now() - start,
      })
    }
    return NextResponse.json(resBody)

  } catch (error: unknown) {
    const err = error as { message?: string; name?: string }
    console.error('❌ API: Destination search error:', {
      message: err.message,
      name: err.name,
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
    const fallbackRes = {
      success: true,
      destinations: fallbackDestinations,
      _fallback: true,
      _error: process.env.NODE_ENV === 'development' ? err.message : 'Using fallback destinations',
    }
    if (supportSessionId) {
      void logHotelRequest({
        supportSessionId,
        path: '/api/hotels/destinations',
        method: 'GET',
        requestBody: null,
        responseStatus: 200,
        responseBody: fallbackRes,
        durationMs: Date.now() - start,
      })
    }
    return NextResponse.json(fallbackRes, { status: 200 }) // Return 200 med fallback i stedet for 500
  }
}
