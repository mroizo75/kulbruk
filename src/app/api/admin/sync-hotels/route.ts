import { NextRequest, NextResponse } from 'next/server'
import { getHotelCount, getLastSync } from '@/lib/hotel-static-db'

const SYNC_SECRET = process.env.SYNC_SECRET

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function validateSecret(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  const secret = auth?.replace('Bearer ', '').trim()
  return !!SYNC_SECRET && secret === SYNC_SECRET
}

/** GET /api/admin/sync-hotels – vis status */
export async function GET(req: NextRequest) {
  if (!validateSecret(req)) return unauthorized()

  const count = getHotelCount()
  const lastSync = getLastSync()

  return NextResponse.json({
    hotels_in_db: count,
    last_sync: lastSync
      ? {
          type: lastSync.type,
          ended_at: new Date(lastSync.ended_at * 1000).toISOString(),
          inserted: lastSync.inserted,
        }
      : null,
    status: count > 0 ? 'ready' : 'empty',
  })
}

/** POST /api/admin/sync-hotels – start synkronisering */
export async function POST(req: NextRequest) {
  if (!validateSecret(req)) return unauthorized()

  const body = await req.json().catch(() => ({}))
  const type: 'full' | 'incremental' = body.type === 'incremental' ? 'incremental' : 'full'

  // Start sync asynkront (svar umiddelbart, sync kjører i bakgrunnen)
  // På VPS kjøres dette i long-lived Node.js process
  startSyncInBackground(type)

  return NextResponse.json({
    message: `${type === 'full' ? 'Full' : 'Inkrementell'} sync startet i bakgrunnen`,
    type,
  })
}

async function startSyncInBackground(type: 'full' | 'incremental') {
  // Importer dynamisk for å unngå at Next.js bundler trekker inn fs-moduler i klient-kode
  const { execFile } = await import('child_process')
  const path = await import('path')

  const scriptPath = path.join(process.cwd(), 'scripts', 'sync-hotel-dump.ts')
  const args = type === 'incremental' ? ['--incremental'] : []

  const child = execFile(
    'npx',
    ['tsx', scriptPath, ...args],
    { cwd: process.cwd(), env: process.env },
    (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Sync feilet:', error.message)
        if (stderr) console.error(stderr)
      } else {
        console.log('✅ Sync fullført:', stdout)
      }
    }
  )

  child.unref()
}
