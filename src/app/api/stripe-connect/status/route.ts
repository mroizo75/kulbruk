import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autentiseret' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { sellerStripeAccount: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Bruker ikke funnet' }, { status: 404 })
    }

    if (!user.sellerStripeAccount) {
      return NextResponse.json({
        hasAccount: false,
        onboardingCompleted: false,
        payoutsEnabled: false,
        chargesEnabled: false
      })
    }

    try {
      // Hent oppdatert info fra Stripe
      const stripeAccount = await stripe.accounts.retrieve(user.sellerStripeAccount.stripeAccountId)
      
      const payoutsEnabled = stripeAccount.payouts_enabled || false
      const chargesEnabled = stripeAccount.charges_enabled || false
      const onboardingCompleted = stripeAccount.details_submitted || false
      
      // Oppdater database med siste status
      await prisma.sellerStripeAccount.update({
        where: { id: user.sellerStripeAccount.id },
        data: {
          onboardingCompleted,
          payoutsEnabled,
          chargesEnabled,
          stripeAccountStatus: onboardingCompleted ? 
            (payoutsEnabled && chargesEnabled ? 'enabled' : 'pending') : 
            'incomplete'
        }
      })

      return NextResponse.json({
        hasAccount: true,
        accountId: user.sellerStripeAccount.stripeAccountId,
        onboardingCompleted,
        payoutsEnabled,
        chargesEnabled,
        status: user.sellerStripeAccount.stripeAccountStatus,
        // Include some account details if available
        country: stripeAccount.country,
        defaultCurrency: stripeAccount.default_currency,
        businessType: stripeAccount.business_type
      })

    } catch (stripeError) {
      console.error('Error fetching Stripe account:', stripeError)
      return NextResponse.json({
        hasAccount: true,
        onboardingCompleted: user.sellerStripeAccount.onboardingCompleted,
        payoutsEnabled: user.sellerStripeAccount.payoutsEnabled,
        chargesEnabled: user.sellerStripeAccount.chargesEnabled,
        status: user.sellerStripeAccount.stripeAccountStatus,
        error: 'Kunne ikke hente oppdatert status fra Stripe'
      })
    }

  } catch (error) {
    console.error('Stripe Connect status error:', error)
    return NextResponse.json(
      { error: 'Feil ved henting av Stripe Connect status' },
      { status: 500 }
    )
  }
}
