import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, role } = await request.json()

    // Valider input
    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Mangler påkrevde felt: email, firstName, lastName, role' },
        { status: 400 }
      )
    }

    if (!['admin', 'moderator', 'customer'].includes(role)) {
      return NextResponse.json(
        { error: 'Ugyldig rolle. Må være: admin, moderator, eller customer' },
        { status: 400 }
      )
    }

    // Sjekk om bruker allerede eksisterer
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bruker med denne e-postadressen eksisterer allerede' },
        { status: 400 }
      )
    }

    // Opprett bruker i database (uten Clerk først)
    const dbUser = await prisma.user.create({
      data: {
        id: `temp_${Date.now()}`, // Midlertidig ID
        email: email,
        firstName,
        lastName,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: `${role} opprettet vellykket i database`,
      note: 'Clerk-integrasjon midlertidig deaktivert',
      user: {
        id: dbUser.id,
        email: email,
        firstName,
        lastName,
        role: role
      }
    })

  } catch (error: any) {
    console.error('Feil ved opprettelse av bruker:', error)
    
    return NextResponse.json(
      { 
        error: 'Kunne ikke opprette bruker',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// GET endpoint for å liste brukere fra database
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      database_connected: true,
      users: users,
      count: users.length
    })

  } catch (error: any) {
    console.error('Feil ved henting av brukere:', error)
    return NextResponse.json(
      { 
        error: 'Feil ved tilkobling til database', 
        details: error.message
      },
      { status: 500 }
    )
  }
}