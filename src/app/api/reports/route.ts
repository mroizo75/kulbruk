import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, reportReceivedTemplate } from '@/lib/email'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { listingId, reason, comment } = await req.json()
  if (!listingId || !reason) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const reporterId = (session.user as any).id as string
  const report = await prisma.report.create({ data: { listingId, reporterId, reason, comment } })

  // Varsle admin på epost (enkeltoppsett: bruk SMTP_ADMIN)
  try {
    const admins = process.env.SMTP_ADMIN?.split(',').map(s => s.trim()).filter(Boolean) || []
    const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { title: true } })
    if (admins.length && listing) {
      const tpl = reportReceivedTemplate({ listingTitle: listing.title, reason, comment })
      await Promise.all(admins.map(to => sendEmail({ to, subject: tpl.subject, html: tpl.html })))
    }
  } catch (e) {
    console.warn('Kunne ikke sende admin-varsel om rapport:', e)
  }
  return NextResponse.json({ report })
}

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any).role as string
  if (role !== 'admin' && role !== 'moderator') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
    include: { listing: { select: { title: true } }, reporter: { select: { id: true, email: true } } },
  })
  return NextResponse.json({ reports })
}

