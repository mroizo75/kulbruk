import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Verifiser webhook signature fra RateHawk
function verifySignature(apiKey: string, token: string, timestamp: number, signature: string): boolean {
  const hmacDigest = crypto
    .createHmac('sha256', apiKey)
    .update(timestamp.toString() + token)
    .digest('hex')
  
  return hmacDigest === signature
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 RateHawk webhook received')

    const body = await request.json()
    console.log('🔔 Webhook payload:', JSON.stringify(body, null, 2))

    const { data, signature: signatureData } = body

    // Verifiser signature
    const apiKey = process.env.RATEHAWK_API_KEY!
    const isValid = verifySignature(
      apiKey,
      signatureData.token,
      signatureData.timestamp,
      signatureData.signature
    )

    if (!isValid) {
      console.error('❌ Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    console.log('✅ Webhook signature verified')

    // Sjekk timestamp (ikke eldre enn 15 sekunder)
    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - signatureData.timestamp) > 15) {
      console.error('❌ Webhook timestamp too old')
      return NextResponse.json({ error: 'Timestamp expired' }, { status: 400 })
    }

    const { partner_order_id, status } = data

    console.log(`🔔 Webhook status for ${partner_order_id}: ${status}`)

    // Oppdater booking i database
    if (status === 'completed') {
      // Hent det faktiske order_id fra RateHawk
      const { ratehawkClient } = await import('@/lib/ratehawk-client')
      const bookingDetails = await ratehawkClient.retrieveBookings(partner_order_id)

      if (bookingDetails.success && bookingDetails.booking) {
        const actualOrderId = bookingDetails.booking.order_id

        await prisma.hotelBooking.updateMany({
          where: {
            confirmationCode: partner_order_id
          },
          data: {
            bookingId: actualOrderId.toString(),
            status: 'confirmed'
          }
        })

        console.log('✅ Booking confirmed via webhook:', partner_order_id, 'order_id:', actualOrderId)
      } else {
        // Fallback hvis vi ikke kan hente order_id
        await prisma.hotelBooking.updateMany({
          where: {
            confirmationCode: partner_order_id
          },
          data: {
            status: 'confirmed'
          }
        })

        console.log('✅ Booking confirmed (no order_id):', partner_order_id)
      }
    } else if (status === 'failed') {
      await prisma.hotelBooking.updateMany({
        where: {
          confirmationCode: partner_order_id
        },
        data: {
          status: 'failed'
        }
      })

      console.log('❌ Booking failed via webhook:', partner_order_id)
    }

    // Returner 200 for å bekrefte mottak
    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error: any) {
    console.error('❌ Webhook error:', error)
    // Returner 500 for å trigge retry fra RateHawk
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

