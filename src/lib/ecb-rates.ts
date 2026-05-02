const ECB_URL = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml'

let ratesCache: Record<string, number> | null = null
let cacheExpiry = 0

/**
 * Fetches EUR-based exchange rates from the European Central Bank.
 * Results are cached for 24 hours in the server process.
 * All currencies not in the ECB feed (e.g. HNL) return null on conversion.
 */
export async function getECBRates(): Promise<Record<string, number>> {
  if (ratesCache && Date.now() < cacheExpiry) {
    return ratesCache
  }

  const response = await fetch(ECB_URL, {
    next: { revalidate: 86400 }, // Next.js fetch cache — 24 h
  })

  if (!response.ok) {
    // Return stale cache if available, otherwise empty
    return ratesCache ?? {}
  }

  const xml = await response.text()

  const rates: Record<string, number> = { EUR: 1 }
  for (const match of xml.matchAll(/currency="([A-Z]+)" rate="([0-9.]+)"/g)) {
    rates[match[1]] = parseFloat(match[2])
  }

  ratesCache = rates
  cacheExpiry = Date.now() + 24 * 60 * 60 * 1000

  return rates
}

/**
 * Converts an amount from any ECB-supported currency to NOK.
 * Returns null if either currency is missing from the feed.
 */
export function convertToNOK(
  amount: number,
  fromCurrency: string,
  rates: Record<string, number>
): number | null {
  const from = fromCurrency?.toUpperCase()
  if (from === 'NOK') return amount

  const fromRate = rates[from]
  const nokRate = rates['NOK']

  if (!fromRate || !nokRate) return null

  // amount → EUR → NOK
  return (amount / fromRate) * nokRate
}
