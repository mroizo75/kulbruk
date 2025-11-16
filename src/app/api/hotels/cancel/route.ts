import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('❌ API: Cancel booking request received')

    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { partnerOrderId } = body

    console.log('❌ API: Cancel booking for:', partnerOrderId)

    if (!partnerOrderId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: partnerOrderId'
      }, { status: 400 })
    }

    // Call RateHawk cancel booking
    const cancelResult = await ratehawkClient.cancelBooking(partnerOrderId)

    if (!cancelResult.success) {
      return NextResponse.json({
        success: false,
        error: cancelResult.error || 'Failed to cancel booking'
      }, { status: 500 })
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

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully'
    })

  } catch (error: any) {
    console.error('❌ API: Cancel booking error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to cancel booking',
      details: error.message
    }, { status: 500 })
  }
}

