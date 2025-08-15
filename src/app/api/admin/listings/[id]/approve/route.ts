import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { sendEmail, listingApprovedTemplate } from '@/lib/email'
import { prisma as prismaClient } from '@/lib/prisma'
import { safeStringify } from '@/lib/utils'

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
    try {
      await prismaClient.auditLog.create({
        data: {
          actorId: (session.user as any).id,
          action: 'ADMIN_LISTING_APPROVE',
          targetType: 'Listing',
          targetId: updatedListing.id,
          details: safeStringify({ category: updatedListing.category?.name })
        }
      })
    } catch {}

    // Send e-post til eier
    try {
      if (updatedListing.user?.email) {
        const tpl = listingApprovedTemplate({ title: updatedListing.title, listingId: updatedListing.id, shortCode: updatedListing.shortCode || undefined })
        await sendEmail({ to: updatedListing.user.email, subject: tpl.subject, html: tpl.html })
      }
    } catch (e) {
      console.warn('Kunne ikke sende godkjennings-epost:', e)
    }

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