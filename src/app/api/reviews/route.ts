import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const reviewerId = (session.user as any).id as string
  const { revieweeId, listingId, rating, comment } = await req.json()
  if (!revieweeId || !rating) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  if (reviewerId === revieweeId) return NextResponse.json({ error: 'Kan ikke vurdere deg selv' }, { status: 400 })
  if (rating < 1 || rating > 5) return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
  // Enkel rate limit: maks 1 review per 10 minutter per (reviewerId -> revieweeId)
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000)
  const recent = await prisma.review.findFirst({ where: { reviewerId, revieweeId, createdAt: { gte: tenMinAgo } } })
  if (recent) return NextResponse.json({ error: 'Vent litt før du vurderer samme bruker på nytt' }, { status: 429 })
  const review = await prisma.review.upsert({
    where: { reviewerId_revieweeId_listingId: { reviewerId, revieweeId, listingId } },
    create: { reviewerId, revieweeId, listingId, rating, comment },
    update: { rating, comment },
  })
  return NextResponse.json({ review })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  const reviews = await prisma.review.findMany({
    where: { revieweeId: userId },
    orderBy: { createdAt: 'desc' },
  })
  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) : 0
  return NextResponse.json({ reviews, average: avg })
}

