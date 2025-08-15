import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

const clients = new Map<string, ReadableStreamDefaultController>()

function sendTo(userId: string, payload: any) {
  const c = clients.get(userId)
  if (!c) return
  c.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`))
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return new Response('Unauthorized', { status: 401 })
  const userId = (session.user as any).id as string

  const stream = new ReadableStream({
    start(controller) {
      clients.set(userId, controller)
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'connected', ts: Date.now() })}\n\n`))
      request.signal?.addEventListener('abort', () => clients.delete(userId))
    },
    cancel() { clients.delete(userId) }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}

// Helper to notify
export async function notifyUser(userId: string, payload: any) {
  sendTo(userId, payload)
}


