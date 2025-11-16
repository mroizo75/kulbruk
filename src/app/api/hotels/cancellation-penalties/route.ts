import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'

export async function POST(request: NextRequest) {
  try {
    console.log('💰 API: Get cancellation penalties request received')

    const body = await request.json()
    const { partnerOrderId } = body

    console.log('💰 API: Get penalties for:', partnerOrderId)

    if (!partnerOrderId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: partnerOrderId'
      }, { status: 400 })
    }

    // Hent cancellation penalties
    const result = await ratehawkClient.getCancellationPenalties(partnerOrderId)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to get cancellation penalties'
      }, { status: 500 })
    }

    console.log('✅ API: Cancellation penalties retrieved')

    return NextResponse.json({
      success: true,
      penalties: result.penalties,
      orderInfo: result.orderInfo
    })

  } catch (error: any) {
    console.error('❌ API: Get cancellation penalties error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get cancellation penalties',
      details: error.message
    }, { status: 500 })
  }
}

