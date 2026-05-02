import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'
import { getSupportSessionId, logHotelRequest } from '@/lib/support-session-logger'

export async function POST(request: NextRequest) {
  const start = Date.now()
  const supportSessionId = getSupportSessionId(request)

  try {
    console.log('🏨 API: Hotel details request received')

    const body = await request.json()
    const { hotelId, hid, checkIn, checkOut, adults, children, rooms, roomConfigs, currency, residency } = body

    console.log('🏨 API: Request params:', { hotelId, hid, checkIn, checkOut, adults, children, rooms, residency })

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
      children: Array.isArray(children) ? children : [],
      rooms: rooms || 1,
      roomConfigs: Array.isArray(roomConfigs) ? roomConfigs : undefined,
      currency: currency || 'NOK',
      residency: residency || undefined
    })

    if (!result.success) {
      const errRes = { success: false, error: result.error || 'Failed to fetch hotel details' }
      if (supportSessionId) {
        void logHotelRequest({
          supportSessionId,
          path: '/api/hotels/details',
          method: 'POST',
          requestBody: body,
          responseStatus: 500,
          responseBody: errRes,
          durationMs: Date.now() - start,
        })
      }
      return NextResponse.json(errRes, { status: 500 })
    }

    console.log('✅ API: Hotel details fetched successfully')

    const resBody = { success: true, hotel: result.hotel }
    if (supportSessionId) {
      void logHotelRequest({
        supportSessionId,
        path: '/api/hotels/details',
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
    console.error('❌ API: Hotel details error:', error)
    const errRes = { success: false, error: err.message || 'Failed to fetch hotel details', details: err.message }
    if (supportSessionId) {
      void logHotelRequest({
        supportSessionId,
        path: '/api/hotels/details',
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

