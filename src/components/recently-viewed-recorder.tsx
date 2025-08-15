'use client'

import { useEffect } from 'react'

type Props = {
  id: string
  title: string
  mainImage?: string | null
  price?: number | null
  location?: string | null
  createdAt?: string | Date | null
}

export default function RecentlyViewedRecorder({ id, title, mainImage, price, location, createdAt }: Props) {
  useEffect(() => {
    try {
      const key = 'kulbruk:recentlyViewed'
      const raw = localStorage.getItem(key)
      const list = raw ? (JSON.parse(raw) as any[]) : []
      const filtered = Array.isArray(list) ? list.filter((it) => it && it.id !== id) : []
      const item = {
        id,
        title,
        mainImage: mainImage || null,
        price: typeof price === 'number' ? price : price ? Number(price) : null,
        location: location || null,
        createdAt: createdAt ? (typeof createdAt === 'string' ? createdAt : new Date(createdAt).toISOString()) : null,
        viewedAt: new Date().toISOString(),
        url: `/annonser/detaljer/${id}`,
      }
      const next = [item, ...filtered]
      const trimmed = next.slice(0, 50)
      localStorage.setItem(key, JSON.stringify(trimmed))
    } catch {}
  }, [id, title, mainImage, price, location, createdAt])
  return null
}


