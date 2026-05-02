import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = path.join(process.cwd(), 'data', 'hotel-static.db')

let _db: Database.Database | null = null

function getDb(): Database.Database {
  if (_db) return _db

  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('synchronous = NORMAL')
  _db.pragma('cache_size = -64000') // 64 MB cache

  _db.exec(`
    CREATE TABLE IF NOT EXISTS hotels (
      id                    TEXT PRIMARY KEY,
      hid                   INTEGER UNIQUE,
      name                  TEXT,
      address               TEXT,
      city_name             TEXT,
      region_name           TEXT,
      country_name          TEXT,
      star_rating           REAL DEFAULT 0,
      first_image           TEXT,
      images                TEXT,
      room_groups           TEXT,
      amenity_groups        TEXT,
      amenities             TEXT,
      facts                 TEXT,
      location              TEXT,
      description           TEXT,
      check_in_time         TEXT,
      check_out_time        TEXT,
      metapolicy_struct     TEXT,
      metapolicy_extra_info TEXT,
      kind                  TEXT,
      updated_at            INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_hotels_hid ON hotels(hid);
    CREATE TABLE IF NOT EXISTS sync_log (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      type       TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      ended_at   INTEGER,
      inserted   INTEGER DEFAULT 0,
      error      TEXT
    );
  `)

  // Migrasjon: legg til room_groups-kolonne i eksisterende databaser som mangler den
  try {
    _db.exec('ALTER TABLE hotels ADD COLUMN room_groups TEXT')
  } catch {
    // Kolonnen finnes allerede — ignorer
  }

  return _db
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HotelStaticRecord {
  id: string
  hid?: number
  name?: string
  address?: string
  city_name?: string
  region_name?: string
  country_name?: string
  star_rating?: number
  first_image?: string
  images?: string[]
  room_groups?: any[]
  amenity_groups?: Array<{ group_name: string; amenities: string[] }>
  amenities?: string[]
  facts?: Record<string, any>
  location?: Record<string, any>
  description?: string
  check_in_time?: string
  check_out_time?: string
  metapolicy_struct?: Record<string, any>
  metapolicy_extra_info?: string
  kind?: string
}

// ─── Converters ───────────────────────────────────────────────────────────────

export function rawApiToRecord(raw: any): HotelStaticRecord | null {
  if (!raw?.id) return null

  const images: string[] = []
  if (Array.isArray(raw.images)) {
    for (const img of raw.images) {
      const url = typeof img === 'string' ? img : img?.url
      if (url) images.push(url)
    }
  }

  return {
    id: raw.id,
    hid: raw.hid ?? undefined,
    name: raw.name ?? raw.hotel_name ?? undefined,
    address: raw.address ?? undefined,
    city_name: raw.city?.name ?? undefined,
    region_name: raw.region?.name ?? undefined,
    country_name: raw.region?.country_name ?? raw.country?.name ?? undefined,
    star_rating: raw.star_rating ?? raw.stars ?? 0,
    first_image: images[0] ?? undefined,
    images: images.length > 0 ? images : undefined,
    // Lagre room_groups alltid (inkl. tom array) for å unngå re-henting fra API
    room_groups: Array.isArray(raw.room_groups) ? raw.room_groups : undefined,
    amenity_groups: raw.amenity_groups ?? undefined,
    amenities: raw.amenities ?? undefined,
    facts: raw.facts ?? undefined,
    location: raw.location ?? undefined,
    description: raw.description ?? undefined,
    check_in_time: raw.check_in_time ?? undefined,
    check_out_time: raw.check_out_time ?? undefined,
    metapolicy_struct: raw.metapolicy_struct ?? undefined,
    metapolicy_extra_info: raw.metapolicy_extra_info ?? undefined,
    kind: raw.kind ?? undefined,
  }
}

/** Reconstruct nested API-compatible object so existing callers need no changes. */
export function recordToApiFormat(r: HotelStaticRecord): Record<string, any> {
  return {
    id: r.id,
    hid: r.hid,
    name: r.name,
    address: r.address,
    city: r.city_name ? { name: r.city_name } : undefined,
    region: {
      name: r.region_name,
      country_name: r.country_name,
    },
    country: r.country_name ? { name: r.country_name } : undefined,
    star_rating: r.star_rating ?? 0,
    images: r.images ?? [],
    room_groups: r.room_groups ?? [],
    amenity_groups: r.amenity_groups ?? [],
    amenities: r.amenities ?? [],
    facts: r.facts ?? {},
    location: r.location ?? {},
    description: r.description,
    check_in_time: r.check_in_time,
    check_out_time: r.check_out_time,
    metapolicy_struct: r.metapolicy_struct,
    metapolicy_extra_info: r.metapolicy_extra_info,
    kind: r.kind,
  }
}

// ─── Row deserialization ───────────────────────────────────────────────────────

function deserializeRow(row: any): HotelStaticRecord {
  return {
    id: row.id,
    hid: row.hid ?? undefined,
    name: row.name ?? undefined,
    address: row.address ?? undefined,
    city_name: row.city_name ?? undefined,
    region_name: row.region_name ?? undefined,
    country_name: row.country_name ?? undefined,
    star_rating: row.star_rating ?? 0,
    first_image: row.first_image ?? undefined,
    images: row.images ? JSON.parse(row.images) : undefined,
    room_groups: row.room_groups ? JSON.parse(row.room_groups) : undefined,
    amenity_groups: row.amenity_groups ? JSON.parse(row.amenity_groups) : undefined,
    amenities: row.amenities ? JSON.parse(row.amenities) : undefined,
    facts: row.facts ? JSON.parse(row.facts) : undefined,
    location: row.location ? JSON.parse(row.location) : undefined,
    description: row.description ?? undefined,
    check_in_time: row.check_in_time ?? undefined,
    check_out_time: row.check_out_time ?? undefined,
    metapolicy_struct: row.metapolicy_struct ? JSON.parse(row.metapolicy_struct) : undefined,
    metapolicy_extra_info: row.metapolicy_extra_info ?? undefined,
    kind: row.kind ?? undefined,
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getHotelById(id: string): HotelStaticRecord | null {
  try {
    const row = getDb().prepare('SELECT * FROM hotels WHERE id = ?').get(id) as any
    return row ? deserializeRow(row) : null
  } catch {
    return null
  }
}

export function getHotelByHid(hid: number): HotelStaticRecord | null {
  try {
    const row = getDb().prepare('SELECT * FROM hotels WHERE hid = ?').get(hid) as any
    return row ? deserializeRow(row) : null
  } catch {
    return null
  }
}

export function getHotelCount(): number {
  try {
    const row = getDb().prepare('SELECT COUNT(*) as count FROM hotels').get() as any
    return row?.count ?? 0
  } catch {
    return 0
  }
}

export function upsertHotelBatch(rawHotels: any[]): number {
  const db = getDb()

  const stmt = db.prepare(`
    INSERT INTO hotels
      (id, hid, name, address, city_name, region_name, country_name,
       star_rating, first_image, images, room_groups, amenity_groups, amenities,
       facts, location, description, check_in_time, check_out_time,
       metapolicy_struct, metapolicy_extra_info, kind, updated_at)
    VALUES
      (@id, @hid, @name, @address, @city_name, @region_name, @country_name,
       @star_rating, @first_image, @images, @room_groups, @amenity_groups, @amenities,
       @facts, @location, @description, @check_in_time, @check_out_time,
       @metapolicy_struct, @metapolicy_extra_info, @kind, @updated_at)
    ON CONFLICT(id) DO UPDATE SET
      hid                   = excluded.hid,
      name                  = excluded.name,
      address               = excluded.address,
      city_name             = excluded.city_name,
      region_name           = excluded.region_name,
      country_name          = excluded.country_name,
      star_rating           = excluded.star_rating,
      first_image           = excluded.first_image,
      images                = excluded.images,
      room_groups           = excluded.room_groups,
      amenity_groups        = excluded.amenity_groups,
      amenities             = excluded.amenities,
      facts                 = excluded.facts,
      location              = excluded.location,
      description           = excluded.description,
      check_in_time         = excluded.check_in_time,
      check_out_time        = excluded.check_out_time,
      metapolicy_struct     = excluded.metapolicy_struct,
      metapolicy_extra_info = excluded.metapolicy_extra_info,
      kind                  = excluded.kind,
      updated_at            = excluded.updated_at
  `)

  const now = Math.floor(Date.now() / 1000)

  const insertMany = db.transaction((hotels: any[]) => {
    let count = 0
    for (const raw of hotels) {
      const r = rawApiToRecord(raw)
      if (!r) continue
      stmt.run({
        id: r.id,
        hid: r.hid ?? null,
        name: r.name ?? null,
        address: r.address ?? null,
        city_name: r.city_name ?? null,
        region_name: r.region_name ?? null,
        country_name: r.country_name ?? null,
        star_rating: r.star_rating ?? 0,
        first_image: r.first_image ?? null,
        images: r.images ? JSON.stringify(r.images) : null,
        room_groups: r.room_groups !== undefined ? JSON.stringify(r.room_groups) : null,
        amenity_groups: r.amenity_groups ? JSON.stringify(r.amenity_groups) : null,
        amenities: r.amenities ? JSON.stringify(r.amenities) : null,
        facts: r.facts ? JSON.stringify(r.facts) : null,
        location: r.location ? JSON.stringify(r.location) : null,
        description: r.description ?? null,
        check_in_time: r.check_in_time ?? null,
        check_out_time: r.check_out_time ?? null,
        metapolicy_struct: r.metapolicy_struct ? JSON.stringify(r.metapolicy_struct) : null,
        metapolicy_extra_info: r.metapolicy_extra_info ?? null,
        kind: r.kind ?? null,
        updated_at: now,
      })
      count++
    }
    return count
  })

  return insertMany(rawHotels)
}

export function logSyncStart(type: 'full' | 'incremental'): number {
  const db = getDb()
  const res = db.prepare(
    'INSERT INTO sync_log (type, started_at) VALUES (?, ?)'
  ).run(type, Math.floor(Date.now() / 1000)) as any
  return res.lastInsertRowid as number
}

export function logSyncEnd(logId: number, inserted: number, error?: string): void {
  getDb().prepare(
    'UPDATE sync_log SET ended_at = ?, inserted = ?, error = ? WHERE id = ?'
  ).run(Math.floor(Date.now() / 1000), inserted, error ?? null, logId)
}

export function getLastSync(): { type: string; ended_at: number; inserted: number } | null {
  try {
    return getDb().prepare(
      'SELECT type, ended_at, inserted FROM sync_log WHERE ended_at IS NOT NULL ORDER BY ended_at DESC LIMIT 1'
    ).get() as any
  } catch {
    return null
  }
}
