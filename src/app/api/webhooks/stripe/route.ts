import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { stripe, verifyWebhookSignature } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = (await headers()).get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Mangler Stripe signatur' }, { status: 400 })
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Webhook secret ikke konfigurert' }, { status: 500 })
    }

    // Verifiser webhook signatur
    let event: Stripe.Event
    try {
      event = verifyWebhookSignature(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('Webhook signatur verifikasjon feilet:', err)
      return NextResponse.json({ error: 'Ugyldig signatur' }, { status: 400 })
    }

    // Håndter forskjellige event-typer
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSuccess(paymentIntent)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailed(paymentIntent)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleSubscriptionPaymentSuccess(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleSubscriptionPaymentFailed(invoice)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCanceled(subscription)
        break
      }

      default:
        console.log(`Uhåndtert event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook feil' }, { status: 500 })
  }
}

// Handler-funksjoner
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Oppdater betaling i database
    const payment = await prisma.payment.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        status: 'SUCCEEDED',
        stripeChargeId: paymentIntent.latest_charge as string,
      },
      include: { listingPayment: true },
    })

    // Hvis det er en annonse-betaling, marker annonsen som betalt
    if (payment.type === 'LISTING_FEE' && payment.listingId) {
      await prisma.listingPayment.upsert({
        where: { listingId: payment.listingId },
        create: {
          listingId: payment.listingId,
          paymentId: payment.id,
          type: 'CAR_AD', // Basert på at kun bil-annonser koster penger foreløpig
          amount: payment.amount,
          isPaid: true,
          paidAt: new Date(),
        },
        update: {
          isPaid: true,
          paidAt: new Date(),
        },
      })

      // Godkjenn annonsen automatisk etter betaling
      await prisma.listing.update({
        where: { id: payment.listingId },
        data: { 
          status: 'APPROVED',
          publishedAt: new Date(),
        },
      })
    }

    console.log(`Betaling vellykket: ${paymentIntent.id}`)
  } catch (error) {
    console.error('Feil ved håndtering av vellykket betaling:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    await prisma.payment.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { status: 'FAILED' },
    })

    console.log(`Betaling feilet: ${paymentIntent.id}`)
  } catch (error) {
    console.error('Feil ved håndtering av mislykket betaling:', error)
  }
}

async function handleSubscriptionPaymentSuccess(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = (invoice as any).subscription
    if (!subscriptionId) return

    const finalSubscriptionId = typeof subscriptionId === 'string' ? subscriptionId : subscriptionId?.id
    if (!finalSubscriptionId) return

    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: finalSubscriptionId },
    })

    if (subscription) {
      // Fornye abonnement og reset annonse-telleren
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          adsRemaining: subscription.adsPerMonth, // Reset månedlige annonser
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })
    }

    console.log(`Abonnement betaling vellykket: ${(invoice as any).subscription}`)
  } catch (error) {
    console.error('Feil ved håndtering av abonnement betaling:', error)
  }
}

async function handleSubscriptionPaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = (invoice as any).subscription
    if (!subscriptionId) return

    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: 'PAST_DUE' },
    })

    console.log(`Abonnement betaling feilet: ${subscriptionId}`)
  } catch (error) {
    console.error('Feil ved håndtering av mislykket abonnement betaling:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const dbSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    })

    if (dbSubscription) {
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: subscription.status === 'active' ? 'ACTIVE' : 
                 subscription.status === 'canceled' ? 'CANCELED' :
                 subscription.status === 'past_due' ? 'PAST_DUE' : 'UNPAID',
        },
      })
    }

    console.log(`Abonnement oppdatert: ${subscription.id}`)
  } catch (error) {
    console.error('Feil ved håndtering av abonnement oppdatering:', error)
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  try {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: { 
        status: 'CANCELED',
        canceledAt: new Date(),
      },
    })

    console.log(`Abonnement kansellert: ${subscription.id}`)
  } catch (error) {
    console.error('Feil ved håndtering av kansellert abonnement:', error)
  }
}
