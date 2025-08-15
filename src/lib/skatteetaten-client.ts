/**
 * Skatteetaten Omregistreringsavgift API Client
 * 
 * API Dokumentasjon: https://skatteetaten.github.io/api-dokumentasjon/api/omregistreringsavgift
 * Test URL: https://api-test.sits.no/api/omregistreringsavgift/v1/
 * Prod URL: https://api.skatteetaten.no/api/omregistreringsavgift/v1/
 */

interface OmregistreringsavgiftResponse {
  omregistreringsavgift: number // Beløp i hele kroner
  kjennemerke: string
  datoOmregistreringsavgift: string // ISO 8601 format
}

interface SkatteetatError {
  kode: string
  melding: string
  korrelasjonsid?: string
}

export class SkatteetatClient {
  private baseUrl: string
  private rettighetspakke: string

  constructor() {
    // Bruk test-miljø hvis ikke prod
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.skatteetaten.no/api/omregistreringsavgift/v1/'
      : 'https://api-test.sits.no/api/omregistreringsavgift/v1/'
    
    // Rettighetspakke må settes basert på avtale med Skatteetaten
    this.rettighetspakke = process.env.SKATTEETATEN_RETTIGHETSPAKKE || 'demo'
  }

  /**
   * Hent omregistreringsavgift for et kjøretøy
   */
  async getOmregistreringsavgift(
    kjennemerke: string, 
    omregistreringsdato?: string
  ): Promise<{ avgift: number; dato: string } | null> {
    try {
      // Valider kjennemerke format (norske registreringsnummer)
      if (!this.isValidKjennemerke(kjennemerke)) {
        console.warn('Ugyldig kjennemerke format:', kjennemerke)
        return null
      }

      const url = new URL(`${this.rettighetspakke}/${kjennemerke}`, this.baseUrl)
      
      if (omregistreringsdato) {
        url.searchParams.set('omregistreringsdato', omregistreringsdato)
      }

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'User-Agent': 'Kulbruk/1.0'
      }

      // Legg til korrelasjonsid for logging
      const korrelasjonsid = this.generateUUID()
      headers['Korrelasjonsid'] = korrelasjonsid

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
        // Cache i 24 timer siden omregistreringsavgift endrer sjelden
        next: { revalidate: 86400 }
      })

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Omregistreringsavgift ikke funnet for:', kjennemerke)
          return null
        }
        
        const errorData: SkatteetatError = await response.json().catch(() => ({
          kode: 'UNKNOWN_ERROR',
          melding: `HTTP ${response.status}: ${response.statusText}`
        }))
        
        console.error('Skatteetaten API feil:', errorData)
        return null
      }

      const data: OmregistreringsavgiftResponse = await response.json()
      
      return {
        avgift: data.omregistreringsavgift,
        dato: data.datoOmregistreringsavgift
      }

    } catch (error) {
      console.error('Feil ved henting av omregistreringsavgift:', error)
      return null
    }
  }

  /**
   * Valider norsk registreringsnummer format
   */
  private isValidKjennemerke(kjennemerke: string): boolean {
    if (!kjennemerke || typeof kjennemerke !== 'string') {
      return false
    }

    // Fjern mellomrom og gjør uppercase
    const cleaned = kjennemerke.replace(/\s/g, '').toUpperCase()
    
    // Norske registreringsnummer mønstre:
    // - 2 bokstaver + 5 tall (AB12345)
    // - 2 bokstaver + 4 tall (AB1234) - eldre format
    // - EL + 5 tall (EL12345) - elbil
    // - Personlig: maks 7 tegn
    const patterns = [
      /^[A-Z]{2}\d{5}$/, // Standard: AB12345
      /^[A-Z]{2}\d{4}$/, // Eldre: AB1234
      /^EL\d{5}$/,       // Elbil: EL12345
      /^[A-Z0-9]{1,7}$/  // Personlig (generous)
    ]

    return patterns.some(pattern => pattern.test(cleaned))
  }

  /**
   * Generer UUID v4 for korrelasjonsid
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }
}

// Eksporter singleton instance
export const skatteetatClient = new SkatteetatClient()

/**
 * Helper-funksjon for å formatere omregistreringsavgift
 */
export function formatOmregistreringsavgift(avgift: number): string {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(avgift)
}

/**
 * Beregn total kjøpspris inkludert omregistrering
 */
export function calculateTotalPrice(listingPrice: number, omregAvgift: number): number {
  return listingPrice + omregAvgift
}
