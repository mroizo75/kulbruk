/**
 * Helper-funksjoner for bil-prisberegning inkludert omregistreringsavgift
 */

export interface CarPricing {
  salesPrice: number // Salgspris
  registrationFee: number // Omregistreringsavgift
  totalPrice: number // Totalpris
  isEstimated: boolean // Om omregistreringsavgiften er estimert
}

/**
 * Beregn totalpris for bil inkludert omregistreringsavgift
 */
export function calculateCarTotalPrice(
  salesPrice: number,
  officialRegistrationFee?: number | null
): CarPricing {
  // Bruk offisiell avgift hvis tilgjengelig, ellers estimat (2.5%)
  const registrationFee = officialRegistrationFee ?? Math.round(salesPrice * 0.025)
  const isEstimated = officialRegistrationFee === null || officialRegistrationFee === undefined
  
  return {
    salesPrice,
    registrationFee,
    totalPrice: salesPrice + registrationFee,
    isEstimated
  }
}

/**
 * Formater pris til norsk format med kr
 */
export function formatCarPrice(amount: number): string {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Sjekk om en kategori er bil-relatert og trenger omregistreringsavgift
 */
export function isCarCategory(categorySlug: string | undefined | null): boolean {
  if (!categorySlug) {
    return false
  }
  const normalized = categorySlug.toLowerCase()
  return normalized === 'bil' || normalized === 'biler'
}

/**
 * Beregn estimert omregistreringsavgift (2.5% av salgspris)
 */
export function estimateRegistrationFee(salesPrice: number): number {
  return Math.round(salesPrice * 0.025) // 2.5% av salgspris
}
