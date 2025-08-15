import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { safeStringify } from '@/lib/utils'

// DELETE /api/admin/listings/[id]/delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
    }

    // Bare admin kan slette annonser via admin-API
    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email! }, select: { role: true } })
    if (!dbUser || dbUser.role !== 'admin') {
      return NextResponse.json({ error: 'Kun administrator kan slette annonser' }, { status: 403 })
    }

    const { id } = await params

    // Sjekk eksisterende
    const existing = await prisma.listing.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Annonse ikke funnet' }, { status: 404 })
    }

    await prisma.listing.delete({ where: { id } })
    // Audit logg
    try {
      await prisma.auditLog.create({
        data: {
          actorId: (session.user as any).id,
          action: 'ADMIN_LISTING_DELETE',
          targetType: 'Listing',
          targetId: id,
          details: safeStringify({ reason: 'admin delete' })
        }
      })
    } catch {}
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin slett annonse feil:', error)
    return NextResponse.json({ error: 'Kunne ikke slette annonse' }, { status: 500 })
  }
}


