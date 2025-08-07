import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

// GET - Debug autentisering (public endpoint)
export async function GET(request: NextRequest) {
  try {
    // Test auth() funksjonen
    const authResult = await auth()
    console.log('Auth result:', authResult)
    
    // Test currentUser() funksjonen
    let user = null
    let userError = null
    try {
      user = await currentUser()
      console.log('Current user:', user?.id)
    } catch (error) {
      console.error('currentUser() feilet:', error)
      userError = error instanceof Error ? error.message : 'Ukjent feil'
    }

    // Sjekk headers for debugging
    const headers = Object.fromEntries(request.headers.entries())
    
    return NextResponse.json({
      debug: {
        auth: {
          userId: authResult?.userId || null,
          sessionId: authResult?.sessionId || null,
          orgId: authResult?.orgId || null,
          authType: typeof authResult,
        },
        currentUser: user ? {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.publicMetadata?.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        } : null,
        userError: userError,
        isAuthenticated: !!authResult?.userId,
        isUserLoaded: !!user,
        discrepancy: !!user && !authResult?.userId, // Client har bruker, server ikke
        timestamp: new Date().toISOString(),
        url: request.url,
        method: request.method,
        userAgent: headers['user-agent'],
        clerkHeaders: {
          authorization: headers['authorization'] ? 'Present' : 'Missing',
          cookie: headers['cookie'] ? 'Present' : 'Missing',
          'clerk-session': headers['clerk-session'] ? 'Present' : 'Missing'
        }
      },
      instructions: {
        message: authResult?.userId ? 
          'Du er logget inn! Nå kan du teste /api/test-sync' : 
          'Du er ikke logget inn. Gå til /sign-in først.',
        nextSteps: authResult?.userId ? [
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