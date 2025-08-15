// NB: Denne filen kjøres kun på server. Ikke importer i klient.
import Stripe from 'stripe'
import { PRICING as SHARED_PRICING, formatPrice as sharedFormatPrice, getListingPrice as sharedGetListingPrice } from './stripe-shared'

// Forsinket initialisering for å unngå at klient importerer dette ved et uhell
export const getStripe = () => {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    throw new Error('STRIPE_SECRET_KEY er ikke satt i environment variables')
  }
  return new Stripe(secret, {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
  })
}

export const stripe = getStripe()

// Re-eksporter pris og helpers fra klient-sikker modul
export const PRICING = {
  ...SHARED_PRICING,
  CAR_AD: {
    ...SHARED_PRICING.CAR_AD,
    stripeProductId: process.env.STRIPE_BASIC_ANNONSE_ID,
  },
  BUSINESS_BASIC: {
    ...SHARED_PRICING.BUSINESS_BASIC,
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID,
  },
  BUSINESS_STANDARD: {
    ...SHARED_PRICING.BUSINESS_STANDARD,
    stripePriceId: process.env.STRIPE_STANDARD_PRICE_ID,
  },
} as const

export const formatPrice = sharedFormatPrice
export const getListingPrice = sharedGetListingPrice

// Webhook signatur-verifikasjon
export const verifyWebhookSignature = (
  body: string,
  signature: string,
  secret: string
): Stripe.Event => {
  return stripe.webhooks.constructEvent(body, signature, secret)
}
