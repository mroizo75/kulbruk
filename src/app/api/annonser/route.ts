import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sanitizeString } from '@/lib/validation'
import { sanitizeErrorForClient, logError } from '@/lib/errors'
import { applyRateLimit } from '@/lib/rate-limit'
import { generateShortCode } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12')))
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const search = searchParams.get('search')
    const status = searchParams.get('status') || 'APPROVED'
    const userId = searchParams.get('userId')
    
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (userId) {
      where.userId = userId
    }
    
    if (category) {
      where.category = {
        slug: category
      }
    }
    
    if (location) {
      where.location = {
        contains: sanitizeString(location, 100)
      }
    }
    
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) {
        const min = parseFloat(minPrice)
        if (!isNaN(min) && min >= 0) where.price.gte = min
      }
      if (maxPrice) {
        const max = parseFloat(maxPrice)
        if (!isNaN(max) && max >= 0) where.price.lte = max
      }
    }
    
    if (search) {
      const sanitizedSearch = sanitizeString(search, 100)
      where.OR = [
        { title: { contains: sanitizedSearch } },
        { description: { contains: sanitizedSearch } },
        { shortCode: { contains: sanitizedSearch } }
      ]
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          category: true,
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.listing.count({ where })
    ])

    const mappedListings = listings.map(listing => ({
      ...listing,
      enableFortGjort: listing.enableFortGjort,
      listingType: listing.listingType,
      userId: listing.userId
    }))

    return NextResponse.json({
      listings: mappedListings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    logError(error, { endpoint: 'GET /api/annonser' })
    const clientError = sanitizeErrorForClient(error)
    return NextResponse.json(
      { error: clientError.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await applyRateLimit(request, 10, 3600000)
    if (rateLimitResult) return rateLimitResult

    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    let dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name ?? null,
          firstName: (session.user as any).firstName ?? null,
          lastName: (session.user as any).lastName ?? null,
          role: (session.user as any).role ?? 'customer',
        },
      })
    }
    
    const dbUserId = dbUser.id

    const data = await request.json()
    
    const required = ['title', 'description', 'price', 'categoryId', 'location']
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Mangler påkrevd felt: ${field}` },
          { status: 400 }
        )
      }
    }

    if (!data.acceptedTermsAt) {
      return NextResponse.json(
        { error: 'Mangler aksept av vilkår/personvern' },
        { status: 400 }
      )
    }


    let enrichedVehicleSpec: any = null
    if (data?.vehicleSpec?.registrationNumber) {
      try {
        const regNumber = sanitizeString(data.vehicleSpec.registrationNumber, 20)
        const origin = new URL(request.url).origin
        const res = await fetch(`${origin}/api/vegvesen?regNumber=${encodeURIComponent(regNumber)}`, {
          cache: 'no-store'
        })
        if (res.ok) {
          const json = await res.json()
          const carData = json?.carData
          if (carData) {
            enrichedVehicleSpec = {
              registrationNumber: regNumber,
              mileage: data.vehicleSpec.mileage ?? null,
              nextInspection: data.vehicleSpec.nextInspection ? new Date(data.vehicleSpec.nextInspection) : null,
              accidents: data.vehicleSpec.accidents ?? null,
              serviceHistory: data.vehicleSpec.serviceHistory ?? null,
              modifications: data.vehicleSpec.modifications ?? null,
              additionalEquipment: data.vehicleSpec.additionalEquipment ?? null,
              make: carData.make ?? null,
              model: carData.model ?? null,
              year: carData.year ?? null,
              fuelType: carData.fuelType ?? null,
              transmission: carData.transmission ?? null,
              color: carData.color ?? null,
              power: carData.maxPower ?? null,
              co2Emission: carData.co2Emissions ?? null,
              bodyType: carData.bodyType ?? null,
              engineSize: carData.engineSize ?? null,
              cylinderCount: carData.cylinderCount ?? null,
              maxSpeed: carData.maxSpeed ?? null,
              length: carData.length ?? null,
              width: carData.width ?? null,
              height: carData.height ?? null,
              weight: carData.weight ?? null,
              maxWeight: carData.maxWeight ?? null,
              payload: carData.payload ?? null,
              roofLoad: carData.roofLoad ?? null,
              trailerWeightBraked: carData.trailerWeightBraked ?? null,
              trailerWeightUnbraked: carData.trailerWeightUnbraked ?? null,
              seats: carData.seats ?? null,
              frontSeats: carData.frontSeats ?? null,
              doors: carData.doors ?? null,
              trunkCapacity: carData.trunkCapacity ?? null,
              euroClass: carData.euroClass ?? null,
              wheelDrive: carData.wheelDrive ?? null,
              vin: carData.vin ?? null,
              firstRegistrationDate: carData.firstRegistrationDate ? new Date(carData.firstRegistrationDate) : null,
              lastInspection: carData.lastInspection ? new Date(carData.lastInspection) : null,
              registrationStatus: carData.registrationStatus ?? null,
              vehicleGroup: carData.vehicleGroup ?? null,
              technicalCode: carData.technicalCode ?? null,
              remarks: carData.remarks ?? null,
              fuelConsumptionCombined: carData.fuelConsumption?.combined ?? null,
              fuelConsumptionCity: carData.fuelConsumption?.city ?? null,
              fuelConsumptionHighway: carData.fuelConsumption?.highway ?? null,
              tireSpecs: carData.tires ?? null,
              abs: carData.abs ?? null,
              airbags: carData.airbags ?? null,
              omregistreringsavgift: carData.omregistreringsavgift ?? null,
              omregAvgiftDato: carData.omregAvgiftDato ? new Date(carData.omregAvgiftDato) : null,
            }
          }
        }
      } catch (e) {
        logError(e, { context: 'vegvesen enrichment' })
      }
    }

    // Opprett annonse
    // Generer kort kode og sikre unikhet enkelt (retry ved kollisjon)
    let shortCode = generateShortCode()
    for (let i = 0; i < 3; i++) {
      const exists = await prisma.listing.findUnique({ where: { shortCode } as any }).catch(() => null)
      if (!exists) break
      shortCode = generateShortCode()
    }

    const listing = await prisma.listing.create({
      data: {
        shortCode,
        title: sanitizeString(data.title, 200),
        description: sanitizeString(data.description, 5000),
        price: typeof data.price === 'number' ? data.price : parseFloat(String(data.price)),
        location: sanitizeString(data.location, 100),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        categoryId: data.categoryId,
        userId: dbUserId,
        contactEmail: data.contactEmail ? sanitizeString(data.contactEmail, 254) : null,
        contactPhone: data.contactPhone ? sanitizeString(data.contactPhone, 20) : null,
        contactName: data.contactName ? sanitizeString(data.contactName, 100) : null,
        showAddress: !!data.showAddress,
        status: 'PENDING',
        enableFortGjort: !!data.enableFortGjort,
        ...((data.vehicleSpec || enrichedVehicleSpec) ? {
          vehicleSpec: {
            create: {
              ...(enrichedVehicleSpec ?? {
                registrationNumber: data.vehicleSpec.registrationNumber || null,
                mileage: data.vehicleSpec.mileage || null,
                nextInspection: data.vehicleSpec.nextInspection ? new Date(data.vehicleSpec.nextInspection) : null,
                accidents: data.vehicleSpec.accidents ?? null,
                serviceHistory: data.vehicleSpec.serviceHistory || null,
                modifications: data.vehicleSpec.modifications || null,
                additionalEquipment: data.vehicleSpec.additionalEquipment ?? null,
                fuelType: data.vehicleSpec.fuelType || null,
                transmission: data.vehicleSpec.transmission || null,
                color: data.vehicleSpec.color || null,
                power: data.vehicleSpec.power || null,
                year: data.vehicleSpec.year || null,
              })
            }
          }
        } : {}),
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    try {
      await prisma.auditLog.create({
        data: {
          actorId: dbUserId,
          action: 'ACCEPT_TERMS_AND_CREATE_LISTING',
          targetType: 'Listing',
          targetId: listing.id,
          details: JSON.stringify({ acceptedTermsAt: data.acceptedTermsAt }),
        }
      })
    } catch (e) {
      logError(e, { context: 'audit log creation' })
    }

    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      const MAX_IMAGES = 20
      const images = data.images.slice(0, MAX_IMAGES)
      
      const imagePromises = images.map((image: any, index: number) => 
        prisma.image.create({
          data: {
            url: sanitizeString(image.url, 2048),
            altText: sanitizeString(image.altText || `Bilde ${index + 1}`, 200),
            sortOrder: image.sortOrder || index,
            isMain: image.isMain || index === 0,
            listingId: listing.id
          }
        })
      )
      
      await Promise.all(imagePromises)
    }

    try {
      const { notifyNewListing } = await import('@/lib/notification-manager')
      notifyNewListing({
        id: listing.id,
        title: listing.title,
        category: listing.category?.name || 'Ukjent',
        user: {
          firstName: listing.user.firstName,
          lastName: listing.user.lastName
        }
      })
    } catch (notificationError) {
      logError(notificationError, { context: 'notification' })
    }

    return NextResponse.json({
      success: true,
      id: listing.id,
      shortCode: listing.shortCode,
      message: 'Annonse opprettet vellykket! Den vil bli gjennomgått av våre moderatorer.'
    }, { status: 201 })

  } catch (error) {
    logError(error, { endpoint: 'POST /api/annonser' })
    const clientError = sanitizeErrorForClient(error)
    return NextResponse.json(
      { error: clientError.message },
      { status: 500 }
    )
  }
}