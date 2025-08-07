import { NextRequest, NextResponse } from 'next/server'

// GET - Debug webhook setup
export async function GET(request: NextRequest) {
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
    const clerkSecretKey = process.env.CLERK_SECRET_KEY
    const publicKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

    return NextResponse.json({
      webhook: {
        secret: webhookSecret ? 'Satt ✅' : 'Mangler ❌',
        url: 'Skal være: https://ditt-domene.no/api/webhooks/clerk',
        events: [
          'user.created',
          'user.updated', 
          'user.deleted'
        ]
      },
      environment: {
        clerkSecretKey: clerkSecretKey ? 'Satt ✅' : 'Mangler ❌',
        publicKey: publicKey ? 'Satt ✅' : 'Mangler ❌',
        nodeEnv: process.env.NODE_ENV
      },
      instructions: [
        '1. Gå til Clerk Dashboard → Webhooks',
        '2. Legg til endpoint: https://ditt-domene.no/api/webhooks/clerk',
        '3. Velg events: user.created, user.updated, user.deleted',
        '4. Kopier webhook secret til CLERK_WEBHOOK_SECRET i .env.local',
        '5. Test webhook ved å opprette ny bruker'
      ],
      testing: {
        localWebhook: 'http://localhost:3000/api/webhooks/clerk',
        ngrokExample: 'https://abc123.ngrok.io/api/webhooks/clerk'
      }
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Kunne ikke debug webhook',
      details: error instanceof Error ? error.message : 'Ukjent feil'
    }, { status: 500 })
  }
}