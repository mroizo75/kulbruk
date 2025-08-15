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
          // Kunde: merk som solgt
          ...(data?.markAsSold === true ? { status: 'SOLD', soldAt: new Date() } : {}),
          // Kunde: toggle visning
          ...(typeof data?.isActive === 'boolean' ? { isActive: data.isActive } : {}),
          // Status settes tilbake til PENDING hvis innhold endres
          status: (data.title || data.description || data.price || data.vehicleSpec) ? 'PENDING' : undefined
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