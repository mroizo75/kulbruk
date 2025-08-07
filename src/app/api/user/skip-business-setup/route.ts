import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    // NextAuth: oppdater ikke Clerk, bare returner OK (rollen håndteres i DB)

    console.log('✅ Business setup hoppet over for bruker:', session.user.email)

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
