import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    const user = await currentUser()
    
    if (!userId && !user) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    // Sjekk at brukeren er admin
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: userId || user?.id }
    })

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Kun admin kan endre roller' },
        { status: 403 }
      )
    }

    const targetUserId = params.id
    const { role } = await request.json()

    // Valider rolle
    const validRoles = ['admin', 'moderator', 'customer', 'business']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Ugyldig rolle' },
        { status: 400 }
      )
    }

    // Sjekk at målbrukeren eksisterer
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Bruker ikke funnet' },
        { status: 404 }
      )
    }

    // Ikke la admin endre sin egen rolle
    if (targetUser.id === adminUser.id) {
      return NextResponse.json(
        { error: 'Kan ikke endre din egen rolle' },
        { status: 400 }
      )
    }

    // Oppdater brukerrolle
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    })

    console.log(`Admin ${adminUser.email} endret rolle for ${updatedUser.email} til ${role}`)

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `Rolle endret til ${role}`
    })

  } catch (error) {
    console.error('Feil ved endring av brukerrolle:', error)
    return NextResponse.json(
      { error: 'Kunne ikke endre brukerrolle' },
      { status: 500 }
    )
  }
}