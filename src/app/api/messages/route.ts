import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, newMessageTemplate } from '@/lib/email'
import { auth } from '@/lib/auth'

// Opprett eller hent samtale og send første melding
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { listingId, toUserId, content } = await req.json()
  if (!listingId || !toUserId || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { userId: true } })
  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

  const buyerId = (session.user as any).id as string
  const sellerId = listing.userId
  if (buyerId === sellerId) return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })

  const conversation = await prisma.conversation.upsert({
    where: { listingId_buyerId_sellerId: { listingId, buyerId, sellerId } },
    create: { listingId, buyerId, sellerId },
    update: {},
  })

  const message = await prisma.message.create({
    data: { conversationId: conversation.id, senderId: buyerId, content },
  })

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: message.createdAt },
  })

  // Varsle selger på epost (best effort). Hvis Postmark ikke har verifisert From, ikke feil ut API.
  try {
    const seller = await prisma.user.findUnique({ where: { id: sellerId }, select: { email: true } })
    const listingInfo = await prisma.listing.findUnique({ where: { id: listingId }, select: { title: true } })
    if (seller?.email && listingInfo?.title) {
      const convoUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/dashboard/customer/meldinger` // foreløpig samtaleoversikt
      const tpl = newMessageTemplate({ listingTitle: listingInfo.title, conversationUrl: convoUrl })
      try {
        await sendEmail({ to: seller.email, subject: tpl.subject, html: tpl.html })
      } catch (emailErr) {
        console.warn('E-post ble ikke sendt (fortsetter uten å feile API):', emailErr)
      }
    }
  } catch (e) {
    console.warn('Kunne ikke forberede epost-varsel:', e)
  }

  return NextResponse.json({ conversationId: conversation.id, message })
}

// List brukerens samtaler
export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id as string
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    include: {
      listing: { select: { id: true, title: true, images: { select: { url: true }, take: 1 } } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { lastMessageAt: 'desc' },
  })
  return NextResponse.json({ conversations })
}

