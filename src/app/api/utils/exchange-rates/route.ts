import { NextResponse } from 'next/server'
import { getECBRates } from '@/lib/ecb-rates'

export async function GET() {
  try {
    const rates = await getECBRates()
    return NextResponse.json(
      { rates },
      {
        headers: {
          // Browsers can cache 1 h; CDN/edge can cache 24 h
          'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600',
        },
      }
    )
  } catch (error) {
    console.error('Failed to fetch ECB rates:', error)
    return NextResponse.json({ rates: {} }, { status: 500 })
  }
}
