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
    console.log('✅ Webhook: Betaling vellykket, oppretter annonse...', paymentIntent.id)

    // Oppdater betaling i database
    const payment = await prisma.payment.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        status: 'SUCCEEDED',
        stripeChargeId: paymentIntent.latest_charge as string,
      },
    })

    // Hvis det er en annonse-betaling uten eksisterende listing, opprett annonsen nå
    if (payment.type === 'LISTING_FEE') {
      if (payment.listingId) {
        // GAMMEL flyt: annonse eksisterer allerede, bare godkjenn den
        console.log('📝 Webhook: Godkjenner eksisterende annonse...', payment.listingId)
        
        await prisma.listingPayment.upsert({
          where: { listingId: payment.listingId },
          create: {
            listingId: payment.listingId,
            paymentId: payment.id,
            type: 'CAR_AD',
            amount: payment.amount,
            isPaid: true,
            paidAt: new Date(),
          },
          update: {
            isPaid: true,
            paidAt: new Date(),
          },
        })

        await prisma.listing.update({
          where: { id: payment.listingId },
          data: { 
            status: 'APPROVED',
            publishedAt: new Date(),
          },
        })

      } else {
        // NY flyt: Opprett annonse etter vellykket betaling
        console.log('🆕 Webhook: Oppretter ny annonse etter betaling...')
        
        // Hent annonse-data fra Payment metadata
        const paymentMetadata = JSON.parse(payment.metadata as string || '{}')
        
        if (!paymentMetadata.pendingListingData) {
          console.error('❌ Webhook: Mangler pendingListingData i payment metadata')
          return
        }

        const listingData = JSON.parse(paymentMetadata.pendingListingData)
        
        // Opprett shortCode for annonsen
        const shortCode = Math.random().toString(36).substring(2, 8).toUpperCase()
        
        // Opprett annonsen
        const listing = await prisma.listing.create({
          data: {
            shortCode,
            title: listingData.title,
            description: listingData.description,
            price: listingData.price,
            categoryId: listingData.categoryId,
            location: listingData.location,
            contactEmail: listingData.contactEmail,
            contactPhone: listingData.contactPhone,
            contactName: listingData.contactName,
            showAddress: listingData.showAddress,
            userId: payment.userId,
            status: 'APPROVED', // Automatisk godkjent etter betaling
            publishedAt: new Date(),
            // Bil-spesifikke felt
            ...(listingData.vehicleSpec ? {
              vehicleSpec: {
                create: listingData.vehicleSpec
              }
            } : {}),
          }
        })

        // Opprett bilder
        if (listingData.images && listingData.images.length > 0) {
          const imagePromises = listingData.images.map((image: any, index: number) => 
            prisma.image.create({
              data: {
                url: image.url,
                altText: image.altText || `Bilde ${index + 1}`,
                sortOrder: image.sortOrder || index,
                isMain: image.isMain || index === 0,
                listingId: listing.id
              }
            })
          )
          await Promise.all(imagePromises)
        }

        // Opprett betaling-kobling
        await prisma.listingPayment.create({
          data: {
            listingId: listing.id,
            paymentId: payment.id,
            type: 'CAR_AD',
            amount: payment.amount,
            isPaid: true,
            paidAt: new Date(),
          }
        })

        // Oppdater payment med listing ID
        await prisma.payment.update({
          where: { id: payment.id },
          data: { listingId: listing.id }
        })

        // Audit: logg aksept av vilkår
        if (listingData.acceptedTermsAt) {
          await prisma.auditLog.create({
            data: {
              actorId: payment.userId,
              action: 'ACCEPT_TERMS_AND_CREATE_LISTING',
              targetType: 'Listing',
              targetId: listing.id,
              details: JSON.stringify({ acceptedTermsAt: listingData.acceptedTermsAt }),
            }
          })
        }

        console.log(`✅ Webhook: Annonse opprettet og publisert: ${listing.shortCode} (${listing.id})`)
      }
    }

    console.log(`✅ Webhook: Betaling fullført: ${paymentIntent.id}`)
  } catch (error) {
    console.error('❌ Webhook: Feil ved håndtering av vellykket betaling:', error)
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
