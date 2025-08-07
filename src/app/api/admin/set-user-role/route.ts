import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { UserRole } from '@/lib/types'

const prisma = new PrismaClient()

// POST - Sett brukerrolle (kun for admins)
export async function POST(request: NextRequest) {
  try {
    const { userId: currentUserId } = auth()
    
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    // Sjekk at kun admin kan endre roller
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: currentUserId },
      select: { role: true }
    })

    if (currentUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Kun administratorer kan endre brukerroller' },
        { status: 403 }
      )
    }

    const { targetUserId, newRole } = await request.json()

    // Valider input
    if (!targetUserId || !newRole) {
      return NextResponse.json(
        { error: 'targetUserId og newRole er påkrevd' },
        { status: 400 }
      )
    }

    const validRoles: UserRole[] = ['customer', 'admin', 'moderator', 'business']
    if (!validRoles.includes(newRole as UserRole)) {
      return NextResponse.json(
        { error: 'Ugyldig rolle' },
        { status: 400 }
      )
    }

    // Oppdater rolle i Clerk
    const client = await clerkClient()
    await client.users.updateUserMetadata(targetUserId, {
      publicMetadata: {
        role: newRole
      }
    })

    // Oppdater rolle i database
    await prisma.user.updateMany({
      where: { clerkId: targetUserId },
      data: { 
        role: newRole as UserRole,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: `Brukerrolle oppdatert til ${newRole}`,
      targetUserId,
      newRole
    })

  } catch (error) {
    console.error('Feil ved oppdatering av brukerrolle:', error)
    return NextResponse.json(
      { error: 'Kunne ikke oppdatere brukerrolle' },
      { status: 500 }
    )
  }
}

// GET - Hent brukerroller (for admin)
export async function GET(request: NextRequest) {
  try {
    const { userId: currentUserId } = auth()
    
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    // Sjekk admin-tilgang
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: currentUserId },
      select: { role: true }
    })

    if (currentUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Kun administratorer har tilgang' },
        { status: 403 }
      )
    }

    // Hent alle brukere med roller
    const users = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        companyName: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      users,
      total: users.length
    })

  } catch (error) {
    console.error('Feil ved henting av brukere:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente brukere' },
      { status: 500 }
    )
  }
}