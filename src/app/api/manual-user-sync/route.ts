import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
    }

    // Sjekk om bruker allerede eksisterer i database
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id }
    })

    if (existingUser) {
      return NextResponse.json({ 
        message: 'Bruker eksisterer allerede',
        user: existingUser 
      })
    }

    // Opprett bruker i database
    const newUser = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        role: 'customer', // Standard rolle
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('Bruker manuelt synkronisert:', newUser.id)

    return NextResponse.json({ 
      message: 'Bruker opprettet', 
      user: newUser 
    })

  } catch (error) {
    console.error('Feil ved manuell brukersynkronisering:', error)
    return NextResponse.json({ 
      error: 'Kunne ikke synkronisere bruker',
      details: error instanceof Error ? error.message : 'Ukjent feil'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
    }

    // Sjekk om bruker eksisterer i database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id }
    })

    return NextResponse.json({ 
      clerkUser: {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName
      },
      dbUser: dbUser || null,
      synced: !!dbUser
    })

  } catch (error) {
    console.error('Feil ved sjekk av brukersynkronisering:', error)
    return NextResponse.json({ 
      error: 'Kunne ikke sjekke bruker',
      details: error instanceof Error ? error.message : 'Ukjent feil'
    }, { status: 500 })
  }
}