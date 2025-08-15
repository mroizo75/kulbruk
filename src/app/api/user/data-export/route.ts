import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id as string

  const [user, listings, favorites, savedSearches, reviewsWritten, reviewsReceived, conversations, messages] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, firstName: true, lastName: true, email: true, phone: true, location: true, createdAt: true } }),
    prisma.listing.findMany({ where: { userId }, include: { images: true, vehicleSpec: true, category: true } }),
    prisma.favorite.findMany({ where: { userId }, include: { listing: { select: { id: true, title: true } } } }),
    prisma.savedSearch.findMany({ where: { userId } }),
    prisma.review.findMany({ where: { reviewerId: userId } }),
    prisma.review.findMany({ where: { revieweeId: userId } }),
    prisma.conversation.findMany({ where: { OR: [{ buyerId: userId }, { sellerId: userId }] }, include: { listing: { select: { id: true, title: true } } } }),
    prisma.message.findMany({ where: { senderId: userId } }),
  ])

  const exportObj = {
    generatedAt: new Date().toISOString(),
    user,
    listings,
    favorites,
    savedSearches,
    reviews: { written: reviewsWritten, received: reviewsReceived },
    conversations,
    messages,
  }

  const body = JSON.stringify(exportObj, null, 2)
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="kulbruk-export-${userId}.json"`,
    },
  })
}


