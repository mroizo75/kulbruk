import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, PRICING } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body

    // Valider plan
    if (!plan || !['BASIC', 'STANDARD'].includes(plan)) {
      return NextResponse.json({ error: 'Ugyldig abonnementsplan' }, { status: 400 })
    }

    // Sjekk at bruker eksisterer og er bedrift
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { subscription: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Bruker ikke funnet' }, { status: 404 })
    }

    if (user.role !== 'business') {
      return NextResponse.json({ error: 'Kun bedrifter kan ha abonnement' }, { status: 403 })
    }

    // Sjekk om bruker allerede har aktivt abonnement
    if (user.subscription && user.subscription.status === 'ACTIVE') {
      return NextResponse.json({ error: 'Du har allerede et aktivt abonnement' }, { status: 400 })
    }

    // Hent riktig pricing basert på plan
    const pricing = plan === 'BASIC' ? PRICING.BUSINESS_BASIC : PRICING.BUSINESS_STANDARD

    if (!pricing.stripePriceId) {
      return NextResponse.json({ error: 'Stripe Price ID ikke konfigurert' }, { status: 500 })
    }

    // Opprett eller hent Stripe customer
    let customerId: string

    try {
      // Prøv å finne eksisterende customer
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      })

      if (customers.data.length > 0) {
        customerId = customers.data[0].id
      } else {
        // Opprett ny customer
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : undefined,
          metadata: {
            clerkId: userId,
            userId: user.id,
            companyName: user.companyName || '',
          },
        })
        customerId = customer.id
      }
    } catch (stripeError) {
      console.error('Stripe customer error:', stripeError)
      return NextResponse.json({ error: 'Feil ved opprettelse av kunde' }, { status: 500 })
    }

    // Opprett abonnement i Stripe
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: pricing.stripePriceId,
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        clerkId: userId,
        userId: user.id,
        plan,
      },
    })

    // Lagre abonnement i database
    const dbSubscription = await prisma.subscription.create({
      data: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        stripePriceId: pricing.stripePriceId,
        userId: user.id,
        plan: plan as 'BASIC' | 'STANDARD',
        status: 'ACTIVE',
        adsRemaining: pricing.adsPerMonth,
        adsPerMonth: pricing.adsPerMonth,
        pricePerMonth: pricing.amount / 100, // Konverter øre til kroner
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dager fra nå
      },
    })

    // Hent client secret for betalingsbekreftelse
    const invoice = subscription.latest_invoice as any
    const clientSecret = invoice?.payment_intent?.client_secret

    return NextResponse.json({
      success: true,
      subscriptionId: dbSubscription.id,
      stripeSubscriptionId: subscription.id,
      clientSecret,
      plan,
      pricePerMonth: pricing.amount / 100,
      adsPerMonth: pricing.adsPerMonth,
    })

  } catch (error) {
    console.error('Feil ved opprettelse av abonnement:', error)
    return NextResponse.json(
      { error: 'Intern serverfeil' },
      { status: 500 }
    )
  }
}
