import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

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

    // Hent alle brukere for debug (kun i development)
    const allUsers = process.env.NODE_ENV === 'development' 
      ? await prisma.user.findMany({ take: 10 })
      : []

    return NextResponse.json({ 
      debug: {
        clerkUser: {
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          createdAt: clerkUser.createdAt
        },
        dbUser: dbUser || null,
        isUserSynced: !!dbUser,
        allUsersCount: await prisma.user.count(),
        recentUsers: allUsers,
        webhookStatus: 'Sjekk Clerk Dashboard for webhook-konfigurasjonen',
        environment: process.env.NODE_ENV
      }
    })

  } catch (error) {
    console.error('Debug API feil:', error)
    return NextResponse.json({ 
      error: 'Debug feil',
      details: error instanceof Error ? error.message : 'Ukjent feil'
    }, { status: 500 })
  }
}