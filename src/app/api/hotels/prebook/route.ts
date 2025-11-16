import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API: Prebook request received')

    const body = await request.json()
    const { bookHash, checkIn, checkOut, adults, children, rooms, currency } = body

    console.log('🔍 API: Prebook params:', { bookHash, checkIn, checkOut, adults, children, rooms })

    if (!bookHash || !checkIn || !checkOut || !adults) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: bookHash, checkIn, checkOut, adults'
      }, { status: 400 })
    }

    // Call RateHawk API for prebook (rate validation)
    const result = await ratehawkClient.prebookRate({
      bookHash,
      checkIn,
      checkOut,
      adults,
      children: children || 0,
      rooms: rooms || 1,
      currency: currency || 'NOK'
    })

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to prebook rate'
      }, { status: 500 })
    }

    console.log('✅ API: Prebook successful')

    return NextResponse.json({
      success: true,
      prebookData: result.data
    })

  } catch (error: any) {
    console.error('❌ API: Prebook error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to prebook rate',
      details: error.message
    }, { status: 500 })
  }
}

