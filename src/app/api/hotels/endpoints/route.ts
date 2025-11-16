import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const test = searchParams.get('test')

    if (test === 'multicomplete') {
      console.log('🧪 API: Testing multicomplete endpoint')
      const result = await ratehawkClient.testMulticomplete()
      return NextResponse.json({
        success: true,
        test: 'multicomplete',
        data: result
      })
    }

    if (test === 'regiondump') {
      console.log('🧪 API: Testing region dump endpoint')
      const result = await ratehawkClient.testRegionDump()
      return NextResponse.json({
        success: true,
        test: 'regiondump',
        data: result
      })
    }

    console.log('🏨 API: Getting available RateHawk endpoints')

    const endpoints = await ratehawkClient.getAvailableEndpoints()

    if (!endpoints) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get endpoints'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      endpoints: endpoints
    })

  } catch (error: any) {
    console.error('❌ API: Get endpoints error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get endpoints',
      details: error.message
    }, { status: 500 })
  }
}
