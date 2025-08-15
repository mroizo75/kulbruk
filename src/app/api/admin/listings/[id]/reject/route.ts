import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { sendEmail, listingRejectedTemplate } from '@/lib/email'
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
    try {
      await prismaClient.auditLog.create({
        data: {
          actorId: (session.user as any).id,
          action: 'ADMIN_LISTING_REJECT',
          targetType: 'Listing',
          targetId: updatedListing.id,
          details: safeStringify({ category: updatedListing.category?.name })
        }
      })
    } catch {}

    // Send e-post til eier
    try {
      if (updatedListing.user?.email) {
        const tpl = listingRejectedTemplate({ title: updatedListing.title })
        await sendEmail({ to: updatedListing.user.email, subject: tpl.subject, html: tpl.html })
      }
    } catch (e) {
      console.warn('Kunne ikke sende avvisnings-epost:', e)
    }

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