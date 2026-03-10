#!/usr/bin/env tsx
/**
 * RateHawk Hotel Static Data Sync
 *
 * Last ned hele hotell-dumpen fra RateHawk og lagre i SQLite.
 * Kjør ukentlig for full dump og daglig for inkrementell dump.
 *
 * Bruk:
 *   npx tsx scripts/sync-hotel-dump.ts          # full dump
 *   npx tsx scripts/sync-hotel-dump.ts --incremental  # inkrementell
 *   npx tsx scripts/sync-hotel-dump.ts --status       # vis statistikk
 */

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { pipeline } from 'stream/promises'
import { createWriteStream } from 'fs'

import {
  upsertHotelBatch,
  getHotelCount,
  logSyncStart,
  logSyncEnd,
  getLastSync,
} from '../src/lib/hotel-static-db'

const API_KEY_ID = process.env.RATEHAWK_KEY_ID
const ACCESS_TOKEN = process.env.RATEHAWK_ACCESS_TOKEN
const RATEHAWK_BASE_URL = process.env.RATEHAWK_BASE_URL || 'https://api.worldota.net/api/b2b/v3'

const DUMP_DIR = path.join(process.cwd(), 'data')
const COMPRESSED_PATH = path.join(DUMP_DIR, 'hotel-dump.jsonl.zst')
const DECOMPRESSED_PATH = path.join(DUMP_DIR, 'hotel-dump.jsonl')
const BATCH_SIZE = 500

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`)
}

function formatMB(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

async function ratehawkPost(endpoint: string, body: Record<string, any>) {
  if (!API_KEY_ID || !ACCESS_TOKEN) {
    throw new Error('RATEHAWK_KEY_ID og RATEHAWK_ACCESS_TOKEN må være satt i .env')
  }

  const credentials = Buffer.from(`${API_KEY_ID}:${ACCESS_TOKEN}`).toString('base64')
  const res = await fetch(`${RATEHAWK_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`RateHawk ${endpoint} svarte ${res.status}: ${text}`)
  }

  return res.json()
}

// ─── Download ─────────────────────────────────────────────────────────────────

