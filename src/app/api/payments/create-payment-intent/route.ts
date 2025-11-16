import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, getListingPrice, PRICING } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    const body = await request.json()
    const { categorySlug, listingId, type, pendingListingData, amount, currency, description, metadata } = body

    // Hvis dette er en hotell-betaling (har amount og description)
    if (amount && description && metadata?.type === 'hotel') {
      console.log('💳 Creating hotel payment intent:', { amount, currency, description })

      // Opprett Stripe Payment Intent for hotell
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: currency || 'nok',
        description,
        metadata: metadata || {},
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      })

      console.log('✅ Hotel payment intent created:', paymentIntent.id)

      return NextResponse.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount / 100,
        description,
      })
    }

    // Standard listing-betaling - krever autentisering
    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
    }

    // Valider input for listing
    if (!categorySlug || !type) {
      return NextResponse.json({ error: 'Mangler påkrevde felter' }, { status: 400 })
    }

    // Sjekk at bruker eksisterer
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!user) {
      return NextResponse.json({ error: 'Bruker ikke funnet' }, { status: 404 })
    }

    let listingAmount: number
    let listingDescription: string
    let paymentType: 'LISTING_FEE' | 'SUBSCRIPTION'
    let pricing: any = null

    if (type === 'listing') {
      // Annonse-betaling
      pricing = getListingPrice(categorySlug)
      listingAmount = pricing.amount
      listingDescription = pricing.description
      paymentType = 'LISTING_FEE'



      // Hvis gratis annonse (Torget), ikke opprett Payment Intent
      if (listingAmount === 0) {

        return NextResponse.json({ 
          success: true, 
          isFree: true,
          message: 'Torget-annonser er gratis' 
        })
      }

      // Valider at listing eksisterer og tilhører brukeren (kun hvis listingId er gitt)
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
      } else {

      }
    } else {
      return NextResponse.json({ error: 'Ugyldig betalingstype' }, { status: 400 })
    }

    // Opprett Stripe Payment Intent


    const paymentIntent = await stripe.paymentIntents.create({
      amount: listingAmount,
      currency: 'nok',
      description: listingDescription,
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
        allow_redirects: 'never', // Kun kort-betalinger
      },
      // Spesifiser at dette er for Norge
      payment_method_options: {
        card: {
          setup_future_usage: 'off_session',
        },
      },
    })



    // Lagre annonse-data i metadata for webhook bruk
    let paymentMetadata: any = { 
      categorySlug, 
      stripeClientSecret: paymentIntent.client_secret,
      ...(pendingListingData && { pendingListingData: JSON.stringify(pendingListingData) })
    }



    // Lagre betalingsinformasjon i database
    const payment = await prisma.payment.create({
      data: {
        stripePaymentIntentId: paymentIntent.id,
        userId: user.id,
        amount: listingAmount / 100, // Konverter øre til kroner
        currency: 'NOK',
        description: listingDescription,
        type: paymentType,
        listingId: listingId || null,
        status: 'PENDING',
        metadata: JSON.stringify(paymentMetadata),
      },
    })

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
      amount: listingAmount / 100,
      description: listingDescription,
    })

  } catch (error) {
    console.error('Feil ved opprettelse av Payment Intent:', error)
    return NextResponse.json(
      { error: 'Intern serverfeil' },
      { status: 500 }
    )
  }
}
