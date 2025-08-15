import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { notifyUser } from '../../user/notifications/stream/route'

export async function GET(_req: Request, { params }: { params: { conversationId: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { conversationId } = params
  const userId = (session.user as any).id as string

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, buyerId: true, sellerId: true },
  })
  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ messages })
}

export async function POST(req: Request, { params }: { params: { conversationId: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { conversationId } = params
  const { content } = await req.json()
  if (!content) return NextResponse.json({ error: 'Missing content' }, { status: 400 })
  const userId = (session.user as any).id as string

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { buyerId: true, sellerId: true },
  })
  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const message = await prisma.message.create({
    data: { conversationId, senderId: userId, content },
  })
  await prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: message.createdAt } })
  // Varsle motpart
  const otherUserId = conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId
  notifyUser(otherUserId, { type: 'message', conversationId, message: { id: message.id, content: message.content, createdAt: message.createdAt } })
  return NextResponse.json({ message })
}

