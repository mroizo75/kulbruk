import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id as string
  const count = await prisma.message.count({
    where: {
      readAt: null,
      senderId: { not: userId },
      conversation: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
    },
  })
  return NextResponse.json({ count })
}


