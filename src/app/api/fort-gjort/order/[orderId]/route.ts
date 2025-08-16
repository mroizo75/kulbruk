import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autentiseret' }, { status: 401 })
    }

    const { orderId } = await params

    const order = await prisma.secureOrder.findUnique({
      where: { id: orderId },
      include: {
        listing: {
          include: {
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            category: true
          }
        },
        buyer: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        seller: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Ordre ikke funnet' }, { status: 404 })
    }

    // Sjekk at brukeren har tilgang til denne ordren
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!user || (user.id !== order.buyerId && user.id !== order.sellerId)) {
      return NextResponse.json({ error: 'Ingen tilgang til denne ordren' }, { status: 403 })
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
      itemPrice: order.itemPrice,
      kulbrukFee: order.kulbrukFee,
      totalAmount: order.totalAmount,
      sellerPayout: order.sellerPayout,
      createdAt: order.createdAt,
      listing: {
        id: order.listing.id,
        title: order.listing.title,
        location: order.listing.location,
        images: order.listing.images
      },
      buyer: order.buyer,
      seller: order.seller,
      isUserBuyer: user.id === order.buyerId,
      isUserSeller: user.id === order.sellerId
    })

  } catch (error) {
    console.error('Fort gjort order fetch error:', error)
    return NextResponse.json(
      { error: 'Feil ved henting av ordre detaljer' },
      { status: 500 }
    )
  }
}
