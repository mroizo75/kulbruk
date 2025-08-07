import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    const user = await currentUser()
    
    if (!userId && !user) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    // Sjekk at brukeren er admin eller moderator
    const currentUserDb = await prisma.user.findUnique({
      where: { clerkId: userId || user?.id }
    })

    if (!currentUserDb || (currentUserDb.role !== 'admin' && currentUserDb.role !== 'moderator')) {
      return NextResponse.json(
        { error: 'Kun admin og moderatorer har tilgang' },
        { status: 403 }
      )
    }

    // Hent siste aktivitet for notifikasjoner
    const since = new Date(Date.now() - 60 * 60 * 1000) // Siste time

    const [newListings, newUsers] = await Promise.all([
      prisma.listing.findMany({
        where: {
          createdAt: { gte: since },
          status: 'PENDING'
        },
        include: {
          user: { select: { firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.findMany({
        where: {
          createdAt: { gte: since }
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    // Lag notifikasjoner
    const notifications = [
      ...newListings.map(listing => ({
        id: `listing_${listing.id}`,
        type: 'new_listing' as const,
        title: listing.title,
        message: `Ny annonse fra ${listing.user.firstName} ${listing.user.lastName} i ${listing.category}`,
        data: { listingId: listing.id },
        timestamp: listing.createdAt
      })),
      ...newUsers.map(user => ({
        id: `user_${user.id}`,
        type: 'user_registered' as const,
        title: `${user.firstName} ${user.lastName}`,
        message: `Ny bruker registrert med rolle: ${user.role}`,
        data: { userId: user.id },
        timestamp: user.createdAt
      }))
    ]

    // Mock rapporter (implementer Report model senere)
    const mockReports = [
      {
        id: 'report_mock_1',
        type: 'new_report' as const,
        title: 'Tesla Model 3 - Feil pris',
        message: 'Bruker rapporterte annonse for feil pris',
        data: { reportId: 'mock_1' },
        timestamp: new Date(Date.now() - 15 * 60 * 1000)
      }
    ]

    // Sorter alle notifikasjoner etter timestamp
    const allNotifications = [...notifications, ...mockReports]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 20)

    return NextResponse.json({
      success: true,
      notifications: allNotifications,
      stats: {
        pendingListings: newListings.length,
        newUsers: newUsers.length,
        pendingReports: 1 // Mock
      }
    })

  } catch (error) {
    console.error('Feil ved henting av admin notifikasjoner:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente notifikasjoner' },
      { status: 500 }
    )
  }
}