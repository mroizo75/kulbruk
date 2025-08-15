import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyNewListing } from '@/lib/notification-manager'
import { generateShortCode } from '@/lib/utils'

// Bruk delt Prisma-klient

// GET - Hent annonser med filtrering og paginering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Query parametere
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const search = searchParams.get('search')
    const status = searchParams.get('status') || 'APPROVED'
    const userId = searchParams.get('userId') // For å hente brukerens egne annonser
    
    const skip = (page - 1) * limit

    // Bygg where-clause
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
        contains: location,
        mode: 'insensitive'
      }
    }
    
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Hent annonser med relasjoner
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
            take: 1 // Kun hovedbilde for liste
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.listing.count({ where })
    ])

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Feil ved henting av annonser:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente annonser' },
      { status: 500 }
    )
  }
}

// POST - Opprett ny annonse
export async function POST(request: NextRequest) {
  try {
    // Debugging: sjekk headers
    const authHeader = request.headers.get('authorization')
    console.log('Authorization header:', !!authHeader)
    
    // Auth.js v5
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    // Finn eller opprett bruker i databasen basert på e‑post
    let dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!dbUser) {
      // Sett standardverdier ved første opprettelse
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
    
    // Bruk database user ID for listing
    const dbUserId = dbUser.id

    const data = await request.json()
    
    // Valider påkrevde felt
    const required = ['title', 'description', 'price', 'categoryId', 'location']
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Mangler påkrevd felt: ${field}` },
          { status: 400 }
        )
      }
    }

    // Håndhev vilkår-samtykke
    if (!data.acceptedTermsAt) {
      return NextResponse.json(
        { error: 'Mangler aksept av vilkår/personvern' },
        { status: 400 }
      )
    }

    // Enricher vehicleSpec fra Vegvesen hvis registreringsnummer er oppgitt
    let enrichedVehicleSpec: any = null
    if (data?.vehicleSpec?.registrationNumber) {
      try {
        const origin = new URL(request.url).origin
        const res = await fetch(`${origin}/api/vegvesen?regNumber=${encodeURIComponent(String(data.vehicleSpec.registrationNumber))}`, {
          cache: 'no-store'
        })
        if (res.ok) {
          const json = await res.json()
          const carData = json?.carData
          if (carData) {
            enrichedVehicleSpec = {
              registrationNumber: data.vehicleSpec.registrationNumber,
              mileage: data.vehicleSpec.mileage ?? null,
              nextInspection: data.vehicleSpec.nextInspection ? new Date(data.vehicleSpec.nextInspection) : null,
              accidents: data.vehicleSpec.accidents ?? null,
              serviceHistory: data.vehicleSpec.serviceHistory ?? null,
              modifications: data.vehicleSpec.modifications ?? null,
              additionalEquipment: data.vehicleSpec.additionalEquipment ?? null,
              // Fra Vegvesen - grunnleggende
              make: carData.make ?? null,
              model: carData.model ?? null,
              year: carData.year ?? null,
              fuelType: carData.fuelType ?? null,
              transmission: carData.transmission ?? null,
              color: carData.color ?? null,
              power: carData.maxPower ?? null,
              co2Emission: carData.co2Emissions ?? null,
              // Fra Vegvesen - utvidet
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
                      // Omregistreringsavgift fra Skatteetaten
                      omregistreringsavgift: carData.omregistreringsavgift ?? null,
                      omregAvgiftDato: carData.omregAvgiftDato ? new Date(carData.omregAvgiftDato) : null,
            }
          }
        }
      } catch (e) {
        console.warn('Kunne ikke berike VehicleSpec fra Vegvesen:', e)
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
        title: data.title,
        description: data.description,
        price: typeof data.price === 'number' ? data.price : parseFloat(String(data.price)),
        location: data.location,
        // varighet 1 måned
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        categoryId: data.categoryId,
        userId: dbUserId, // Bruker database user ID, ikke Clerk ID
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        contactName: data.contactName,
        showAddress: !!data.showAddress,
        status: 'PENDING', // Alle nye annonser venter på godkjenning
        // Opprett VehicleSpec dersom sendt inn
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

    // Audit: logg aksept av vilkår ved opprettelse
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
      console.warn('Kunne ikke skrive audit-logg for vilkårssamtykke', e)
    }

    // Håndter bildeopplasting
    if (data.images && data.images.length > 0) {
      console.log('Oppretter bilder:', data.images.length)
      
      // Opprett bilder i databasen
      const imagePromises = data.images.map((image: any, index: number) => 
        prisma.image.create({
          data: {
            url: image.url,
            altText: image.altText || `Bilde ${index + 1}`,
            sortOrder: image.sortOrder || index,
            isMain: image.isMain || index === 0,
            listingId: listing.id
          }
        })
      )
      
      await Promise.all(imagePromises)
      console.log('Bilder opprettet for listing:', listing.id)
    }

    // Send real-time notification til admin/moderatorer
    try {
      notifyNewListing({
        id: listing.id,
        title: listing.title,
        category: listing.category?.name || 'Ukjent',
        user: {
          firstName: listing.user.firstName,
          lastName: listing.user.lastName
        }
      })
      
      console.log('🔔 REAL-TIME NOTIFIKASJON SENDT:', listing.title)
      console.log('   - ID:', listing.id)
      console.log('   - Bruker:', listing.user.firstName, listing.user.lastName)
      console.log('   - Status: PENDING - krever godkjenning')
    } catch (notificationError) {
      console.error('Feil ved sending av real-time notifikasjon:', notificationError)
      // Ikke la notification-feil stoppe annonse-opprettelsen
    }

    return NextResponse.json({
      success: true,
      id: listing.id,
      shortCode: listing.shortCode,
      message: 'Annonse opprettet vellykket! Den vil bli gjennomgått av våre moderatorer.'
    }, { status: 201 })

  } catch (error) {
    console.error('Feil ved opprettelse av annonse:', error)
    return NextResponse.json(
      { error: 'Kunne ikke opprette annonse' },
      { status: 500 }
    )
  }
}