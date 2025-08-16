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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { sellerStripeAccount: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Bruker ikke funnet' }, { status: 404 })
    }

    // Sjekk om bruker allerede har Stripe Connect konto
    if (user.sellerStripeAccount) {
      // Hvis onboarding ikke er fullført, generer ny onboarding URL
      if (!user.sellerStripeAccount.onboardingCompleted) {
        const accountLink = await stripe.accountLinks.create({
          account: user.sellerStripeAccount.stripeAccountId,
          refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/customer/innstillinger?connect=refresh`,
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/customer/innstillinger?connect=success`,
          type: 'account_onboarding',
        })

        await prisma.sellerStripeAccount.update({
          where: { id: user.sellerStripeAccount.id },
          data: { onboardingUrl: accountLink.url }
        })

        return NextResponse.json({ 
          accountId: user.sellerStripeAccount.stripeAccountId,
          onboardingUrl: accountLink.url,
          status: user.sellerStripeAccount.stripeAccountStatus
        })
      }

      return NextResponse.json({
        accountId: user.sellerStripeAccount.stripeAccountId,
        status: user.sellerStripeAccount.stripeAccountStatus,
        onboardingCompleted: true
      })
    }

    // Opprett ny Stripe Connect konto
    const stripeAccount = await stripe.accounts.create({
      type: 'express',
      country: 'NO',
      email: user.email || undefined,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual', // Start med individual, kan endres
      metadata: {
        userId: user.id,
        userEmail: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      }
    })

    // Opprett onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccount.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/customer/innstillinger?connect=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/customer/innstillinger?connect=success`,
      type: 'account_onboarding',
    })

    // Lagre i database
    const sellerAccount = await prisma.sellerStripeAccount.create({
      data: {
        userId: user.id,
        stripeAccountId: stripeAccount.id,
        stripeAccountStatus: stripeAccount.details_submitted ? 'pending' : 'incomplete',
        onboardingCompleted: false,
        onboardingUrl: accountLink.url,
        payoutsEnabled: false,
        chargesEnabled: false
      }
    })

    return NextResponse.json({
      accountId: stripeAccount.id,
      onboardingUrl: accountLink.url,
      status: sellerAccount.stripeAccountStatus
    })

  } catch (error) {
    console.error('Stripe Connect error:', error)
    return NextResponse.json(
      { error: 'Feil ved opprettelse av Stripe Connect konto' },
      { status: 500 }
    )
  }
}
