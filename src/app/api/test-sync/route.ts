import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { getUserRole, getUserInfo } from '@/lib/user-utils'

const prisma = new PrismaClient()

// GET - Test Clerk synkronisering
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'Ikke autentisert', 
          message: 'Du må være logget inn for å teste synkronisering. Gå til /sign-in først.',
          isLoggedIn: false
        },
        { status: 401 }
      )
    }

    // Hent informasjon fra forskjellige kilder
    const clerkUser = await (await clerkClient()).users.getUser(userId)
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    })
    const userRole = await getUserRole()
    const userInfo = await getUserInfo()

    // Sjekk om bruker eksisterer i database
    let syncStatus = 'OK'
    if (!dbUser) {
      syncStatus = 'BRUKER_MANGLER_I_DB'
      
      // Opprett bruker i database hvis den mangler
      await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          role: (clerkUser.publicMetadata?.role as string) || 'customer',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      syncStatus = 'BRUKER_OPPRETTET_I_DB'
    }

    return NextResponse.json({
      syncStatus,
      clerk: {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        role: clerkUser.publicMetadata?.role,
        createdAt: clerkUser.createdAt
      },
      database: dbUser ? {
        id: dbUser.id,
        clerkId: dbUser.clerkId,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role,
        companyName: dbUser.companyName,
        createdAt: dbUser.createdAt
      } : null,
      utilities: {
        getUserRole: userRole,
        getUserInfo: userInfo
      },
      message: 'Synkronisering sjekket og justert om nødvendig'
    })

  } catch (error) {
    console.error('Feil ved synkronisering test:', error)
    return NextResponse.json(
      { error: 'Kunne ikke teste synkronisering', details: error },
      { status: 500 }
    )
  }
}

// POST - Manuell synkronisering av current user
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    const clerkUser = await (await clerkClient()).users.getUser(userId)
    
    // Oppdater eller opprett bruker i database
    const upsertedUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        role: (clerkUser.publicMetadata?.role as string) || 'customer',
        updatedAt: new Date()
      },
      create: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        role: (clerkUser.publicMetadata?.role as string) || 'customer',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Bruker synkronisert',
      user: upsertedUser
    })

  } catch (error) {
    console.error('Feil ved manuell synkronisering:', error)
    return NextResponse.json(
      { error: 'Kunne ikke synkronisere bruker' },
      { status: 500 }
    )
  }
}