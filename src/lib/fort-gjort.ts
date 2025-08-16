/**
 * Fort gjort - Sikker handel for Torget-kategorien
 * Utilities og konstanter for den sikre betalingsløsningen
 */

export const FORT_GJORT_CONFIG = {
  // Kun tilgjengelig for Torget-kategorien
  ELIGIBLE_CATEGORIES: ['torget'],
  
  // Tidsfrister
  SHIPPING_DEADLINE_DAYS: 7,
  APPROVAL_DEADLINE_DAYS: 3,
  
  // Gebyrer
  KULBRUK_FEE_PERCENTAGE: 0.025, // 2.5%
  MIN_FEE_AMOUNT: 1000, // 10 kr minimum
  MAX_FEE_AMOUNT: 50000, // 500 kr maksimum
  
  // Prisgrenser
  MIN_ORDER_AMOUNT: 10000, // 100 kr minimum
  MAX_ORDER_AMOUNT: 10000000, // 100,000 kr maksimum
} as const

/**
 * Sjekk om en annonse er kvalifisert for Fort gjort
 */
export function isEligibleForFortGjort(listing: {
  category: { slug: string }
  price: number
  status: string
  userId: string
  listingType?: string
  enableFortGjort?: boolean
}) {
  // Må være eksplisitt aktivert av selger
  if (!listing.enableFortGjort) {
    return false
  }
  
  // Kun Torget-kategorien
  if (!FORT_GJORT_CONFIG.ELIGIBLE_CATEGORIES.includes(listing.category.slug as 'torget')) {
    return false
  }
  
  // Kun godkjente annonser
  if (listing.status !== 'APPROVED') {
    return false
  }
  
  // Kun fastpris-annonser (ikke auksjoner)
  if (listing.listingType === 'AUCTION') {
    return false
  }
  
  // Prisgrenser
  const priceInOre = Math.round(listing.price * 100)
  if (priceInOre < FORT_GJORT_CONFIG.MIN_ORDER_AMOUNT || 
      priceInOre > FORT_GJORT_CONFIG.MAX_ORDER_AMOUNT) {
    return false
  }
  
  return true
}

/**
 * Beregn Kulbruk sitt gebyr for Fort gjort
 */
export function calculateFortGjortFee(priceInOre: number): number {
  const feeAmount = Math.round(priceInOre * FORT_GJORT_CONFIG.KULBRUK_FEE_PERCENTAGE)
  
  // Påse minimum og maksimum grenser
  return Math.max(
    FORT_GJORT_CONFIG.MIN_FEE_AMOUNT,
    Math.min(feeAmount, FORT_GJORT_CONFIG.MAX_FEE_AMOUNT)
  )
}

/**
 * Beregn selgers utbetaling (pris minus gebyr)
 */
export function calculateSellerPayout(priceInOre: number): {
  totalAmount: number
  kulbrukFee: number
  sellerAmount: number
} {
  const kulbrukFee = calculateFortGjortFee(priceInOre)
  const sellerAmount = priceInOre - kulbrukFee
  
  return {
    totalAmount: priceInOre,
    kulbrukFee,
    sellerAmount
  }
}

/**
 * Formater beløp for visning
 */
export function formatAmount(amountInOre: number): string {
  return new Intl.NumberFormat('no-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInOre / 100)
}

/**
 * Beregn leveringsfrist (7 dager fra nå)
 */
export function calculateDeliveryDeadline(): Date {
  const deadline = new Date()
  deadline.setDate(deadline.getDate() + FORT_GJORT_CONFIG.SHIPPING_DEADLINE_DAYS)
  return deadline
}

/**
 * Beregn godkjenningsfrist (3 dager etter levering)
 */
export function calculateApprovalDeadline(deliveryDate?: Date): Date {
  const baseDate = deliveryDate || new Date()
  const deadline = new Date(baseDate)
  deadline.setDate(deadline.getDate() + FORT_GJORT_CONFIG.APPROVAL_DEADLINE_DAYS)
  return deadline
}

/**
 * Status-meldinger for ulike stadier
 */
export const FORT_GJORT_STATUS_MESSAGES = {
  PENDING_SHIPMENT: {
    buyer: 'Venter på at selger sender varen',
    seller: 'Send varen innen 7 dager'
  },
  SHIPPED: {
    buyer: 'Varen er sendt av selger',
    seller: 'Varen er sendt - venter på levering'
  },
  DELIVERED: {
    buyer: 'Godkjenn at varen er som beskrevet (3 dager)',
    seller: 'Venter på at kjøper godkjenner varen'
  },
  APPROVED: {
    buyer: 'Du har godkjent varen',
    seller: 'Kjøper har godkjent - utbetaling på vei'
  },
  COMPLETED: {
    buyer: 'Handelen er fullført',
    seller: 'Handelen er fullført - penger utbetalt'
  },
  DISPUTED: {
    buyer: 'Klage sendt - vi behandler saken',
    seller: 'Kjøper har sendt klage - vi behandler saken'
  }
} as const
