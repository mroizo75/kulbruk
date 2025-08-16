import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { calculateFortGjortFee, calculateSellerPayout } from '@/lib/fort-gjort'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autentiseret' }, { status: 401 })
    }

    const { listingId } = await request.json()

    if (!listingId) {
      return NextResponse.json({ error: 'Mangler listingId' }, { status: 400 })
    }

    // Hent listing med seller info
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { 
        user: { 
          include: { sellerStripeAccount: true }
        }
      }
    })

    if (!listing) {
      return NextResponse.json({ error: 'Annonse ikke funnet' }, { status: 404 })
    }

    if (!listing.enableFortGjort) {
      return NextResponse.json({ error: 'Fort gjort ikke aktivert for denne annonsen' }, { status: 400 })
    }

    if (listing.userId === session.user.id) {
      return NextResponse.json({ error: 'Du kan ikke kjøpe din egen annonse' }, { status: 400 })
    }

    // Sjekk at selger har Stripe Connect konto
    if (!listing.user.sellerStripeAccount?.onboardingCompleted) {
      return NextResponse.json({ 
        error: 'Selger har ikke fullført Stripe Connect onboarding' 
      }, { status: 400 })
    }

    const buyer = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!buyer) {
      return NextResponse.json({ error: 'Kjøper ikke funnet' }, { status: 404 })
    }

    // Beregn priser
    const priceInOre = Math.round(listing.price * 100)
    const kulbrukFee = calculateFortGjortFee(priceInOre)
    const totalAmount = priceInOre + kulbrukFee
    const sellerPayout = calculateSellerPayout(priceInOre)
    
    // Beregn deadlines
    const now = new Date()
    const deliveryDeadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 dager til levering
    const approvalDeadline = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 dager total for godkjenning

    // Opprett Payment Intent som holder pengene på platform account
    // Pengene vil bli overført til selger når kjøper godkjenner eller ved timeout
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'nok',
      description: `Fort gjort kjøp - ${listing.title}`,
      metadata: {
        type: 'fort_gjort',
        listingId: listing.id,
        buyerId: buyer.id,
        sellerId: listing.userId,
        sellerStripeAccountId: listing.user.sellerStripeAccount.stripeAccountId,
        itemPrice: priceInOre.toString(),
        kulbrukFee: kulbrukFee.toString(),
        sellerPayout: sellerPayout.toString(),
        deliveryDeadline: deliveryDeadline.toISOString(),
        approvalDeadline: approvalDeadline.toISOString()
      },
      // KRITISK: Ikke bruk transfer_data eller on_behalf_of
      // Pengene holdes på platform account til manuell transfer
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      payment_method_options: {
        card: {
          setup_future_usage: 'off_session'
        }
      }
    })

    // Opprett SecureOrder i database med deadlines
    const secureOrder = await prisma.secureOrder.create({
      data: {
        buyerId: buyer.id,
        sellerId: listing.userId,
        listingId: listing.id,
        stripePaymentIntentId: paymentIntent.id,
        sellerStripeAccountId: listing.user.sellerStripeAccount.stripeAccountId,
        itemPrice: listing.price,
        kulbrukFee: kulbrukFee / 100, // Konverter til kroner
        totalAmount: totalAmount / 100,
        sellerPayout: sellerPayout / 100,
        status: 'PAYMENT_PENDING',
        deliveryDeadline: deliveryDeadline,
        approvalDeadline: approvalDeadline
      }
    })

    // Log status historie
    await prisma.orderStatusHistory.create({
      data: {
        orderId: secureOrder.id,
        status: 'PAYMENT_PENDING',
        note: 'Fort gjort ordre opprettet',
        createdBy: buyer.id
      }
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: secureOrder.id,
      totalAmount: totalAmount / 100,
      kulbrukFee: kulbrukFee / 100,
      sellerPayout: sellerPayout / 100
    })

  } catch (error) {
    console.error('Fort gjort payment error:', error)
    return NextResponse.json(
      { error: 'Feil ved opprettelse av Fort gjort betaling' },
      { status: 500 }
    )
  }
}
