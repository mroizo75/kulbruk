import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { seedDatabase } from '@/lib/seed-database'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Sjekk at brukeren er admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Kjør database seeding
    const result = await seedDatabase()

    return NextResponse.json({
      message: 'Database seeding completed successfully',
      result
    })

  } catch (error) {
    console.error('Feil ved database seeding:', error)
    return NextResponse.json(
      { error: 'Database seeding failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET for å sjekke status
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Hent database statistikk
    const [
      totalUsers,
      totalListings,
      totalCategories,
      totalAuctions,
      totalBids
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.category.count(),
      prisma.auction.count(),
      prisma.bid.count()
    ])

    return NextResponse.json({
      message: 'Database status',
      statistics: {
        totalUsers,
        totalListings,
        totalCategories,
        totalAuctions,
        totalBids
      },
      isSeeded: totalListings > 0 && totalCategories > 0
    })

  } catch (error) {
    console.error('Feil ved henting av database status:', error)
    return NextResponse.json(
      { error: 'Failed to get database status' },
      { status: 500 }
    )
  }
}
