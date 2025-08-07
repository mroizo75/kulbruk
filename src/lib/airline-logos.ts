// Flyselskaps-logoer fra gratis kilder
// Bruker Daisycon API og GitHub open source repositories

// Hovedkilde: Daisycon gratis logo API
const DAISYCON_BASE_URL = 'https://images.daisycon.io/airline'

// Fallback: GitHub open source logoer  
const GITHUB_LOGOS_BASE = 'https://raw.githubusercontent.com/tourware/static-airlines/master/logos'

// Flyselskaps-informasjon med norske navn
export const AIRLINE_INFO: Record<string, {
  name: string
  country: string
  website?: string
  colors?: string[]
}> = {
  // Nordiske flyselskaper
  'SAS': { name: 'SAS Scandinavian Airlines', country: 'Norge/Sverige/Danmark', colors: ['#000080', '#FFFFFF'] },
  'SK': { name: 'SAS', country: 'Skandinavia', colors: ['#000080', '#FFFFFF'] },
  'DY': { name: 'Norwegian Air', country: 'Norge', colors: ['#D42424', '#FFFFFF'] },
  'WF': { name: 'Widerøe', country: 'Norge', colors: ['#E31E24', '#FFFFFF'] },
  'BU': { name: 'SAS Braathens', country: 'Norge', colors: ['#000080', '#FFFFFF'] },
  
  // Europeiske storselskaper
  'LH': { name: 'Lufthansa', country: 'Tyskland', colors: ['#05164D', '#F9BA00'] },
  'KL': { name: 'KLM Royal Dutch Airlines', country: 'Nederland', colors: ['#00A1DE', '#FFFFFF'] },
  'AF': { name: 'Air France', country: 'Frankrike', colors: ['#002395', '#CE1126'] },
  'BA': { name: 'British Airways', country: 'Storbritannia', colors: ['#075AAA', '#CC092F'] },
  'IB': { name: 'Iberia', country: 'Spania', colors: ['#EC1C24', '#FFFFFF'] },
  'AZ': { name: 'Alitalia', country: 'Italia', colors: ['#007A33', '#CE1126'] },
  'OS': { name: 'Austrian Airlines', country: 'Østerrike', colors: ['#E40521', '#FFFFFF'] },
  'LX': { name: 'Swiss International Air Lines', country: 'Sveits', colors: ['#E30613', '#FFFFFF'] },
  'SN': { name: 'Brussels Airlines', country: 'Belgia', colors: ['#003F7F', '#FFFFFF'] },
  'TP': { name: 'TAP Air Portugal', country: 'Portugal', colors: ['#E31837', '#FFFFFF'] },
  'OK': { name: 'Czech Airlines', country: 'Tsjekkia', colors: ['#C8102E', '#003F7F'] },
  'LO': { name: 'LOT Polish Airlines', country: 'Polen', colors: ['#003F7F', '#FFD100'] },
  
  // Lavprisflyselskaper
  'FR': { name: 'Ryanair', country: 'Irland', colors: ['#003F7F', '#FFD100'] },
  'U2': { name: 'easyJet', country: 'Storbritannia', colors: ['#FF6900', '#FFFFFF'] },
  'VY': { name: 'Vueling', country: 'Spania', colors: ['#FFD100', '#003F7F'] },
  'W6': { name: 'Wizz Air', country: 'Ungarn', colors: ['#C8102E', '#FFFFFF'] },
  'HV': { name: 'Transavia', country: 'Nederland', colors: ['#FF6900', '#FFFFFF'] },
  'PC': { name: 'Pegasus Airlines', country: 'Tyrkia', colors: ['#E31837', '#FFFFFF'] },
  
  // Mellomøstlige og Asiatiske
  'TK': { name: 'Turkish Airlines', country: 'Tyrkia', colors: ['#C8102E', '#003F7F'] },
  'EK': { name: 'Emirates', country: 'UAE', colors: ['#C8102E', '#FFD100'] },
  'QR': { name: 'Qatar Airways', country: 'Qatar', colors: ['#5A1846', '#FFFFFF'] },
  'EY': { name: 'Etihad Airways', country: 'UAE', colors: ['#B5985A', '#FFFFFF'] },
  'AI': { name: 'Air India', country: 'India', colors: ['#FF6900', '#C8102E'] },
  '6E': { name: 'IndiGo', country: 'India', colors: ['#003F7F', '#FFFFFF'] },
  
  // Amerikanske
  'UA': { name: 'United Airlines', country: 'USA', colors: ['#003F7F', '#FFFFFF'] },
  'AA': { name: 'American Airlines', country: 'USA', colors: ['#C8102E', '#003F7F'] },
  'DL': { name: 'Delta Air Lines', country: 'USA', colors: ['#003366', '#C8102E'] },
  'AC': { name: 'Air Canada', country: 'Canada', colors: ['#C8102E', '#FFFFFF'] },
  'WS': { name: 'WestJet', country: 'Canada', colors: ['#003F7F', '#FFFFFF'] },
  
  // Andre viktige
  'JL': { name: 'JAL Japan Airlines', country: 'Japan', colors: ['#C8102E', '#FFFFFF'] },
  'NH': { name: 'ANA All Nippon Airways', country: 'Japan', colors: ['#003F7F', '#FFFFFF'] },
  'CX': { name: 'Cathay Pacific', country: 'Hong Kong', colors: ['#007A33', '#FFFFFF'] },
  'SQ': { name: 'Singapore Airlines', country: 'Singapore', colors: ['#003F7F', '#FFD100'] },
  'TG': { name: 'Thai Airways', country: 'Thailand', colors: ['#5A1846', '#FFD100'] },
  'MH': { name: 'Malaysia Airlines', country: 'Malaysia', colors: ['#003F7F', '#C8102E'] },
  'GA': { name: 'Garuda Indonesia', country: 'Indonesia', colors: ['#003F7F', '#FFD100'] },
  'QF': { name: 'Qantas', country: 'Australia', colors: ['#C8102E', '#FFFFFF'] },
  'NZ': { name: 'Air New Zealand', country: 'New Zealand', colors: ['#003F7F', '#FFFFFF'] },
}

