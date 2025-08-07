import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

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