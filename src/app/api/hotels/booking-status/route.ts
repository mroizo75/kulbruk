import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API: Check booking status request received')

    const body = await request.json()
    const { partnerOrderId } = body

    console.log('🔍 API: Checking status for:', partnerOrderId)

    if (!partnerOrderId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: partnerOrderId'
      }, { status: 400 })
    }

    // Call RateHawk check booking status
    const statusResult = await ratehawkClient.checkBookingStatus(partnerOrderId)

    if (!statusResult.success && statusResult.status === 'error') {
      return NextResponse.json({
        success: false,
        error: statusResult.error || 'Failed to check booking status'
      }, { status: 500 })
    }

    console.log('✅ API: Booking status checked:', statusResult.status)

    return NextResponse.json({
      success: true,
      status: statusResult.status,
      data: statusResult.data,
      error: statusResult.error,
      requires3DS: statusResult.status === '3ds',
      data3DS: statusResult.data?.data_3ds
    })

  } catch (error: any) {
    console.error('❌ API: Check booking status error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check booking status',
      details: error.message
    }, { status: 500 })
  }
}