// Funksjon for å få logo-URL
export function getAirlineLogo(iataCode: string, options: {
  width?: number
  height?: number
  format?: 'png' | 'svg'
  fallback?: boolean
} = {}): string {
  const { width = 120, height = 60, format = 'png', fallback = true } = options
  
  if (!iataCode || iataCode.length !== 2) {
    return getDefaultAirlineLogo()
  }

  const code = iataCode.toUpperCase()
  
  // Prøv først lokal logo fra /public/flylogo/
  const localLogo = `/flylogo/${code}.png`
  
  // Returner lokal path - img onError håndterer fallback til Daisycon
  return localLogo
}

// Fallback logo for ukjente flyselskaper
export function getDefaultAirlineLogo(): string {
  // Generic flyselskap-logo fra Daisycon
  return `${DAISYCON_BASE_URL}?width=120&height=60&color=ffffff&iata=xx`
}

// Få flyselskaps-informasjon
export function getAirlineInfo(iataCode: string): {
  name: string
  country: string
  logo: string
  website?: string
  colors?: string[]
} {
  const info = AIRLINE_INFO[iataCode.toUpperCase()]
  
  return {
    name: info?.name || `${iataCode} Airlines`,
    country: info?.country || 'Ukjent',
    logo: `/flylogo/${iataCode.toUpperCase()}.png`, // Direkte path til lokal logo
    website: info?.website,
    colors: info?.colors || ['#003F7F', '#FFFFFF']
  }
}

// Få alle tilgjengelige flyselskaper
export function getAllAirlines(): Array<{
  code: string
  name: string
  country: string
  logo: string
}> {
  return Object.entries(AIRLINE_INFO).map(([code, info]) => ({
    code,
    name: info.name,
    country: info.country,
    logo: getAirlineLogo(code)
  }))
}

// Test om logo eksisterer (for fallback-håndtering)
export async function testAirlineLogo(iataCode: string): Promise<boolean> {
  try {
    const response = await fetch(getAirlineLogo(iataCode, { fallback: false }), { 
      method: 'HEAD' 
    })
    return response.ok
  } catch {
    return false
  }
}

// GitHub fallback-logoer (som backup)
export function getGitHubAirlineLogo(iataCode: string): string {
  return `${GITHUB_LOGOS_BASE}/${iataCode.toLowerCase()}.png`
}
