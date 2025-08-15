import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { safeStringify } from '@/lib/utils'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
  const admin = await prisma.user.findUnique({ where: { id: (session.user as any).id }, select: { role: true } })
  if (!admin || admin.role !== 'admin') return NextResponse.json({ error: 'Kun admin' }, { status: 403 })

  const { action, ids } = await req.json()
  if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: 'Mangler IDs' }, { status: 400 })

  let updated = 0, deleted = 0
  if (action === 'APPROVE') {
    const res = await prisma.listing.updateMany({ where: { id: { in: ids } }, data: { status: 'APPROVED', publishedAt: new Date() } })
    updated = res.count
  } else if (action === 'REJECT') {
    const res = await prisma.listing.updateMany({ where: { id: { in: ids } }, data: { status: 'REJECTED' } })
    updated = res.count
  } else if (action === 'DELETE') {
    const res = await prisma.listing.deleteMany({ where: { id: { in: ids } } })
    deleted = res.count
  } else {
    return NextResponse.json({ error: 'Ugyldig action' }, { status: 400 })
  }

  // Audit-log for hver handling (aggregert)
  try {
    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any).id,
        action: `ADMIN_LISTING_${action}`,
        targetType: 'Listing',
        targetId: ids.join(','),
        details: safeStringify({ count: ids.length })
      }
    })
  } catch {}

  return NextResponse.json({ ok: true, updated, deleted })
}


