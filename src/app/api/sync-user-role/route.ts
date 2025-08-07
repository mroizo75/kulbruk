import { NextRequest, NextResponse } from 'next/server'
import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Ikke innlogget' },
        { status: 401 }
      )
    }

    console.log('=== SYNC USER ROLE DEBUG ===')
    console.log('Clerk User ID:', user.id)
    console.log('Clerk Email:', user.emailAddresses[0]?.emailAddress)
    console.log('Clerk publicMetadata:', user.publicMetadata)

    // Hent database bruker
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    })

    console.log('Database bruker:', dbUser)

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Bruker ikke funnet i database' },
        { status: 404 }
      )
    }

    // Synkroniser rolle fra database til Clerk
    const client = await clerkClient()
    
    await client.users.updateUserMetadata(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        role: dbUser.role
      }
    })

    console.log(`Synkronisert rolle ${dbUser.role} til Clerk for ${dbUser.email}`)

    return NextResponse.json({
      success: true,
      message: 'Rolle synkronisert',
      data: {
        clerkId: user.id,
        email: dbUser.email,
        databaseRole: dbUser.role,
        clerkRole: user.publicMetadata?.role,
        newClerkRole: dbUser.role
      }
    })

  } catch (error) {
    console.error('Feil ved synkronisering:', error)
    return NextResponse.json(
      { error: 'Kunne ikke synkronisere rolle' },
      { status: 500 }
    )
  }
}