import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
    }

    // Simuler en user.created webhook for den innloggede brukeren
    const mockWebhookPayload = {
      data: {
        id: session.user.id,
        object: "user",
        email_addresses: [
          {
            email_address: session.user.email || 'test@kulbruk.no',
            id: "idn_test",
            object: "email_address"
          }
        ],
        first_name: session.user.firstName || 'Test',
        last_name: session.user.lastName || 'Bruker',
        public_metadata: {
          role: 'customer'
        },
        created_at: Date.now(),
        updated_at: Date.now()
      },
      object: "event",
      type: "user.created"
    }

    // Kall vår egen webhook
    const webhookUrl = new URL('/api/webhooks/clerk', request.url)
    const webhookResponse = await fetch(webhookUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'svix-id': 'test_' + Date.now(),
        'svix-timestamp': Math.floor(Date.now() / 1000).toString(),
        'svix-signature': 'test_signature' // I produksjon ville denne vært signert
      },
      body: JSON.stringify(mockWebhookPayload)
    })

    const webhookResult = await webhookResponse.text()

    return NextResponse.json({
      success: true,
      message: 'Simulert webhook sendt',
      payload: mockWebhookPayload,
      webhookResponse: {
        status: webhookResponse.status,
        body: webhookResult
      }
    })

  } catch (error) {
    console.error('Feil ved webhook-test:', error)
    return NextResponse.json({ 
      error: 'Webhook test feilet',
      details: error instanceof Error ? error.message : 'Ukjent feil'
    }, { status: 500 })
  }
}
