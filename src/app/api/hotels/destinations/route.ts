import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    console.log('📍 API: Destination search:', query)

    // Hent destinasjoner fra RateHawk (inkludert når query er tom - får populære destinasjoner)
    const destinations = await ratehawkClient.searchDestinations(query)

    console.log('📍 API: Found destinations:', destinations?.length || 0)

    return NextResponse.json({
      success: true,
      destinations: destinations || []
    })

  } catch (error: any) {
    console.error('❌ API: Destination search error:', error)
    return NextResponse.json(
      {
        success: false,
        destinations: []
      },
      { status: 500 }
    )
  }
}