async function downloadFile(url: string, destPath: string): Promise<number> {
  log(`Laster ned: ${url.substring(0, 80)}...`)

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Nedlasting feilet: ${res.status}`)

  const contentLength = Number(res.headers.get('content-length') ?? 0)
  if (contentLength > 0) {
    log(`Filstørrelse: ${formatMB(contentLength)}`)
  }

  const fileStream = createWriteStream(destPath)
  await pipeline(res.body as any, fileStream)

  const { size } = fs.statSync(destPath)
  log(`Lastet ned: ${formatMB(size)}`)
  return size
}

// ─── Decompress ───────────────────────────────────────────────────────────────

async function decompress(srcPath: string, destPath: string): Promise<void> {
  log('Dekomprimerer dump-fil (zstd)...')

  // Prøv zstd CLI-verktøy først (installert på VPS), deretter Node-basert fallback
  const { execSync } = await import('child_process')
  try {
    execSync(`zstd -d "${srcPath}" -o "${destPath}" -f`, { stdio: 'inherit' })
    const { size } = fs.statSync(destPath)
    log(`Dekomprimert: ${formatMB(size)}`)
    return
  } catch {
    log('zstd CLI ikke tilgjengelig, bruker Node-modul...')
  }

  // Fallback: Node-basert zstd (simple-zstd)
  const zstd = await import('simple-zstd')
  const compressed = fs.readFileSync(srcPath)
  const decompressed = await (zstd as any).decompress(compressed)
  fs.writeFileSync(destPath, decompressed)
  log(`Dekomprimert: ${formatMB(decompressed.length)}`)
}

// ─── Parse & Insert ───────────────────────────────────────────────────────────

async function parseAndInsert(filePath: string): Promise<number> {
  log('Parser JSONL og inserter i SQLite...')

  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' })
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })

  let batch: any[] = []
  let totalInserted = 0
  let lineCount = 0

  for await (const line of rl) {
    if (!line.trim()) continue
    try {
      batch.push(JSON.parse(line))
    } catch {
      // Hopp over ugyldige linjer
    }

    lineCount++
    if (batch.length >= BATCH_SIZE) {
      totalInserted += upsertHotelBatch(batch)
      batch = []

      if (lineCount % 50000 === 0) {
        log(`  Prosessert ${lineCount.toLocaleString()} linjer, insertet ${totalInserted.toLocaleString()} hoteller...`)
      }
    }
  }

  // Siste batch
  if (batch.length > 0) {
    totalInserted += upsertHotelBatch(batch)
  }

  return totalInserted
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function syncFull() {
  log('=== Full hotel dump sync startet ===')
  const logId = logSyncStart('full')

  try {
    if (!fs.existsSync(DUMP_DIR)) {
      fs.mkdirSync(DUMP_DIR, { recursive: true })
    }

    // 1. Hent nedlastings-URL fra RateHawk
    log('Henter dump-URL fra RateHawk...')
    const response = await ratehawkPost('/hotel/info/dump/', { language: 'en' })
    const dumpUrl = response?.data?.url
    if (!dumpUrl) {
      throw new Error(`Fikk ingen dump URL. Svar: ${JSON.stringify(response)}`)
    }

    // 2. Last ned komprimert fil
    await downloadFile(dumpUrl, COMPRESSED_PATH)

    // 3. Dekomprimér
    await decompress(COMPRESSED_PATH, DECOMPRESSED_PATH)

    // 4. Parse og insert i SQLite
    const inserted = await parseAndInsert(DECOMPRESSED_PATH)

    // 5. Rydd opp (fjern decompressed fil for å spare plass, behold compressed)
    fs.unlinkSync(DECOMPRESSED_PATH)

    const total = getHotelCount()
    log(`✅ Full sync ferdig. Insertet: ${inserted.toLocaleString()}, Totalt i DB: ${total.toLocaleString()}`)
    logSyncEnd(logId, inserted)

  } catch (error: any) {
    log(`❌ Full sync feilet: ${error.message}`)
    logSyncEnd(logId, 0, error.message)
    process.exit(1)
  }
}

async function syncIncremental() {
  log('=== Inkrementell hotel dump sync startet ===')
  const logId = logSyncStart('incremental')

  try {
    if (!fs.existsSync(DUMP_DIR)) {
      fs.mkdirSync(DUMP_DIR, { recursive: true })
    }

    log('Henter inkrementell dump-URL fra RateHawk...')
    const response = await ratehawkPost('/hotel/info/incremental/dump/', { language: 'en' })
    const dumpUrl = response?.data?.url

    if (!dumpUrl) {
      log('Ingen inkrementell dump tilgjengelig (kan være normalt uten endringer).')
      logSyncEnd(logId, 0)
      return
    }

    const incPath = path.join(DUMP_DIR, 'hotel-dump-incremental.jsonl.zst')
    const incDecompressedPath = path.join(DUMP_DIR, 'hotel-dump-incremental.jsonl')

    await downloadFile(dumpUrl, incPath)
    await decompress(incPath, incDecompressedPath)

    const inserted = await parseAndInsert(incDecompressedPath)

    fs.unlinkSync(incDecompressedPath)
    if (fs.existsSync(incPath)) fs.unlinkSync(incPath)

    const total = getHotelCount()
    log(`✅ Inkrementell sync ferdig. Oppdatert: ${inserted.toLocaleString()}, Totalt i DB: ${total.toLocaleString()}`)
    logSyncEnd(logId, inserted)

  } catch (error: any) {
    log(`❌ Inkrementell sync feilet: ${error.message}`)
    logSyncEnd(logId, 0, error.message)
    process.exit(1)
  }
}

function showStatus() {
  const count = getHotelCount()
  const last = getLastSync()
  console.log('\n=== Hotel Static DB Status ===')
  console.log(`Hoteller i databasen : ${count.toLocaleString()}`)
  if (last) {
    const date = new Date(last.ended_at * 1000).toLocaleString('nb-NO')
    console.log(`Siste sync           : ${date} (${last.type})`)
    console.log(`Sist insertet        : ${last.inserted.toLocaleString()}`)
  } else {
    console.log('Siste sync           : Aldri synkronisert')
  }
  console.log(`Database             : ${path.join(process.cwd(), 'data', 'hotel-static.db')}\n`)
}

// ─── Entry point ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2)

if (args.includes('--status')) {
  showStatus()
} else if (args.includes('--incremental')) {
  syncIncremental()
} else {
  syncFull()
}
