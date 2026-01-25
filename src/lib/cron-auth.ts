import { NextResponse } from 'next/server'
import crypto from 'crypto'

export function ensureCronAuthorized(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET
  if (!secret || secret.length < 32) {
    return NextResponse.json({ error: 'Cron disabled: CRON_SECRET not configured properly' }, { status: 503 })
  }
  
  const headerKey = req.headers.get('x-cron-key') || req.headers.get('X-CRON-KEY')
  const provided = headerKey || null

  if (!provided) {
    return NextResponse.json({ error: 'Unauthorized: missing x-cron-key header' }, { status: 401 })
  }

  try {
    const tokenMatch = crypto.timingSafeEqual(
      Buffer.from(provided),
      Buffer.from(secret)
    )
    
    if (!tokenMatch) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}


