import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'
import { RateHawkHotelSearchParams } from '@/lib/types'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSupportSessionId, logHotelRequest } from '@/lib/support-session-logger'

export async function POST(request: NextRequest) {
  const start = Date.now()
  const supportSessionId = getSupportSessionId(request)

  try {
    console.log('🏨 API: Hotel search request received')

    const body = await request.json()
    console.log('🏨 API: Request body:', body)

    // Hent user country fra session/database
    let userCountry: string | null = null
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { location: true }
        })
        userCountry = dbUser?.location || null
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch user country:', error)
    }

    const params: RateHawkHotelSearchParams = {
      destination: body.destination,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      adults: body.adults || 2,
      children: body.children || [],
      rooms: body.rooms || 1,
      currency: body.currency || 'NOK'
    }

    console.log('🏨 API: Searching hotels with params:', params, 'userCountry:', userCountry)

    const result = await ratehawkClient.searchHotels(params, userCountry)

    console.log('🏨 API: Search completed, hotels found:', result.hotels?.length || 0)

    // Hvis søket feilet, returner feilmelding med riktig status code
    if (!result.success) {
      const res = NextResponse.json(
        {
          success: false,
          error: result.error || 'Hotel search failed',
          technicalError: result.technicalError,
          hotels: [],
          totalResults: 0
        },
        { status: 400 } // 400 Bad Request for brukerfeil, ikke 500
      )
      if (supportSessionId) {
        void logHotelRequest({
          supportSessionId,
          path: '/api/hotels/search',
          method: 'POST',
          requestBody: body,
          responseStatus: 400,
          responseBody: { success: false, error: result.error, technicalError: result.technicalError, hotels: [], totalResults: 0 },
          durationMs: Date.now() - start,
        })
      }
      return res
    }

    const res = NextResponse.json(result)
    if (supportSessionId) {
      void logHotelRequest({
        supportSessionId,
        path: '/api/hotels/search',
        method: 'POST',
        requestBody: body,
        responseStatus: 200,
        responseBody: result as Record<string, unknown>,
        durationMs: Date.now() - start,
      })
    }
    return res

  } catch (error: unknown) {
    const err = error as { message?: string }
    console.error('❌ API: Hotel search error:', error)

    // Parse feilmelding for bedre brukeropplevelse
    let userFriendlyError = 'Kunne ikke søke etter hoteller'
    if (err.message?.includes('region') || err.message?.includes('cannot be searched')) {
      userFriendlyError = 'Denne destinasjonen kan ikke søkes. Prøv Oslo eller test hotel (ID: 8473727).'
    }

    const errorBody = {
      success: false,
      error: userFriendlyError,
      technicalError: err.message || 'Unknown error',
      hotels: [],
      totalResults: 0,
    }
    if (supportSessionId) {
      void logHotelRequest({
        supportSessionId,
        path: '/api/hotels/search',
        method: 'POST',
        requestBody: null,
        responseStatus: 500,
        responseBody: errorBody,
        durationMs: Date.now() - start,
      })
    }
    return NextResponse.json(errorBody, { status: 500 })
  }
}