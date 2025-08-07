import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { notificationManager } from '@/lib/notification-manager'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new Response('Ikke autentisert', { status: 401 })
    }

    // Sjekk at brukeren er admin eller moderator
    const currentUserDb = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!currentUserDb || (currentUserDb.role !== 'admin' && currentUserDb.role !== 'moderator')) {
      return new Response('Kun admin og moderatorer har tilgang', { status: 403 })
    }

    // Opprett Server-Sent Events stream
    const stream = new ReadableStream({
      start(controller) {
        // Legg til connection i notification manager
        notificationManager.addConnection(currentUserDb.id, controller, new Response())

        console.log(`SSE: ${currentUserDb.role} ${currentUserDb.email} koblet til notifikasjoner`)
        
        // Send initial connection confirmation
        const welcome = `data: ${JSON.stringify({
          id: `welcome_${Date.now()}`,
          type: 'connection',
          title: 'Tilkoblet',
          message: `Real-time notifikasjoner er aktive for ${currentUserDb.role}`,
          timestamp: new Date().toISOString(),
          connectionCount: notificationManager.getConnectionCount()
        })}\n\n`
        
        controller.enqueue(new TextEncoder().encode(welcome))

        // Heartbeat for å holde connection alive
        const heartbeatInterval = setInterval(() => {
          try {
            const heartbeat = `data: ${JSON.stringify({
              id: `heartbeat_${Date.now()}`,
              type: 'heartbeat',
              timestamp: new Date().toISOString(),
              connectionCount: notificationManager.getConnectionCount()
            })}\n\n`
            
            controller.enqueue(new TextEncoder().encode(heartbeat))
          } catch (error) {
            console.log('SSE: Heartbeat feilet, lukker connection')
            clearInterval(heartbeatInterval)
            notificationManager.removeConnection(currentUserDb.id)
          }
        }, 30000) // Heartbeat hvert 30. sekund

        // Cleanup ved disconnect
        request.signal?.addEventListener('abort', () => {
          console.log(`SSE: ${currentUserDb.email} koblet fra`)
          clearInterval(heartbeatInterval)
          notificationManager.removeConnection(currentUserDb.id)
        })
      },

      cancel() {
        // Cleanup ved cancel
        notificationManager.removeConnection(currentUserDb.id)
      }
    })

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    })

  } catch (error) {
    console.error('SSE: Feil ved opprettelse av stream:', error)
    return new Response('Kunne ikke opprette notification stream', { status: 500 })
  }
}
