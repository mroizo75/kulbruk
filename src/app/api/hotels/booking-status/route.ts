import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'
import { getSupportSessionId, logHotelRequest } from '@/lib/support-session-logger'

export async function POST(request: NextRequest) {
  const start = Date.now()
  const supportSessionId = getSupportSessionId(request)

  try {
    console.log('🔍 API: Check booking status request received')

    const body = await request.json()
    const { partnerOrderId } = body

    console.log('🔍 API: Checking status for:', partnerOrderId)

    if (!partnerOrderId) {
      const errRes = { success: false, error: 'Missing required parameter: partnerOrderId' }
      if (supportSessionId) {
        void logHotelRequest({
          supportSessionId,
          path: '/api/hotels/booking-status',
          method: 'POST',
          requestBody: body,
          responseStatus: 400,
          responseBody: errRes,
          durationMs: Date.now() - start,
        })
      }
      return NextResponse.json(errRes, { status: 400 })
    }

    // Call RateHawk check booking status
    const statusResult = await ratehawkClient.checkBookingStatus(partnerOrderId)

    if (!statusResult.success && statusResult.status === 'error') {
      const errRes = { success: false, error: statusResult.error || 'Failed to check booking status' }
      if (supportSessionId) {
        void logHotelRequest({
          supportSessionId,
          path: '/api/hotels/booking-status',
          method: 'POST',
          requestBody: body,
          responseStatus: 500,
          responseBody: errRes,
          durationMs: Date.now() - start,
        })
      }
      return NextResponse.json(errRes, { status: 500 })
    }

    console.log('✅ API: Booking status checked:', statusResult.status)

    const resBody = {
      success: true,
      status: statusResult.status,
      data: statusResult.data,
      error: statusResult.error,
      requires3DS: statusResult.status === '3ds',
      data3DS: statusResult.data?.data_3ds,
    }
    if (supportSessionId) {
      void logHotelRequest({
        supportSessionId,
        path: '/api/hotels/booking-status',
        method: 'POST',
        requestBody: body,
        responseStatus: 200,
        responseBody: resBody,
        durationMs: Date.now() - start,
      })
    }
    return NextResponse.json(resBody)
  } catch (error: unknown) {
    const err = error as { message?: string }
    console.error('❌ API: Check booking status error:', error)
    const errRes = { success: false, error: err.message || 'Failed to check booking status', details: err.message }
    if (supportSessionId) {
      void logHotelRequest({
        supportSessionId,
        path: '/api/hotels/booking-status',
        method: 'POST',
        requestBody: null,
        responseStatus: 500,
        responseBody: errRes,
        durationMs: Date.now() - start,
      })
    }
    return NextResponse.json(errRes, { status: 500 })
  }
}

