import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, listingExpiringTemplate } from '@/lib/email'
import { ensureCronAuthorized } from '@/lib/cron-auth'

// Kall denne fra en cron (Vercel cron / GitHub Actions) daglig
export async function GET(req: Request) {
  const authRes = ensureCronAuthorized(req)
  if (authRes) return authRes
  const now = new Date()
  const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 dager
  const listings = await prisma.listing.findMany({
    where: {
      status: 'APPROVED',
      isActive: true,
      expiresAt: { gte: now, lte: soon },
    },
    select: { id: true, title: true, expiresAt: true, user: { select: { email: true } } },
  })

  let sent = 0
  for (const l of listings) {
    if (!l.user?.email || !l.expiresAt) continue
    const daysLeft = Math.ceil((l.expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    const tpl = listingExpiringTemplate({ title: l.title, listingId: l.id, daysLeft })
    try {
      await sendEmail({ to: l.user.email, subject: tpl.subject, html: tpl.html })
      sent++
    } catch {}
  }
  return NextResponse.json({ sent })
}

