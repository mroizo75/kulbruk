import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
    }

    let dbUser = null
    let allUsers: any[] = []
    let userCount = 0
    let databaseError = null

    // Test database-tilkobling først
    try {
      dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id }
      })

      userCount = await prisma.user.count()

      // Hent alle brukere for debug (kun i development)
      if (process.env.NODE_ENV === 'development') {
        allUsers = await prisma.user.findMany({ take: 10 })
      }
    } catch (dbError) {
      console.error('Database tilkoblingsfeil:', dbError)
      databaseError = dbError instanceof Error ? dbError.message : 'Ukjent database-feil'
      
      // Hvis det er en autentiseringsfeil, gi spesifikk hjelp
      if (databaseError.includes('sha256_password')) {
        databaseError = 'MySQL autentiseringsfeil: sha256_password ikke støttet. Se MYSQL_FIX_GUIDE.md for løsning.'
      }
    }

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
        allUsersCount: userCount,
        recentUsers: allUsers,
        webhookStatus: databaseError 
          ? `Database-feil: ${databaseError}`
          : 'Sjekk Clerk Dashboard for webhook-konfigurasjonen',
        environment: process.env.NODE_ENV,
        databaseError: databaseError
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