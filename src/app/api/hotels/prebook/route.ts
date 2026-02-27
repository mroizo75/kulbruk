import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'
import { getSupportSessionId, logHotelRequest } from '@/lib/support-session-logger'

export async function POST(request: NextRequest) {
  const start = Date.now()
  const supportSessionId = getSupportSessionId(request)

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
      const errRes = { success: false, error: result.error || 'Failed to prebook rate' }
      if (supportSessionId) {
        void logHotelRequest({
          supportSessionId,
          path: '/api/hotels/prebook',
          method: 'POST',
          requestBody: body,
          responseStatus: 500,
          responseBody: errRes,
          durationMs: Date.now() - start,
        })
      }
      return NextResponse.json(errRes, { status: 500 })
    }

    console.log('✅ API: Prebook successful')

    const resBody = { success: true, prebookData: result.data }
    if (supportSessionId) {
      void logHotelRequest({
        supportSessionId,
        path: '/api/hotels/prebook',
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
    console.error('❌ API: Prebook error:', error)
    const errRes = { success: false, error: err.message || 'Failed to prebook rate', details: err.message }
    if (supportSessionId) {
      void logHotelRequest({
        supportSessionId,
        path: '/api/hotels/prebook',
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

