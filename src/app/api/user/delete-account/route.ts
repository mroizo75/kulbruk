import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id as string

  // Soft-delete/anonymisering: behold relasjoner men fjern PII
  await prisma.$transaction(async (tx) => {
    // Fjern brukerspesifikke data
    await tx.favorite.deleteMany({ where: { userId } })
    await tx.savedSearch.deleteMany({ where: { userId } })
    await tx.account.deleteMany({ where: { userId } })
    await tx.session.deleteMany({ where: { userId } })
    await tx.bid.deleteMany({ where: { bidderId: userId } })
    await tx.flightBooking.deleteMany({ where: { userId } })
    await tx.review.deleteMany({ where: { OR: [{ reviewerId: userId }, { revieweeId: userId }] } })
    await tx.report.deleteMany({ where: { reporterId: userId } })
    await tx.report.updateMany({ where: { handledById: userId }, data: { handledById: null } })
    await tx.message.updateMany({ where: { senderId: userId }, data: { content: '[deleted]' } })

    // Anonymiser bruker
    await tx.user.update({
      where: { id: userId },
      data: {
        name: 'Slettet bruker',
        firstName: null,
        lastName: null,
        email: `${userId}@deleted.kulbruk`,
        phone: null,
        location: null,
        avatar: null,
        website: null,
        companyLogo: null,
        companyName: null,
        orgNumber: null,
      },
    })

    // Deaktiver og anonymiser alle brukerens aktive annonser
    await tx.listing.updateMany({ 
      where: { userId }, 
      data: { 
        isActive: false, 
        status: 'SUSPENDED',
        contactEmail: null,
        contactPhone: null,
        contactName: null,
      } 
    })
  })

  return NextResponse.json({ ok: true })
}


