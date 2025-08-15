'use client'

import { useEffect, useState } from 'react'
import ListingCard, { ListingGrid } from '@/components/listing-card'
import { Button } from '@/components/ui/button'

type ViewedItem = {
  id: string
  title: string
  mainImage?: string | null
  price?: number | null
  location?: string | null
  createdAt?: string | null
  viewedAt?: string | null
  url?: string
}

export default function RecentlyViewedStrip() {
  const [items, setItems] = useState<ViewedItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('kulbruk:recentlyViewed')
      const list = raw ? (JSON.parse(raw) as ViewedItem[]) : []
      setItems(Array.isArray(list) ? list.slice(0, 12) : [])
    } catch {
      setItems([])
    }
  }, [])

  if (!items || items.length === 0) return null

  return (
    <section className="py-6 sm:py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Du så nylig</h2>
          <Button
            variant="outline"
            className="text-xs"
            onClick={() => {
              try {
                localStorage.removeItem('kulbruk:recentlyViewed')
                setItems([])
              } catch {}
            }}
          >
            Tøm
          </Button>
        </div>
        <ListingGrid>
          {items.map((it) => (
            <a key={it.id} href={it.url || `/annonser/detaljer/${it.id}`}>
              <ListingCard
                id={it.id}
                title={it.title}
                price={it.price || 0}
                location={it.location || ''}
                category={''}
                status={'APPROVED' as any}
                mainImage={it.mainImage || ''}
                images={undefined}
                views={0}
                createdAt={it.createdAt ? new Date(it.createdAt) : new Date()}
              />
            </a>
          ))}
        </ListingGrid>
      </div>
    </section>
  )
}


