import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autentiseret' }, { status: 401 })
    }

    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Mangler orderId' }, { status: 400 })
    }

    // Hent ordre med full info
    const order = await prisma.secureOrder.findUnique({
      where: { id: orderId },
      include: { 
        listing: true,
        buyer: true,
        seller: { include: { sellerStripeAccount: true } }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Ordre ikke funnet' }, { status: 404 })
    }

    // Sjekk at kun kjøperen kan godkjenne
    if (order.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Kun kjøperen kan godkjenne ordren' }, { status: 403 })
    }

    // Sjekk at ordren kan godkjennes
    if (order.status !== 'PAYMENT_CONFIRMED' && order.status !== 'SHIPPED' && order.status !== 'DELIVERED') {
      return NextResponse.json({ 
        error: 'Ordren kan ikke godkjennes i denne tilstanden' 
      }, { status: 400 })
    }

    // Sjekk at vi ikke har passert approval deadline
    if (order.approvalDeadline && new Date() > order.approvalDeadline) {
      return NextResponse.json({ 
        error: 'Godkjenningsfristen har utløpt' 
      }, { status: 400 })
    }

    // Overfør penger til selger via Stripe Connect
    const sellerAmountInOre = Math.round(order.sellerPayout * 100)
    
    try {
      await stripe.transfers.create({
        amount: sellerAmountInOre,
        currency: 'nok',
        destination: order.seller.sellerStripeAccount!.stripeAccountId,
        description: `Fort gjort utbetaling - ${order.listing.title}`,
        metadata: {
          orderId: order.id,
          listingId: order.listingId,
          type: 'fort_gjort_payout'
        }
      })
    } catch (stripeError: any) {
      console.error('Stripe transfer error:', stripeError)
      return NextResponse.json({ 
        error: 'Feil ved overføring av penger til selger' 
      }, { status: 500 })
    }

    // Oppdater ordre status
    const updatedOrder = await prisma.secureOrder.update({
      where: { id: orderId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        completedAt: new Date()
      }
    })

    // Legg til status historie
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'APPROVED',
        note: 'Ordre godkjent av kjøper - penger overført til selger',
        createdBy: session.user.id
      }
    })

    // Send varsel til selger om godkjenning og utbetaling
    // TODO: Implementer e-post varsling

    return NextResponse.json({
      success: true,
      message: 'Ordre godkjent og penger overført til selger',
      order: updatedOrder
    })

  } catch (error) {
    console.error('Fort gjort approve error:', error)
    return NextResponse.json(
      { error: 'Feil ved godkjenning av ordre' },
      { status: 500 }
    )
  }
}
