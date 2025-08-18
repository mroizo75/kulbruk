import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Hent spesifikk annonse
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const { id } = await params
  // Støtt enten intern id eller kortkode
  const listing = await prisma.listing.findFirst({
      where: { OR: [ { id }, { shortCode: id } ] },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        vehicleSpec: true // Inkluder bil-spesifikasjoner hvis det er en bil
      }
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Annonse ikke funnet' },
        { status: 404 }
      )
    }

    // Øk antall visninger (bare for godkjente annonser)
    if (listing.status === 'APPROVED') {
      await prisma.listing.update({
        where: { id },
        data: { views: { increment: 1 } }
      })
    }

    return NextResponse.json(listing)

  } catch (error) {
    console.error('Feil ved henting av annonse:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente annonse' },
      { status: 500 }
    )
  }
}

// PUT - Oppdater annonse
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    const { id } = await params
    const data = await request.json()

    // Sjekk at annonsen tilhører brukeren
    const existingListing = await prisma.listing.findUnique({
      where: { id: id },
      select: { userId: true }
    })

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Annonse ikke funnet' },
        { status: 404 }
      )
    }

    if (existingListing.userId !== userId) {
      return NextResponse.json(
        { error: 'Ikke autorisert til å oppdatere denne annonsen' },
        { status: 403 }
      )
    }

    // Oppdater annonse (og relasjoner) i en transaksjon
    const updatedListing = await prisma.$transaction(async (tx) => {
      const listing = await tx.listing.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          price: typeof data.price === 'number' ? data.price : (data.price ? parseFloat(String(data.price)) : undefined),
          location: data.location,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          contactName: data.contactName,
          showAddress: typeof data.showAddress === 'boolean' ? data.showAddress : undefined,
          // Eiendom utleie felter
          ...(data.propertyPurpose && { propertyPurpose: data.propertyPurpose }),
          ...(typeof data.rentalPrice === 'number' && { rentalPrice: data.rentalPrice }),
          ...(typeof data.deposit === 'number' && { deposit: data.deposit }),
          ...(data.availableFrom && { availableFrom: new Date(data.availableFrom) }),
          ...(data.rentIncludes && { rentIncludes: data.rentIncludes }),
          // Fort gjort setting
          ...(typeof data.enableFortGjort === 'boolean' && { enableFortGjort: data.enableFortGjort }),
          // Kunde: merk som solgt
          ...(data?.markAsSold === true ? { status: 'SOLD', soldAt: new Date() } : {}),
          // Kunde: toggle visning
          ...(typeof data?.isActive === 'boolean' ? { isActive: data.isActive } : {}),
          // Status settes tilbake til PENDING hvis innhold endres
          status: (data.title || data.description || data.price || data.vehicleSpec || data.propertySpec) ? 'PENDING' : undefined
        },
        include: {
          category: true,
          user: {
            select: { id: true, firstName: true, lastName: true }
          }
        }
      })

      // Oppdater/erstatt bilder dersom sendt inn
      if (Array.isArray(data.images)) {
        await tx.image.deleteMany({ where: { listingId: id } })
        for (let index = 0; index < data.images.length; index++) {
          const image = data.images[index]
          await tx.image.create({
            data: {
              url: image.url,
              altText: image.altText || `Bilde ${index + 1}`,
              sortOrder: typeof image.sortOrder === 'number' ? image.sortOrder : index,
              isMain: typeof image.isMain === 'boolean' ? image.isMain : index === 0,
              listingId: id
            }
          })
        }
      }

      // Oppdater vehicleSpec dersom sendt inn
      if (data.vehicleSpec) {
        await tx.vehicleSpec.upsert({
          where: { listingId: id },
          update: {
            registrationNumber: data.vehicleSpec.registrationNumber ?? undefined,
            mileage: data.vehicleSpec.mileage ?? undefined,
            nextInspection: data.vehicleSpec.nextInspection ? new Date(data.vehicleSpec.nextInspection) : undefined,
            accidents: typeof data.vehicleSpec.accidents === 'boolean' ? data.vehicleSpec.accidents : undefined,
            serviceHistory: data.vehicleSpec.serviceHistory ?? undefined,
            modifications: data.vehicleSpec.modifications ?? undefined,
            additionalEquipment: Array.isArray(data.vehicleSpec.additionalEquipment) ? data.vehicleSpec.additionalEquipment : undefined,
            // Omregistreringsavgift fra Skatteetaten
            omregistreringsavgift: data.vehicleSpec.omregistreringsavgift ?? undefined,
            omregAvgiftDato: data.vehicleSpec.omregAvgiftDato ? new Date(data.vehicleSpec.omregAvgiftDato) : undefined,
          },
          create: {
            listingId: id,
            registrationNumber: data.vehicleSpec.registrationNumber || null,
            mileage: data.vehicleSpec.mileage || null,
            nextInspection: data.vehicleSpec.nextInspection ? new Date(data.vehicleSpec.nextInspection) : null,
            accidents: data.vehicleSpec.accidents ?? null,
            serviceHistory: data.vehicleSpec.serviceHistory || null,
            modifications: data.vehicleSpec.modifications || null,
            additionalEquipment: Array.isArray(data.vehicleSpec.additionalEquipment) ? data.vehicleSpec.additionalEquipment : undefined,
            // Omregistreringsavgift fra Skatteetaten
            omregistreringsavgift: data.vehicleSpec.omregistreringsavgift || null,
            omregAvgiftDato: data.vehicleSpec.omregAvgiftDato ? new Date(data.vehicleSpec.omregAvgiftDato) : null,
          }
        })
      }

      // Oppdater propertySpec dersom sendt inn
      if (data.propertySpec) {
        await tx.propertySpec.upsert({
          where: { listingId: id },
          update: {
            rooms: data.propertySpec.rooms ?? undefined,
            bedrooms: data.propertySpec.bedrooms ?? undefined,
            bathrooms: data.propertySpec.bathrooms ?? undefined,
            livingArea: data.propertySpec.livingArea ?? undefined,
            totalUsableArea: data.propertySpec.totalUsableArea ?? undefined,
            propertyType: data.propertySpec.propertyType ?? undefined,
            ownershipType: data.propertySpec.ownershipType ?? undefined,
            buildingYear: data.propertySpec.buildingYear ?? undefined,
            condition: data.propertySpec.condition ?? undefined,
            furnished: typeof data.propertySpec.furnished === 'boolean' ? data.propertySpec.furnished : undefined,
            furnishingLevel: data.propertySpec.furnishingLevel ?? undefined,
            utilitiesIncluded: typeof data.propertySpec.utilitiesIncluded === 'boolean' ? data.propertySpec.utilitiesIncluded : undefined,
            internetIncluded: typeof data.propertySpec.internetIncluded === 'boolean' ? data.propertySpec.internetIncluded : undefined,
            cleaningIncluded: typeof data.propertySpec.cleaningIncluded === 'boolean' ? data.propertySpec.cleaningIncluded : undefined,
            minimumRentalPeriod: data.propertySpec.minimumRentalPeriod ?? undefined,
            petsAllowed: typeof data.propertySpec.petsAllowed === 'boolean' ? data.propertySpec.petsAllowed : undefined,
            smokingAllowed: typeof data.propertySpec.smokingAllowed === 'boolean' ? data.propertySpec.smokingAllowed : undefined,
            studentFriendly: typeof data.propertySpec.studentFriendly === 'boolean' ? data.propertySpec.studentFriendly : undefined,
            hasBalcony: typeof data.propertySpec.hasBalcony === 'boolean' ? data.propertySpec.hasBalcony : undefined,
            hasGarden: typeof data.propertySpec.hasGarden === 'boolean' ? data.propertySpec.hasGarden : undefined,
            hasParking: typeof data.propertySpec.hasParking === 'boolean' ? data.propertySpec.hasParking : undefined,
            hasElevator: typeof data.propertySpec.hasElevator === 'boolean' ? data.propertySpec.hasElevator : undefined,
            hasBasement: typeof data.propertySpec.hasBasement === 'boolean' ? data.propertySpec.hasBasement : undefined,
            energyRating: data.propertySpec.energyRating ?? undefined,
            heatingType: data.propertySpec.heatingType ?? undefined,
            monthlyFee: data.propertySpec.monthlyFee ? parseFloat(String(data.propertySpec.monthlyFee)) : undefined,
            propertyTax: data.propertySpec.propertyTax ? parseFloat(String(data.propertySpec.propertyTax)) : undefined,
            floor: data.propertySpec.floor ?? undefined,
            totalFloors: data.propertySpec.totalFloors ?? undefined,
          },
          create: {
            listingId: id,
            rooms: data.propertySpec.rooms || null,
            bedrooms: data.propertySpec.bedrooms || null,
            bathrooms: data.propertySpec.bathrooms || null,
            livingArea: data.propertySpec.livingArea || null,
            totalUsableArea: data.propertySpec.totalUsableArea || null,
            propertyType: data.propertySpec.propertyType || null,
            ownershipType: data.propertySpec.ownershipType || null,
            buildingYear: data.propertySpec.buildingYear || null,
            condition: data.propertySpec.condition || null,
            furnished: data.propertySpec.furnished ?? null,
            furnishingLevel: data.propertySpec.furnishingLevel || null,
            utilitiesIncluded: data.propertySpec.utilitiesIncluded ?? null,
            internetIncluded: data.propertySpec.internetIncluded ?? null,
            cleaningIncluded: data.propertySpec.cleaningIncluded ?? null,
            minimumRentalPeriod: data.propertySpec.minimumRentalPeriod || null,
            petsAllowed: data.propertySpec.petsAllowed ?? null,
            smokingAllowed: data.propertySpec.smokingAllowed ?? null,
            studentFriendly: data.propertySpec.studentFriendly ?? null,
            hasBalcony: data.propertySpec.hasBalcony ?? null,
            hasGarden: data.propertySpec.hasGarden ?? null,
            hasParking: data.propertySpec.hasParking ?? null,
            hasElevator: data.propertySpec.hasElevator ?? null,
            hasBasement: data.propertySpec.hasBasement ?? null,
            energyRating: data.propertySpec.energyRating || null,
            heatingType: data.propertySpec.heatingType || null,
            monthlyFee: data.propertySpec.monthlyFee ? parseFloat(String(data.propertySpec.monthlyFee)) : null,
            propertyTax: data.propertySpec.propertyTax ? parseFloat(String(data.propertySpec.propertyTax)) : null,
            floor: data.propertySpec.floor || null,
            totalFloors: data.propertySpec.totalFloors || null,
          }
        })
      }

      return listing
    })

    return NextResponse.json({
      success: true,
      listing: updatedListing
    })

  } catch (error) {
    console.error('Feil ved oppdatering av annonse:', error)
    return NextResponse.json(
      { error: 'Kunne ikke oppdatere annonse' },
      { status: 500 }
    )
  }
}

// DELETE - Slett annonse
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
  ) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    const { id } = await params
    
    // Sjekk at annonsen tilhører brukeren
    const existingListing = await prisma.listing.findUnique({
      where: { id: id },
      select: { userId: true }
    })

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Annonse ikke funnet' },
        { status: 404 }
      )
    }

    if (existingListing.userId !== userId) {
      return NextResponse.json(
        { error: 'Ikke autorisert til å slette denne annonsen' },
        { status: 403 }
      )
    }

    // Slett annonse (cascade sletter også bilder og bil-spesifikasjoner)
    await prisma.listing.delete({
      where: { id: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Annonse slettet'
    })

  } catch (error) {
    console.error('Feil ved sletting av annonse:', error)
    return NextResponse.json(
      { error: 'Kunne ikke slette annonse' },
      { status: 500 }
    )
  }
}