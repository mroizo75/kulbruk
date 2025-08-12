import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'

const prisma = new PrismaClient()

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// PUT - Oppdater kategori (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
    }

    const { prisma: prismaLib } = await import('@/lib/prisma')
    const dbUser = await prismaLib.user.findUnique({ where: { email: session.user.email } })
    if (!dbUser || dbUser.role !== 'admin') {
      return NextResponse.json({ error: 'Kun administrator kan endre kategorier' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const name: string | undefined = body?.name
    const icon: string | undefined = body?.icon
    const description: string | undefined = body?.description
    const isActive: boolean | undefined = body?.isActive

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Kategorinavn er påkrevd' }, { status: 400 })
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: slugify(name),
        icon: icon ?? undefined,
        description: description ?? undefined,
        isActive: typeof isActive === 'boolean' ? isActive : undefined,
      }
    })

    return NextResponse.json({ id: updated.id, name: updated.name })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Kategori med dette navnet/slug finnes allerede' }, { status: 409 })
    }
    console.error('Feil ved oppdatering av kategori:', error)
    return NextResponse.json({ error: 'Kunne ikke oppdatere kategori' }, { status: 500 })
  }
}

// DELETE - Slett kategori (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
    }

    const { prisma: prismaLib } = await import('@/lib/prisma')
    const dbUser = await prismaLib.user.findUnique({ where: { email: session.user.email } })
    if (!dbUser || dbUser.role !== 'admin') {
      return NextResponse.json({ error: 'Kun administrator kan endre kategorier' }, { status: 403 })
    }

    const { id } = await params

    // Ikke tillat sletting hvis kategorien har annonser
    const count = await prisma.listing.count({ where: { categoryId: id } })
    if (count > 0) {
      return NextResponse.json({ error: 'Kan ikke slette kategori med eksisterende annonser' }, { status: 400 })
    }

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Feil ved sletting av kategori:', error)
    return NextResponse.json({ error: 'Kunne ikke slette kategori' }, { status: 500 })
  }
}


