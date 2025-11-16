import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'

export async function POST(request: NextRequest) {
  try {
    console.log('🏨 API: Hotel details request received')

    const body = await request.json()
    const { hotelId, hid, checkIn, checkOut, adults, children, rooms, currency } = body

    console.log('🏨 API: Request params:', { hotelId, hid, checkIn, checkOut, adults, children, rooms })

    if ((!hotelId && !hid) || !checkIn || !checkOut || !adults) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: hotelId/hid, checkIn, checkOut, adults'
      }, { status: 400 })
    }

    // Call RateHawk API for hotel details
    const result = await ratehawkClient.getHotelDetails({
      hotelId,
      hid,
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
        error: result.error || 'Failed to fetch hotel details'
      }, { status: 500 })
    }

    console.log('✅ API: Hotel details fetched successfully')

    return NextResponse.json({
      success: true,
      hotel: result.hotel
    })

  } catch (error: any) {
    console.error('❌ API: Hotel details error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch hotel details',
      details: error.message
    }, { status: 500 })
  }
}

