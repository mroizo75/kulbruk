import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { findMainCategory, getCategoryNamesForMain, isValidMainCategory } from '@/lib/category-mapper'

// Helper funksjon for å parse prisområder
function parsePriceRange(priceRange: string) {
  const priceMap: { [key: string]: any } = {
    'Under 50k': { lt: 50000 },
    '50k - 100k': { gte: 50000, lt: 100000 },
    '100k - 200k': { gte: 100000, lt: 200000 },
    '200k - 400k': { gte: 200000, lt: 400000 },
    '400k - 600k': { gte: 400000, lt: 600000 },
    '600k - 1M': { gte: 600000, lt: 1000000 },
    'Over 1M': { gte: 1000000 },
    'Under 1M': { lt: 1000000 },
    '1M - 2M': { gte: 1000000, lt: 2000000 },
    '2M - 3M': { gte: 2000000, lt: 3000000 },
    '3M - 5M': { gte: 3000000, lt: 5000000 },
    '5M - 8M': { gte: 5000000, lt: 8000000 },
    '8M - 12M': { gte: 8000000, lt: 12000000 },
    'Over 12M': { gte: 12000000 },
    'Under 100kr': { lt: 100 },
    '100-500kr': { gte: 100, lt: 500 },
    '500-1000kr': { gte: 500, lt: 1000 },
    '1000-5000kr': { gte: 1000, lt: 5000 },
    '5000-10000kr': { gte: 5000, lt: 10000 },
    'Over 10000kr': { gte: 10000 }
  }
  
  return priceMap[priceRange] || null
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const userId = (session?.user as any)?.id as string | undefined
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'nyeste'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Nye filter-parametere
    const location = searchParams.get('location')
    const priceRange = searchParams.get('priceRange')
    const make = searchParams.get('make')
    const model = searchParams.get('model')
    const fuel = searchParams.get('fuel')
    const fuelType = searchParams.get('fuelType')
    const transmission = searchParams.get('transmission')
    const ageRange = searchParams.get('ageRange')
    const kmRange = searchParams.get('kmRange')
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    const yearMin = searchParams.get('yearMin')
    const yearMax = searchParams.get('yearMax')
    const mileageMax = searchParams.get('mileageMax')
    const propertyType = searchParams.get('propertyType')
    const rooms = searchParams.get('rooms')
    const area = searchParams.get('area')
    const plotSize = searchParams.get('plotSize')
    const buildYear = searchParams.get('buildYear')
    const condition = searchParams.get('condition')
    const subcategory = searchParams.get('subcategory')

    // Bygg where clause
    const where: any = {
      status: 'APPROVED',
      isActive: true
    }

    if (category && category !== 'alle') {
      // Valider at kategorien er gyldig
      if (!isValidMainCategory(category)) {
        return NextResponse.json(
          { error: `Ugyldig kategori: ${category}. Gyldige kategorier: bil, eiendom, torget` },
          { status: 400 }
        )
      }

      // Få alle kategorinavn som tilhører hovedkategorien
      const categoryNames = getCategoryNamesForMain(category)
      
      if (category === 'torget') {
        // Torget: Ekskluder bil og eiendom kategorier
        const bilNames = getCategoryNamesForMain('bil')
        const eiendomNames = getCategoryNamesForMain('eiendom')
        const excludeNames = [...bilNames, ...eiendomNames]
        
        where.category = {
          name: {
            notIn: excludeNames
          }
        }
      } else {
        // Bil eller Eiendom: Inkluder alle relaterte kategorier
        where.category = {
          name: {
            in: categoryNames
          }
        }
      }
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Helper function to check if value should be filtered
    const shouldFilter = (value: string | null) => {
      if (!value) return false
      const alleVerdier = [
        'Alle', 'Alle priser', 'Alle merker', 'Alle typer', 'Alle kategorier',
        'Alle fylker', 'Alle byer', 'Alle tilstander', 'Alle årganger',
        'Alle størrelser', 'Alle tomtestørrelser', 'Alle byggeår', 'Alle områder'
      ]
      return !alleVerdier.includes(value)
    }

    // Lokasjon filter
    if (shouldFilter(location)) {
      where.location = { contains: location, mode: 'insensitive' }
    }

    // Pris filter
    if (shouldFilter(priceRange)) {
      const priceFilter = parsePriceRange(priceRange!)
      if (priceFilter) {
        where.price = priceFilter
      }
    }

    // Pris-filtrering (direkte verdier)
    if (priceMin || priceMax) {
      where.price = {}
      if (priceMin) where.price.gte = parseFloat(priceMin)
      if (priceMax) where.price.lte = parseFloat(priceMax)
    }

    // Kategori-spesifikke filtre
    if (category === 'bil') {
      // Bil-spesifikke filtre basert på søketerm og filtre
      if (shouldFilter(make)) {
        where.OR = where.OR || []
        where.OR.push(
          { title: { contains: make, mode: 'insensitive' } },
          { description: { contains: make, mode: 'insensitive' } }
        )
      }
      
      if (shouldFilter(model)) {
        where.OR = where.OR || []
        where.OR.push(
          { title: { contains: model, mode: 'insensitive' } },
          { description: { contains: model, mode: 'insensitive' } }
        )
      }
      
      if (shouldFilter(fuelType)) {
        where.OR = where.OR || []
        where.OR.push(
          { title: { contains: fuelType, mode: 'insensitive' } },
          { description: { contains: fuelType, mode: 'insensitive' } }
        )
      }
      
      if (shouldFilter(transmission)) {
        where.OR = where.OR || []
        where.OR.push(
          { title: { contains: transmission, mode: 'insensitive' } },
          { description: { contains: transmission, mode: 'insensitive' } }
        )
      }

      // År-filtering (estimert fra tittel/beskrivelse)
      if (yearMin || yearMax) {
        const yearFilters = []
        for (let year = parseInt(yearMin || '1990'); year <= parseInt(yearMax || '2024'); year++) {
          yearFilters.push(
            { title: { contains: year.toString() } },
            { description: { contains: year.toString() } }
          )
        }
        if (yearFilters.length > 0) {
          where.OR = where.OR || []
          where.OR.push(...yearFilters)
        }
      }

      // Kilometertall (søk i beskrivelse)
      if (mileageMax) {
        // Søk etter km-angivelser under maks
        where.AND = where.AND || []
        where.AND.push({
          OR: [
            { description: { contains: 'lav km', mode: 'insensitive' } },
            { description: { contains: 'få km', mode: 'insensitive' } },
            // Kan utvides med mer sofistikert km-parsing
          ]
        })
      }
    } else if (category === 'eiendom') {
      // TODO: Implementer eiendom-spesifikke filtre når vi har felter for dem
    } else if (category === 'torget') {
      if (shouldFilter(condition)) {
        where.description = { contains: condition, mode: 'insensitive' }
      }
    }

    // Bygg sortering
    let orderBy: any = { createdAt: 'desc' } // default
    
    switch (sort) {
      case 'pris-lav':
        orderBy = { price: 'asc' }
        break
      case 'pris-hoy':
        orderBy = { price: 'desc' }
        break
      case 'mest-sett':
        orderBy = { views: 'desc' }
        break
      case 'alfabetisk':
        orderBy = { title: 'asc' }
        break
      case 'nyeste':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    // Hent annonser med kategori og bruker info
    const [listings, totalCount, categories, favs] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          category: true,
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1
          }
        },
        orderBy,
        take: limit,
        skip: offset
      }),
      
      prisma.listing.count({ where }),
      
      // Hent kategorier med tellere
      prisma.category.findMany({
        include: {
          _count: {
            select: {
              listings: {
                where: { status: 'APPROVED', isActive: true }
              }
            }
          }
        },
        orderBy: { sortOrder: 'asc' }
      }),
      userId ? prisma.favorite.findMany({ where: { userId }, select: { listingId: true } }) : Promise.resolve([] as { listingId: string }[])
    ])

    // Map data til frontend format
    const favSet = new Set((favs as { listingId: string }[]).map(f => f.listingId))
    const mappedListings = listings.map(listing => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price ? Number(listing.price) : null,
      location: listing.location,
      category: listing.category?.name || 'Ukjent',
      categorySlug: listing.category?.slug || null,
      status: listing.status,
      // Hvis ingen bilde i DB, ikke bruk uimplementert /api/placeholder. La UI håndtere fallback.
      mainImage: listing.images?.[0]?.url || '',
      images: (listing.images || []).map(img => ({ url: img.url, altText: img.altText || undefined })),
      views: listing.views,
      createdAt: listing.createdAt,
      isFeatured: listing.isFeatured,
      isFavorited: userId ? favSet.has(listing.id) : false,
      listingType: listing.listingType,
      registrationNumber: listing.registrationNumber,
      mileage: listing.mileage,
      condition: listing.condition,
      contactName: listing.contactName,
      contactEmail: listing.contactEmail,
      contactPhone: listing.contactPhone,
      seller: {
        name: listing.user ? `${listing.user.firstName} ${listing.user.lastName}`.trim() : 'Anonym'
      }
    }))

    // Map kategorier
    const mappedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      count: cat._count.listings,
      isActive: cat.isActive
    }))

    const body = {
      listings: mappedListings,
      totalCount,
      categories: mappedCategories,
      pagination: {
        limit,
        offset,
        hasMore: (offset + limit) < totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: Math.floor(offset / limit) + 1
      },
      filters: {
        category: category || null,
        search: search || null
      }
    }
    const res = NextResponse.json(body)
    // Cache offentlige listekall kort i edge-cache, mens innloggede brukere får privat svar
    if (!userId) {
      res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    } else {
      res.headers.set('Cache-Control', 'private, max-age=0, must-revalidate')
    }
    res.headers.set('Vary', 'Authorization, Cookie')
    return res

  } catch (error) {
    console.error('Feil ved henting av annonser:', error)
    
    // Hent parametere på nytt for fallback
    const { searchParams } = new URL(request.url)
    const categoryParam = searchParams.get('category')
    
    // Fallback til dummy data
    let dummyListings = [
      {
        id: '1',
        title: 'BMW X5 3.0d xDrive 2018',
        price: 450000,
        location: 'Oslo',
        category: 'Biler',
        status: 'APPROVED',
        mainImage: '/api/placeholder/400/300?text=BMW+X5',
        views: 234,
        createdAt: new Date('2024-01-15'),
        isFeatured: true,
        seller: { name: 'Test Bruker' }
      },
      {
        id: '2',
        title: 'Leilighet med fantastisk utsikt',
        price: 4500000,
        location: 'Bergen',
        category: 'Eiendom',
        status: 'APPROVED',
        mainImage: '/api/placeholder/400/300?text=Leilighet',
        views: 156,
        createdAt: new Date('2024-01-12'),
        seller: { name: 'Test Bruker' }
      },
      {
        id: '3',
        title: 'iPhone 14 Pro Max',
        price: 12000,
        location: 'Oslo',
        category: 'Elektronikk',
        status: 'APPROVED',
        mainImage: '/api/placeholder/400/300?text=iPhone',
        views: 89,
        createdAt: new Date('2024-01-10'),
        seller: { name: 'Test Bruker' }
      }
    ]

    // Filtrer dummy data basert på kategori
    if (categoryParam && categoryParam !== 'alle') {
      if (categoryParam === 'bil') {
        dummyListings = dummyListings.filter(listing => 
          listing.category.toLowerCase().includes('bil')
        )
      } else if (categoryParam === 'eiendom') {
        dummyListings = dummyListings.filter(listing => 
          listing.category.toLowerCase().includes('eiendom')
        )
      } else if (categoryParam === 'torget') {
        dummyListings = dummyListings.filter(listing => 
          !listing.category.toLowerCase().includes('bil') && 
          !listing.category.toLowerCase().includes('eiendom')
        )
      } else {
        // Generisk kategori-søk
        dummyListings = dummyListings.filter(listing => 
          listing.category.toLowerCase().includes(categoryParam.toLowerCase())
        )
      }
    }

    const dummyCategories = [
      { id: '1', name: 'Bil', slug: 'bil', count: 0, isActive: true },
      { id: '2', name: 'Eiendom', slug: 'eiendom', count: 0, isActive: true },
      { id: '3', name: 'Elektronikk', slug: 'elektronikk', count: 0, isActive: true }
    ]

    return NextResponse.json({
      listings: dummyListings,
      totalCount: dummyListings.length,
      categories: dummyCategories,
      pagination: {
        limit: 20,
        offset: 0,
        hasMore: false,
        totalPages: 1,
        currentPage: 1
      },
      filters: {
        category: null,
        search: null
      },
      error: 'Database ikke tilgjengelig - bruker fallback data'
    })
  }
}
