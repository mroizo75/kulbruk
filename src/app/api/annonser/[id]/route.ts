import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Hent spesifikk annonse
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const listing = await prisma.listing.findUnique({
      where: { id },
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
    const { userId } = await auth()
    
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

    // Oppdater annonse
    const updatedListing = await prisma.listing.update({
      where: { id: id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price ? parseFloat(data.price) : undefined,
        location: data.location,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        contactName: data.contactName,
        // Status settes tilbake til PENDING hvis innhold endres
        status: data.title || data.description || data.price ? 'PENDING' : undefined
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