import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id as string
  const favorites = await prisma.favorite.findMany({ 
    where: { userId }, 
    include: { 
      listing: { 
        include: { 
          category: true, 
          images: { orderBy: { sortOrder: 'asc' }, take: 1 } 
        } 
      } 
    },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json({ favorites })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id as string
  const { listingId } = await req.json()
  if (!listingId) return NextResponse.json({ error: 'Missing listingId' }, { status: 400 })
  const fav = await prisma.favorite.upsert({
    where: { userId_listingId: { userId, listingId } },
    create: { userId, listingId },
    update: {},
  })
  return NextResponse.json({ favorite: fav })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id as string
  const { searchParams } = new URL(req.url)
  const listingId = searchParams.get('listingId')
  if (!listingId) return NextResponse.json({ error: 'Missing listingId' }, { status: 400 })
  await prisma.favorite.delete({ where: { userId_listingId: { userId, listingId } } })
  return NextResponse.json({ ok: true })
}

