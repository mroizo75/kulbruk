import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('=== CHECK-BUSINESS-STATUS API ===')
    console.log('Session user:', session?.user)
    
    if (!session?.user) {
      console.log('❌ Ikke autentisert')
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    // Sjekk database først
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { 
        role: true, 
        companyName: true, 
        orgNumber: true 
      }
    })

    console.log('Database bruker:', dbUser)

    // Ikke lenger Clerk metadata i bruk

    const isBusinessSetup = (
      dbUser?.role === 'business' && !!dbUser.companyName && !!dbUser.orgNumber
    )

    console.log('Business setup status:', isBusinessSetup)
    console.log('=== END CHECK-BUSINESS-STATUS ===')

    return NextResponse.json({
      success: true,
      isBusinessSetup,
      currentRole: dbUser?.role || 'customer',
      hasCompanyInfo: !!(dbUser?.companyName && dbUser?.orgNumber),
      clerkMetadata: null,
      debug: {
        dbUser,
        sessionUser: session.user
      }
    })

  } catch (error) {
    console.error('Feil ved sjekk av business status:', error)
    return NextResponse.json(
      { error: 'Kunne ikke sjekke business status' },
      { status: 500 }
    )
  }
}
