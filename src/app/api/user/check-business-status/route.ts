import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    const user = await currentUser()
    
    console.log('=== CHECK-BUSINESS-STATUS API ===')
    console.log('UserId:', userId)
    console.log('User ID:', user?.id)
    console.log('User email:', user?.emailAddresses[0]?.emailAddress)
    
    if (!userId && !user) {
      console.log('❌ Ikke autentisert')
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    // Sjekk database først
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user?.id || userId },
      select: { 
        role: true, 
        companyName: true, 
        orgNumber: true 
      }
    })

    console.log('Database bruker:', dbUser)

    // Sjekk Clerk metadata
    const clerkRole = user?.publicMetadata?.role
    const businessSetupComplete = user?.publicMetadata?.businessSetupComplete

    console.log('Clerk metadata:', { 
      role: clerkRole, 
      businessSetupComplete,
      publicMetadata: user?.publicMetadata,
      unsafeMetadata: user?.unsafeMetadata 
    })

    const isBusinessSetup = (
      (dbUser?.role === 'business' && dbUser.companyName && dbUser.orgNumber) ||
      (clerkRole === 'business' && businessSetupComplete === true)
    )

    console.log('Business setup status:', isBusinessSetup)
    console.log('=== END CHECK-BUSINESS-STATUS ===')

    return NextResponse.json({
      success: true,
      isBusinessSetup,
      currentRole: dbUser?.role || clerkRole || 'customer',
      hasCompanyInfo: !!(dbUser?.companyName && dbUser?.orgNumber),
      clerkMetadata: {
        role: clerkRole,
        businessSetupComplete: businessSetupComplete
      },
      debug: {
        dbUser,
        clerkRole,
        businessSetupComplete
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
