import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    const user = await currentUser()
    
    if (!userId && !user) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    // Oppdater Clerk metadata for å indikere at business setup ble hoppet over
    const clerkClient = (await import('@clerk/nextjs/server')).clerkClient
    const client = await clerkClient()
    
    await client.users.updateUserMetadata(user?.id || userId, {
      publicMetadata: {
        ...user?.publicMetadata,
        role: 'customer', // Fall back til customer role
        businessSetupSkipped: true,
        businessSetupComplete: false
      }
    })

    console.log('✅ Business setup hoppet over for bruker:', user?.id || userId)

    return NextResponse.json({
      success: true,
      message: 'Business setup hoppet over. Du kan fullføre dette senere.'
    })

  } catch (error) {
    console.error('❌ Feil ved hopping over business setup:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hoppe over business setup' },
      { status: 500 }
    )
  }
}
