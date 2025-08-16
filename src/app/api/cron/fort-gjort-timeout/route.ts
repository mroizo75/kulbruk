import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { ensureCronAuthorized } from '@/lib/cron-auth'

export async function GET(request: NextRequest) {
  try {
    // Sjekk cron auth
    const authRes = ensureCronAuthorized(request)
    if (authRes) return authRes

    const now = new Date()
    
    // Finn alle ordrer som har passert approval deadline
    const expiredOrders = await prisma.secureOrder.findMany({
      where: {
        status: {
          in: ['PAYMENT_CONFIRMED', 'SHIPPED', 'DELIVERED']
        },
        approvalDeadline: {
          lt: now
        }
      },
      include: {
        listing: true,
        seller: { include: { sellerStripeAccount: true } },
        buyer: true
      }
    })

    let processedCount = 0
    let errorCount = 0

    for (const order of expiredOrders) {
      try {
        // Overfør penger til selger automatisk
        const sellerAmountInOre = Math.round(order.sellerPayout * 100)
        
        await stripe.transfers.create({
          amount: sellerAmountInOre,
          currency: 'nok',
          destination: order.seller.sellerStripeAccount!.stripeAccountId,
          description: `Fort gjort auto-utbetaling (timeout) - ${order.listing.title}`,
          metadata: {
            orderId: order.id,
            listingId: order.listingId,
            type: 'fort_gjort_timeout_payout'
          }
        })

        // Oppdater ordre status
        await prisma.secureOrder.update({
          where: { id: order.id },
          data: {
            status: 'COMPLETED',
            completedAt: now
          }
        })

        // Legg til status historie
        await prisma.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: 'COMPLETED',
            note: 'Automatisk utbetaling etter utløpt godkjenningsfrist',
            createdBy: 'SYSTEM'
          }
        })

        processedCount++

        // Send varsel til begge parter om automatisk utbetaling
        // TODO: Implementer e-post varsling

      } catch (orderError) {
        console.error(`Feil ved behandling av ordre ${order.id}:`, orderError)
        errorCount++
      }
    }

    // Finn også ordrer som har passert delivery deadline uten å bli sendt
    const unshippedOrders = await prisma.secureOrder.findMany({
      where: {
        status: 'PAYMENT_CONFIRMED',
        deliveryDeadline: {
          lt: now
        }
      },
      include: {
        listing: true,
        buyer: true
      }
    })

    for (const order of unshippedOrders) {
      try {
        // Marker som utløpt og refunder kjøper
        await prisma.secureOrder.update({
          where: { id: order.id },
          data: {
            status: 'EXPIRED'
          }
        })

        await prisma.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: 'EXPIRED',
            note: 'Ordre utløpt - ikke sendt innen fristen',
            createdBy: 'SYSTEM'
          }
        })

        // TODO: Implementer Stripe refund
        // TODO: Send varsel til begge parter

        processedCount++

      } catch (orderError) {
        console.error(`Feil ved utløping av ordre ${order.id}:`, orderError)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fort gjort timeout cron fullført`,
      processed: processedCount,
      errors: errorCount,
      expiredOrdersCount: expiredOrders.length,
      unshippedOrdersCount: unshippedOrders.length
    })

  } catch (error) {
    console.error('Fort gjort timeout cron error:', error)
    return NextResponse.json(
      { error: 'Cron job feilet' },
      { status: 500 }
    )
  }
}
