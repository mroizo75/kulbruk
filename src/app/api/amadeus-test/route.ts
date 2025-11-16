import { NextRequest, NextResponse } from 'next/server'
import { amadeusClient } from '@/lib/amadeus-client'

// Test endpoint for Amadeus API
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Amadeus API connection...')

    // Test 1: Basic airport search
    const testResult = await amadeusClient.searchAirports('OSL')

    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Amadeus API connection successful!',
        data: testResult.data?.slice(0, 3), // Return first 3 results
        count: testResult.data?.length || 0
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Amadeus API connection failed',
        error: testResult.error
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({
      success: false,
      message: 'Test endpoint failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
