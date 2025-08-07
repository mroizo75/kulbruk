import { NextRequest, NextResponse } from 'next/server'
import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Tving synkronisering av current user (bruker currentUser i stedet for auth)
export async function POST(request: NextRequest) {
  try {
    console.log('Force sync startet...')
    
    // Bruk currentUser() som er mer pålitelig
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { 
          error: 'Ikke autentisert med currentUser()', 
          message: 'currentUser() returnerte null - du må være logget inn' 
        },
        { status: 401 }
      )
    }

    console.log('Current user funnet:', user.id)

    // Hent full brukerinfo fra Clerk
    const client = await clerkClient()
    const fullClerkUser = await client.users.getUser(user.id)
    
    console.log('Full Clerk user hentet:', fullClerkUser.id)

    // Sjekk om bruker finnes i database
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    })

    console.log('Existing DB user:', existingUser?.id || 'Not found')

    const userRole = fullClerkUser.publicMetadata?.role as string || 'customer'

    let dbUser
    if (existingUser) {
      // Oppdater eksisterende bruker
      dbUser = await prisma.user.update({
        where: { clerkId: user.id },
        data: {
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          role: userRole,
          avatar: user.imageUrl,
          phone: user.phoneNumbers[0]?.phoneNumber || null,
          updatedAt: new Date()
        }
      })
      console.log('User updated in DB:', dbUser.id)
    } else {
      // Opprett ny bruker
      dbUser = await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          role: userRole,
          avatar: user.imageUrl,
          phone: user.phoneNumbers[0]?.phoneNumber || null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log('User created in DB:', dbUser.id)
    }

    return NextResponse.json({
      success: true,
      message: existingUser ? 'Bruker oppdatert i database' : 'Bruker opprettet i database',
      clerk: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        role: userRole,
        imageUrl: user.imageUrl
      },
      database: {
        id: dbUser.id,
        clerkId: dbUser.clerkId,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role,
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt
      },
      action: existingUser ? 'updated' : 'created'
    })

  } catch (error) {
    console.error('Force sync feil:', error)
    return NextResponse.json(
      { 
        error: 'Kunne ikke tvinge synkronisering', 
        details: error instanceof Error ? error.message : 'Ukjent feil',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}