import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, getListingPrice, PRICING } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      console.log('❌ Payment Intent: Ikke autentisert')
      return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
    }

    const body = await request.json()
    const { categorySlug, listingId, type } = body

    console.log('🚀 Payment Intent: Mottatt forespørsel:', {
      categorySlug,
      listingId,
      type,
      userEmail: session.user.email
    })

    // Valider input
    if (!categorySlug || !type) {
      console.log('❌ Payment Intent: Mangler påkrevde felter:', { categorySlug, type })
      return NextResponse.json({ error: 'Mangler påkrevde felter' }, { status: 400 })
    }

    // Sjekk at bruker eksisterer
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!user) {
      return NextResponse.json({ error: 'Bruker ikke funnet' }, { status: 404 })
    }

    let amount: number
    let description: string
    let paymentType: 'LISTING_FEE' | 'SUBSCRIPTION'
    let pricing: any = null

    if (type === 'listing') {
      // Annonse-betaling
      pricing = getListingPrice(categorySlug)
      amount = pricing.amount
      description = pricing.description
      paymentType = 'LISTING_FEE'

      console.log('💰 Payment Intent: Prisberegning:', {
        categorySlug,
        pricing,
        amount,
        description
      })

      // Hvis gratis annonse (Torget), ikke opprett Payment Intent
      if (amount === 0) {
        console.log('✅ Payment Intent: Gratis annonse, returnerer success')
        return NextResponse.json({ 
          success: true, 
          isFree: true,
          message: 'Torget-annonser er gratis' 
        })
      }

      // Valider at listing eksisterer og tilhører brukeren
      if (listingId) {
        const listing = await prisma.listing.findFirst({
          where: {
            id: listingId,
            userId: user.id
          }
        })

        if (!listing) {
          return NextResponse.json({ error: 'Annonse ikke funnet' }, { status: 404 })
        }
      }
    } else {
      return NextResponse.json({ error: 'Ugyldig betalingstype' }, { status: 400 })
    }

    // Opprett Stripe Payment Intent
    console.log('🔄 Payment Intent: Oppretter Stripe Payment Intent...', {
      amount,
      currency: 'nok',
      description,
      userId: user.id,
      stripeProductId: pricing.stripeProductId || 'ikke satt'
    })

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'nok',
      description,
      metadata: {
        userId: user.id,
        id: session.user.id,
        type: paymentType,
        categorySlug,
        ...(listingId && { listingId }),
        ...(pricing.stripeProductId && { productId: pricing.stripeProductId }),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    console.log('✅ Payment Intent: Stripe Payment Intent opprettet:', {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      hasClientSecret: !!paymentIntent.client_secret
    })

    // Lagre betalingsinformasjon i database
    const payment = await prisma.payment.create({
      data: {
        stripePaymentIntentId: paymentIntent.id,
        userId: user.id,
        amount: amount / 100, // Konverter øre til kroner
        currency: 'NOK',
        description,
        type: paymentType,
        listingId: listingId || null,
        status: 'PENDING',
        metadata: JSON.stringify({ categorySlug, stripeClientSecret: paymentIntent.client_secret }),
      },
    })

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
      amount: amount / 100,
      description,
    })

  } catch (error) {
    console.error('Feil ved opprettelse av Payment Intent:', error)
    return NextResponse.json(
      { error: 'Intern serverfeil' },
      { status: 500 }
    )
  }
}
