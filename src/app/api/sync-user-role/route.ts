import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    console.log('Synkroniserer bruker:', clerkUser.id)

    // Sjekk om bruker allerede eksisterer
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id }
    })

    if (existingUser) {
      console.log('Bruker eksisterer allerede:', existingUser.id)
      return NextResponse.redirect(new URL('/dashboard/customer', request.url))
    }

    // Opprett bruker i database
    const newUser = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('Ny bruker opprettet:', newUser.id)

    // Redirect tilbake til dashboard
    return NextResponse.redirect(new URL('/dashboard/customer', request.url))

  } catch (error) {
    console.error('Feil ved brukersynkronisering:', error)
    
    // Redirect til error page eller dashboard med error parameter
    return NextResponse.redirect(new URL('/dashboard/customer?error=sync_failed', request.url))
  }
}