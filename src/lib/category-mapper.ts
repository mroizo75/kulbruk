// Hovedkategorier og deres underkategorier
export const MAIN_CATEGORIES = {
  bil: {
    name: 'Biler',
    slug: 'bil',
    description: 'Biler, motorsykler og andre kjøretøy',
    icon: 'Car',
    subcategories: [
      'Bil', 'Biler', 'Motorsykkel', 'Motorsykler', 'Moped', 'Scooter', 
      'ATV', 'Snøscooter', 'Båt', 'Båter', 'Campingvogn', 'Tilhenger',
      'Reservedeler', 'Bildeler', 'Dekk', 'Felger'
    ]
  },
  eiendom: {
    name: 'Eiendom',
    slug: 'eiendom', 
    description: 'Leiligheter, hus og næringseiendommer',
    icon: 'Home',
    subcategories: [
      'Eiendom', 'Leilighet', 'Leiligheter', 'Enebolig', 'Eneboliger',
      'Rekkehus', 'Tomannsbolig', 'Hytte', 'Hytter', 'Fritidsbolig',
      'Fritidsboliger', 'Tomt', 'Tomter', 'Næringseiendom', 'Kontor',
      'Lager', 'Industrieiendom', 'Gård', 'Skog'
    ]
  },
  torget: {
    name: 'Torget',
    slug: 'torget',
    description: 'Alt annet - møbler, elektronikk, klær og mer',
    icon: 'ShoppingBag',
    subcategories: [
      'Elektronikk', 'Mobil', 'PC', 'TV', 'Audio', 'Gaming',
      'Møbler', 'Sofa', 'Bord', 'Stol', 'Seng', 'Skap',
      'Klær', 'Dame', 'Herre', 'Barn', 'Sko', 'Tilbehør',
      'Sport', 'Trening', 'Fritid', 'Hobby', 'Musikk',
      'Barn', 'Baby', 'Leker', 'Barnevogn', 'Barneseng',
      'Kjæledyr', 'Hundetilbehør', 'Kattetilbehør', 'Fisk',
      'Hage', 'Utendørs', 'Verktøy', 'Byggevarer',
      'Bøker', 'Kunst', 'Samling', 'Antikk', 'Vintage',
      'Mat', 'Drikke', 'Kosttilskudd', 'Helse', 'Skjønnhet',
      'Diverse', 'Annet', 'Øvrig'
    ]
  }
} as const

export type MainCategorySlug = keyof typeof MAIN_CATEGORIES

// Finn hovedkategori basert på kategori-navn eller slug
export function findMainCategory(categoryName: string): MainCategorySlug | null {
  const normalizedName = categoryName.toLowerCase().trim()
  
  // Sjekk direkte match på hovedkategori-navn/-slug
  for (const [slug, config] of Object.entries(MAIN_CATEGORIES)) {
    if (config.slug === normalizedName || 
        config.name.toLowerCase() === normalizedName ||
        slug === normalizedName) {
      return slug as MainCategorySlug
    }
  }
  
  // Sjekk underkategorier
  for (const [slug, config] of Object.entries(MAIN_CATEGORIES)) {
    if (config.subcategories.some(sub => 
      sub.toLowerCase() === normalizedName ||
      normalizedName.includes(sub.toLowerCase()) ||
      sub.toLowerCase().includes(normalizedName)
    )) {
      return slug as MainCategorySlug
    }
  }
  
  return null
}

// Få alle kategorinavn som tilhører en hovedkategori
export function getCategoryNamesForMain(mainCategory: MainCategorySlug): string[] {
  const config = MAIN_CATEGORIES[mainCategory]
  return [config.name, ...config.subcategories]
}

// Sjekk om en URL-slug er gyldig hovedkategori
export function isValidMainCategory(slug: string): slug is MainCategorySlug {
  return slug in MAIN_CATEGORIES
}

// Få alle gyldige ruter for kategorier
export function getValidCategoryRoutes(): string[] {
  return Object.keys(MAIN_CATEGORIES)
}

// Redirect mapper for gamle kategorier til nye
export const CATEGORY_REDIRECTS: Record<string, MainCategorySlug> = {
  // Bil-relaterte
  'biler': 'bil',
  'motorsykkel': 'bil',
  'motorsykler': 'bil',
  'båt': 'bil',
  'båter': 'bil',
  'bildeler': 'bil',
  
  // Eiendom-relaterte
  'leilighet': 'eiendom',
  'leiligheter': 'eiendom',
  'hus': 'eiendom',
  'eneboliger': 'eiendom',
  'hytte': 'eiendom',
  'hytter': 'eiendom',
  'tomt': 'eiendom',
  'tomter': 'eiendom',
  
  // Torget-relaterte
  'elektronikk': 'torget',
  'mobil': 'torget',
  'pc': 'torget',
  'tv': 'torget',
  'mobler': 'torget',
  'møbler': 'torget',
  'klaer': 'torget',
  'klær': 'torget',
  'sport': 'torget',
  'fritid': 'torget',
  'hobby': 'torget',
  'barn': 'torget',
  'baby': 'torget',
  'kjaledyr': 'torget',
  'kjæledyr': 'torget',
  'hage': 'torget',
  'verktoy': 'torget',
  'verktøy': 'torget',
  'boker': 'torget',
  'bøker': 'torget',
  'diverse': 'torget'
}

// Få redirect-URL for ugyldig kategori
export function getCategoryRedirect(invalidSlug: string): string | null {
  const normalized = invalidSlug.toLowerCase().trim()
  const redirectTo = CATEGORY_REDIRECTS[normalized]
  
  if (redirectTo) {
    return `/annonser/${redirectTo}`
  }
  
  // Prøv å finne hovedkategori
  const mainCategory = findMainCategory(normalized)
  if (mainCategory) {
    return `/annonser/${mainCategory}`
  }
  
  return null
}
