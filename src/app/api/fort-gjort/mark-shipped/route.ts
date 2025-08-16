import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autentiseret' }, { status: 401 })
    }

    const { orderId, trackingNumber, trackingUrl, shippingMethod } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Mangler orderId' }, { status: 400 })
    }

    // Hent ordre
    const order = await prisma.secureOrder.findUnique({
      where: { id: orderId },
      include: { 
        listing: true,
        buyer: true,
        seller: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Ordre ikke funnet' }, { status: 404 })
    }

    // Sjekk at kun selgeren kan markere som sendt
    if (order.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Kun selgeren kan markere som sendt' }, { status: 403 })
    }

    // Sjekk at ordren kan markeres som sendt
    if (order.status !== 'PAYMENT_CONFIRMED') {
      return NextResponse.json({ 
        error: 'Ordren kan ikke markeres som sendt i denne tilstanden' 
      }, { status: 400 })
    }

    // Sjekk at vi ikke har passert delivery deadline
    if (order.deliveryDeadline && new Date() > order.deliveryDeadline) {
      return NextResponse.json({ 
        error: 'Leveringsfristen har utløpt' 
      }, { status: 400 })
    }

    // Oppdater ordre status
    const updatedOrder = await prisma.secureOrder.update({
      where: { id: orderId },
      data: {
        status: 'SHIPPED',
        shippedAt: new Date(),
        trackingNumber: trackingNumber || null,
        trackingUrl: trackingUrl || null,
        shippingMethod: shippingMethod || null
      }
    })

    // Legg til status historie
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'SHIPPED',
        note: `Vare sendt${trackingNumber ? ` - Sporingsnummer: ${trackingNumber}` : ''}`,
        createdBy: session.user.id
      }
    })

    // Send varsel til kjøper om at varen er sendt
    // TODO: Implementer e-post varsling med sporingsinformasjon

    return NextResponse.json({
      success: true,
      message: 'Ordre markert som sendt',
      order: updatedOrder
    })

  } catch (error) {
    console.error('Fort gjort mark-shipped error:', error)
    return NextResponse.json(
      { error: 'Feil ved marking som sendt' },
      { status: 500 }
    )
  }
}
