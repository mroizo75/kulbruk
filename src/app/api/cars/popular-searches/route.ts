import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Hent populære søkeord basert på eksisterende bil-annonser
    const bilCategories = await prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: 'bil' } },
          { slug: { contains: 'bil' } }
        ]
      }
    })

    if (bilCategories.length === 0) {
      return NextResponse.json({
        popularMakes: [],
        popularModels: [],
        popularSearches: [],
        trendingTerms: []
      })
    }

    const categoryIds = bilCategories.map(cat => cat.id)

    // Hent alle bil-annonser for analyse
    const carListings = await prisma.listing.findMany({
      where: {
        categoryId: { in: categoryIds },
        status: 'APPROVED',
        isActive: true
      },
      select: {
        title: true,
        description: true,
        location: true,
        createdAt: true,
        views: true
      },
      orderBy: [
        { views: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 200 // Analyser de siste 200 annonsene
    })

    // Analyser titler for å finne populære merker og modeller
    const makeCount: { [key: string]: number } = {}
    const modelCount: { [key: string]: number } = {}
    const locationCount: { [key: string]: number } = {}
    const termCount: { [key: string]: number } = {}

    // Populære bilmerker (basert på norsk marked)
    const knownMakes = [
      'Toyota', 'Volkswagen', 'BMW', 'Audi', 'Mercedes-Benz', 'Tesla', 'Volvo',
      'Ford', 'Skoda', 'Nissan', 'Hyundai', 'Peugeot', 'Kia', 'Mazda',
      'Subaru', 'Honda', 'Mitsubishi', 'Renault', 'Citroën', 'Opel'
    ]

    // Populære modeller per merke
    const knownModels: { [key: string]: string[] } = {
      'Toyota': ['Corolla', 'Camry', 'RAV4', 'Prius', 'Yaris', 'Avensis', 'C-HR'],
      'Volkswagen': ['Golf', 'Passat', 'Polo', 'Tiguan', 'Touran', 'Arteon', 'ID.4'],
      'BMW': ['3-serie', '5-serie', 'X3', 'X5', 'i3', 'iX3', '1-serie', 'X1'],
      'Audi': ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'e-tron', 'A1'],
      'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X'],
      'Volvo': ['XC60', 'XC90', 'V60', 'V70', 'S60', 'XC40', 'V40']
    }

    // Spesielle søkeord
    const specialTerms = [
      'elbil', 'elektrisk', 'hybrid', 'diesel', 'bensin', 'automat', 'manuell',
      '4wd', 'quattro', 'xdrive', 'awd', 'familiebil', 'sportsbil', 'suv',
      'cabriolet', 'stasjonsvogn', 'sedan', 'hatchback'
    ]

    carListings.forEach(listing => {
      const title = listing.title.toLowerCase()
      const description = listing.description.toLowerCase()
      const fullText = `${title} ${description}`

      // Analyser merker
      knownMakes.forEach(make => {
        if (title.includes(make.toLowerCase())) {
          makeCount[make] = (makeCount[make] || 0) + 1

          // Analyser modeller for dette merket
          if (knownModels[make]) {
            knownModels[make].forEach(model => {
              if (title.includes(model.toLowerCase()) || 
                  title.includes(model.toLowerCase().replace('-', ' '))) {
                const key = `${make} ${model}`
                modelCount[key] = (modelCount[key] || 0) + 1
              }
            })
          }
        }
      })

      // Analyser lokasjon
      if (listing.location) {
        const location = listing.location.trim()
        if (location.length > 2) {
          locationCount[location] = (locationCount[location] || 0) + 1
        }
      }

      // Analyser spesielle termer
      specialTerms.forEach(term => {
        if (fullText.includes(term)) {
          termCount[term] = (termCount[term] || 0) + 1
        }
      })
    })

    // Sorter og returner top resultater
    const popularMakes = Object.entries(makeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([make, count]) => ({ make, count }))

    const popularModels = Object.entries(modelCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([model, count]) => ({ model, count }))

    const popularLocations = Object.entries(locationCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([location, count]) => ({ location, count }))

    const trendingTerms = Object.entries(termCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([term, count]) => ({ term, count }))

    // Generer populære søkekombinationer
    const popularSearches = [
      ...popularMakes.slice(0, 5).map(({ make }) => make),
      ...popularModels.slice(0, 5).map(({ model }) => model),
      ...popularLocations.slice(0, 3).map(({ location }) => `Biler i ${location}`),
      ...trendingTerms.slice(0, 3).map(({ term }) => term),
      // Faste populære søk
      'Tesla Model 3 Oslo',
      'BMW X5 diesel',
      'Audi A4 automat',
      'Toyota RAV4 hybrid'
    ]

    return NextResponse.json({
      popularMakes,
      popularModels,
      popularLocations,
      popularSearches: popularSearches.slice(0, 12),
      trendingTerms,
      totalCarListings: carListings.length,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Feil ved henting av populære bil-søk:', error)
    
    // Fallback til statiske data
    return NextResponse.json({
      popularMakes: [
        { make: 'Toyota', count: 50 },
        { make: 'Volkswagen', count: 45 },
        { make: 'BMW', count: 40 },
        { make: 'Audi', count: 35 },
        { make: 'Tesla', count: 30 }
      ],
      popularModels: [
        { model: 'Toyota RAV4', count: 25 },
        { model: 'BMW X5', count: 20 },
        { model: 'Audi A4', count: 18 },
        { model: 'Tesla Model 3', count: 15 },
        { model: 'Volkswagen Golf', count: 12 }
      ],
      popularSearches: [
        'Tesla Model 3',
        'BMW X5',
        'Toyota RAV4',
        'Audi A4',
        'Volvo XC60',
        'Mercedes C-klasse',
        'Volkswagen Golf',
        'BMW 3-serie'
      ],
      trendingTerms: [
        { term: 'elbil', count: 40 },
        { term: 'hybrid', count: 35 },
        { term: 'automat', count: 30 },
        { term: 'diesel', count: 25 }
      ],
      totalCarListings: 0,
      lastUpdated: new Date().toISOString()
    })
  }
}
