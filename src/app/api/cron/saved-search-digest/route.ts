import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, savedSearchDigestTemplate } from '@/lib/email'
import { ensureCronAuthorized } from '@/lib/cron-auth'

// Kjør daglig/ukentlig oppsummering for lagrede søk
// Triggeres av ekstern cron (GitHub Actions/Vercel cron). Bruk GET.
export async function GET(req: Request) {
  const authRes = ensureCronAuthorized(req)
  if (authRes) return authRes
  const { searchParams } = new URL(req.url)
  const period = (searchParams.get('period') || 'daily').toLowerCase()
  const isWeekly = period === 'weekly'
  const windowMs = isWeekly ? (7 * 24 * 60 * 60 * 1000) : (24 * 60 * 60 * 1000)
  const since = new Date(Date.now() - windowMs)

  const savedSearches = await prisma.savedSearch.findMany({
    where: { frequency: isWeekly ? 'weekly' : 'daily' },
    include: { user: { select: { email: true } } },
  })

  let processed = 0
  for (const s of savedSearches) {
    if (!s.user?.email) continue
    try {
      const query = JSON.parse(s.queryJson || '{}') as any
      // En veldig enkel matching: filtrer på kategori hvis satt
      const where: any = { status: 'APPROVED', isActive: true, createdAt: { gte: since } }
      if (query?.category) {
        const category = await prisma.category.findFirst({ where: { OR: [{ slug: query.category }, { name: query.category }] }, select: { id: true } })
        if (category?.id) where.categoryId = category.id
      }
      // Flere felt kan mappes her (prisintervall, sted osv.)

      const listings = await prisma.listing.findMany({
        where,
        include: { images: { select: { url: true }, take: 1 } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })

      if (listings.length === 0) continue

      const base = process.env.NEXT_PUBLIC_BASE_URL || ''
      const items = listings.map(l => ({
        title: l.title,
        url: `${base}/annonser/detaljer/${l.id}`,
        price: l.price ? Number(l.price) : null,
        location: l.location || null,
      }))
      const tpl = savedSearchDigestTemplate({ searchName: s.name, items, periodLabel: isWeekly ? 'Uke' : 'Døgn' })
      try {
        await sendEmail({ to: s.user.email, subject: tpl.subject, html: tpl.html })
      } catch {}
      processed += 1
    } catch {}
  }

  return NextResponse.json({ ok: true, processed })
}


