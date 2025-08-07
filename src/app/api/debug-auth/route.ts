import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// GET - Debug autentisering (public endpoint)
export async function GET(request: NextRequest) {
  try {
    // Test NextAuth session
    const session = await auth()
    console.log('Session result:', session)
    
    // Ingen currentUser() i NextAuth
    let user = session?.user || null
    let userError = null

    // Sjekk headers for debugging
    const headers = Object.fromEntries(request.headers.entries())
    
    return NextResponse.json({
      debug: {
        session: {
          userId: session?.user?.id || null,
          email: session?.user?.email || null,
          role: session?.user?.role || null,
          sessionType: typeof session,
        },
        currentUser: user ? {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          name: user.name
        } : null,
        userError: userError,
        isAuthenticated: !!session?.user,
        isUserLoaded: !!user,
        hasSession: !!session,
        timestamp: new Date().toISOString(),
        url: request.url,
        method: request.method,
        userAgent: headers['user-agent'],
        nextAuthHeaders: {
          authorization: headers['authorization'] ? 'Present' : 'Missing',
          cookie: headers['cookie'] ? 'Present' : 'Missing',
          'next-auth.session-token': headers['next-auth.session-token'] ? 'Present' : 'Missing'
        }
      },
      instructions: {
        message: session?.user ? 
          'Du er logget inn med NextAuth! Dashboard tilgjengelig.' : 
          'Du er ikke logget inn. Gå til /sign-in først.',
        nextSteps: session?.user ? [
          'Test synkronisering: GET /api/test-sync',
          'Se dashboard: /dashboard',
          'Test bedrift dashboard: /dashboard/business'
        ] : [
          'Gå til /sign-in for å logge inn',
          'Eller gå til /sign-up for å registrere deg',
          'Deretter test denne API-en igjen'
        ]
      }
    })

  } catch (error) {
    console.error('Debug auth feil:', error)
    return NextResponse.json({
      error: 'Feil ved debug av autentisering',
      details: error instanceof Error ? error.message : 'Ukjent feil',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}