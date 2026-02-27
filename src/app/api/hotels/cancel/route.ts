import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSupportSessionId, logHotelRequest } from '@/lib/support-session-logger'

export async function POST(request: NextRequest) {
  const start = Date.now()
  const supportSessionId = getSupportSessionId(request)

  try {
    console.log('❌ API: Cancel booking request received')

    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { partnerOrderId } = body

    console.log('❌ API: Cancel booking for:', partnerOrderId)

    if (!partnerOrderId) {
      const errRes = { success: false, error: 'Missing required parameter: partnerOrderId' }
      if (supportSessionId) {
        void logHotelRequest({
          supportSessionId,
          path: '/api/hotels/cancel',
          method: 'POST',
          requestBody: body,
          responseStatus: 400,
          responseBody: errRes,
          durationMs: Date.now() - start,
        })
      }
      return NextResponse.json(errRes, { status: 400 })
    }

    // Call RateHawk cancel booking
    const cancelResult = await ratehawkClient.cancelBooking(partnerOrderId)

    if (!cancelResult.success) {
      const errRes = { success: false, error: cancelResult.error || 'Failed to cancel booking' }
      if (supportSessionId) {
        void logHotelRequest({
          supportSessionId,
          path: '/api/hotels/cancel',
          method: 'POST',
          requestBody: body,
          responseStatus: 500,
          responseBody: errRes,
          durationMs: Date.now() - start,
        })
      }
      return NextResponse.json(errRes, { status: 500 })
    }

    // Oppdater booking status i database
    if (session?.user?.id) {
      await prisma.hotelBooking.updateMany({
        where: {
          confirmationCode: partnerOrderId,
          userId: session.user.id
        },
        data: {
          status: 'cancelled'
        }
      })
    }

    console.log('✅ API: Booking cancelled successfully')

    const resBody = { success: true, message: 'Booking cancelled successfully' }
    if (supportSessionId) {
      void logHotelRequest({
        supportSessionId,
        path: '/api/hotels/cancel',
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
    console.error('❌ API: Cancel booking error:', error)
    const errRes = { success: false, error: err.message || 'Failed to cancel booking', details: err.message }
    if (supportSessionId) {
      void logHotelRequest({
        supportSessionId,
        path: '/api/hotels/cancel',
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

