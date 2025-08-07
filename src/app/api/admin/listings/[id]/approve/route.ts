import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    // Sjekk at brukeren er admin
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!dbUser || dbUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Kun admin kan godkjenne annonser' },
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

    // Godkjenn annonsen
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: { 
        status: 'APPROVED',
        publishedAt: new Date() // Bruk publishedAt som godkjent-dato
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        category: { select: { name: true } }
      }
    })

    console.log(`Admin ${dbUser.email} godkjente annonse: ${updatedListing.title}`)

    return NextResponse.json({
      success: true,
      listing: updatedListing,
      message: 'Annonse godkjent'
    })

  } catch (error) {
    console.error('Feil ved godkjenning av annonse:', error)
    return NextResponse.json(
      { error: 'Kunne ikke godkjenne annonse' },
      { status: 500 }
    )
  }
}