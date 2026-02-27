import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'
import { getSupportSessionId, logHotelRequest } from '@/lib/support-session-logger'

export async function POST(request: NextRequest) {
  const start = Date.now()
  const supportSessionId = getSupportSessionId(request)

  try {
    console.log('💰 API: Get cancellation penalties request received')

    const body = await request.json()
    const { partnerOrderId } = body

    console.log('💰 API: Get penalties for:', partnerOrderId)

    if (!partnerOrderId) {
      const errRes = { success: false, error: 'Missing required parameter: partnerOrderId' }
      if (supportSessionId) {
        void logHotelRequest({
          supportSessionId,
          path: '/api/hotels/cancellation-penalties',
          method: 'POST',
          requestBody: body,
          responseStatus: 400,
          responseBody: errRes,
          durationMs: Date.now() - start,
        })
      }
      return NextResponse.json(errRes, { status: 400 })
    }

    // Hent cancellation penalties
    const result = await ratehawkClient.getCancellationPenalties(partnerOrderId)

    if (!result.success) {
      const errRes = { success: false, error: result.error || 'Failed to get cancellation penalties' }
      if (supportSessionId) {
        void logHotelRequest({
          supportSessionId,
          path: '/api/hotels/cancellation-penalties',
          method: 'POST',
          requestBody: body,
          responseStatus: 500,
          responseBody: errRes,
          durationMs: Date.now() - start,
        })
      }
      return NextResponse.json(errRes, { status: 500 })
    }

    console.log('✅ API: Cancellation penalties retrieved')

    const resBody = { success: true, penalties: result.penalties, orderInfo: result.orderInfo }
    if (supportSessionId) {
      void logHotelRequest({
        supportSessionId,
        path: '/api/hotels/cancellation-penalties',
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
    console.error('❌ API: Get cancellation penalties error:', error)
    const errRes = { success: false, error: err.message || 'Failed to get cancellation penalties', details: err.message }
    if (supportSessionId) {
      void logHotelRequest({
        supportSessionId,
        path: '/api/hotels/cancellation-penalties',
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

