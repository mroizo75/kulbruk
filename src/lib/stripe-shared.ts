// Denne filen inneholder kun klient-sikre helpers og konstanter
// (ingen import av Stripe SDK eller lesing av server-miljøvariabler)

// Priser for ulike tjenester
export const PRICING = {
  // Annonse-gebyrer
  CAR_AD: {
    amount: 4900, // 49 NOK i øre
    currency: 'nok',
    description: 'Bil-annonse (1 måned)',
  },
  TORGET_AD: {
    amount: 0, // Gratis
    currency: 'nok',
    description: 'Torget-annonse (gratis)',
  },
  
  // Bedrifts-abonnementer (månedlig)
  BUSINESS_BASIC: {
    amount: 9900, // 99 NOK i øre
    currency: 'nok',
    description: 'Basic Business - 5 annonser per måned',
    adsPerMonth: 5,
    // Stripe Price ID settes i miljøvariabler kun på serversiden
    stripePriceId: process.env.NEXT_PUBLIC_DUMMY ?? undefined,
  },
  BUSINESS_STANDARD: {
    amount: 19900, // 199 NOK i øre
    currency: 'nok',
    description: 'Standard Business - 10 annonser per måned',
    adsPerMonth: 10,
    stripePriceId: process.env.NEXT_PUBLIC_DUMMY ?? undefined,
  },
} as const

// Helper-funksjoner for formattering
export const formatPrice = (amountInOre: number): string => {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0,
  }).format(amountInOre / 100)
}

export const getListingPrice = (categorySlug: string): typeof PRICING.CAR_AD | typeof PRICING.TORGET_AD => {
  if (categorySlug === 'biler') {
    return PRICING.CAR_AD
  }
  return PRICING.TORGET_AD
}


