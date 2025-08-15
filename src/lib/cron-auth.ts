import { NextResponse } from 'next/server'

export function ensureCronAuthorized(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    // Hvis ingen secret er satt, blokker for sikkerhet
    return NextResponse.json({ error: 'Cron disabled: missing CRON_SECRET' }, { status: 503 })
  }
  const headerKey = req.headers.get('x-cron-key') || req.headers.get('X-CRON-KEY')
  let provided = headerKey || null
  if (!provided) {
    try {
      const url = new URL(req.url)
      provided = url.searchParams.get('cron_key') || url.searchParams.get('key')
    } catch {}
  }
  if (!provided || provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}


