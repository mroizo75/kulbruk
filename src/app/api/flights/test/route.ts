import { NextRequest, NextResponse } from 'next/server'
import { amadeusClient } from '@/lib/amadeus-client'

// GET /api/flights/test - Test Amadeus API connection
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Amadeus API connection...')

    // Test 1: Check environment variables
    const hasClientId = !!process.env.FLIGHT_API_KEY
    const hasClientSecret = !!process.env.FLIGHT_API_SECRET

    console.log('Environment check:', {
      FLIGHT_API_KEY: hasClientId ? 'SET' : 'MISSING',
      FLIGHT_API_SECRET: hasClientSecret ? 'SET' : 'MISSING'
    })

    if (!hasClientId || !hasClientSecret) {
      return NextResponse.json({
        success: false,
        error: 'API credentials not configured',
        details: {
          FLIGHT_API_KEY: hasClientId,
          FLIGHT_API_SECRET: hasClientSecret,
          instruction: 'Legg til FLIGHT_API_KEY og FLIGHT_API_SECRET i .env.local filen'
        }
      }, { status: 500 })
    }

    // Test 2: Simple airport search to test API connection
    try {
      const testResult = await amadeusClient.searchAirports('Oslo')
      
      if (testResult.success) {
        return NextResponse.json({
          success: true,
          message: '✅ Amadeus API fungerer!',
          testData: {
            airportCount: testResult.data?.length || 0,
            firstAirport: testResult.data?.[0] || null
          },
          environment: 'test', // Vi bruker test-miljø
          timestamp: new Date().toISOString()
        })
      } else {
        throw new Error(testResult.error || 'Airport search failed')
      }
    } catch (apiError) {
      console.error('Amadeus API test error:', apiError)
      
      return NextResponse.json({
        success: false,
        error: 'Amadeus API connection failed',
        details: {
          message: apiError instanceof Error ? apiError.message : 'Unknown API error',
          suggestion: 'Sjekk at API-nøklene er korrekte og at Amadeus-kontoen er aktiv'
        }
      }, { status: 502 })
    }

  } catch (error) {
    console.error('Flight test error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}

// POST /api/flights/test - Test specific flight search
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { origin = 'OSL', destination = 'CPH' } = body

    console.log(`🧪 Testing flight search: ${origin} → ${destination}`)

    // Bruk en fremtidig dato (minimum 2 dager frem)
    const testDate = new Date()
    testDate.setDate(testDate.getDate() + 7) // 7 dager frem
    const dateString = testDate.toISOString().split('T')[0] // YYYY-MM-DD

    const searchResult = await amadeusClient.searchFlights({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: dateString,
      adults: 1,
      currencyCode: 'NOK',
      max: 5 // Kun 5 resultater for test
    })

    if (searchResult.success) {
      return NextResponse.json({
        success: true,
        message: '✅ Flight search test successful!',
        testParams: { origin, destination },
        resultCount: searchResult.data?.length || 0,
        firstOffer: searchResult.data?.[0] || null,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Flight search test failed',
        details: searchResult.error
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Flight search test error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Flight search test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
