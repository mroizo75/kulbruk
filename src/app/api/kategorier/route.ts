import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Hent alle kategorier
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            listings: {
              where: {
                status: 'APPROVED'
              }
            }
          }
        }
      }
    })

    // Transformer data for frontend
    const categoriesWithCount = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      count: category._count.listings
    }))

    return NextResponse.json(categoriesWithCount)

  } catch (error) {
    console.error('Feil ved henting av kategorier:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente kategorier' },
      { status: 500 }
    )
  }
}

// Helper for å lage slug fra navn
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// POST - Opprett ny kategori (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
    }

    // Verifiser admin i DB
    const user = await prisma.category.findFirst({}) // dummy for type init
    const { prisma: prismaLib } = await import('@/lib/prisma')
    const dbUser = await prismaLib.user.findUnique({ where: { email: session.user.email } })
    if (!dbUser || dbUser.role !== 'admin') {
      return NextResponse.json({ error: 'Kun administrator kan endre kategorier' }, { status: 403 })
    }

    const body = await request.json()
    const name: string | undefined = body?.name
    const icon: string | undefined = body?.icon
    const description: string | undefined = body?.description

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Kategorinavn er påkrevd' }, { status: 400 })
    }

    const slug = slugify(name)

    // Finn neste sortOrder
    const maxSort = await prisma.category.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true }
    })
    const sortOrder = (maxSort?.sortOrder ?? 0) + 1

    const created = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description ?? null,
        icon: icon ?? null,
        isActive: true,
        sortOrder,
      }
    })

    return NextResponse.json({
      id: created.id,
      name: created.name,
      slug: created.slug,
      description: created.description,
      icon: created.icon,
      count: 0
    }, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Kategori med dette navnet/slug finnes allerede' }, { status: 409 })
    }
    console.error('Feil ved opprettelse av kategori:', error)
    return NextResponse.json({ error: 'Kunne ikke opprette kategori' }, { status: 500 })
  }
}