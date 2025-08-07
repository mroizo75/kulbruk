import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId && !user) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    // Sjekk at brukeren er admin
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId || user?.id }
    })

    if (!dbUser || dbUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Kun admin kan avslå annonser' },
        { status: 403 }
      )
    }

    const { id } = await params
    const listingId = id

    // Sjekk at annonsen eksisterer og er PENDING
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Annonse ikke funnet' },
        { status: 404 }
      )
    }

    if (listing.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Annonse er allerede behandlet' },
        { status: 400 }
      )
    }

    // Avslå annonsen
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: { 
        status: 'REJECTED'
        // Note: Vi har ikke rejectedAt/rejectedBy felt i schema
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        category: { select: { name: true } }
      }
    })

    console.log(`Admin ${dbUser.email} avslo annonse: ${updatedListing.title}`)

    return NextResponse.json({
      success: true,
      listing: updatedListing,
      message: 'Annonse avslått'
    })

  } catch (error) {
    console.error('Feil ved avslag av annonse:', error)
    return NextResponse.json(
      { error: 'Kunne ikke avslå annonse' },
      { status: 500 }
    )
  }
}