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

type FullListing = {
  id: string
  title: string
  price: number
  location: string
  category: string
  categorySlug?: string
  status: string
  mainImage: string
  images?: { url: string; altText?: string }[]
  views: number
  createdAt: string
  enableFortGjort?: boolean
  listingType?: string
  userId?: string
}

export default function RecentlyViewedStrip() {
  const [items, setItems] = useState<ViewedItem[]>([])
  const [fullListings, setFullListings] = useState<FullListing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRecentlyViewed() {
      try {
        const raw = localStorage.getItem('kulbruk:recentlyViewed')
        const list = raw ? (JSON.parse(raw) as ViewedItem[]) : []
        const viewedItems = Array.isArray(list) ? list.slice(0, 12) : []
        setItems(viewedItems)

        if (viewedItems.length > 0) {
          // Fetch full listing data from API for Fort gjort support
          const ids = viewedItems.map(item => item.id).join(',')
          const response = await fetch(`/api/annonser/list?ids=${ids}&limit=50`)
          if (response.ok) {
            const data = await response.json()
            setFullListings(data.listings || [])
          }
        }
      } catch {
        setItems([])
        setFullListings([])
      } finally {
        setLoading(false)
      }
    }
    
    loadRecentlyViewed()
  }, [])

  if (loading) return null
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
          {items.map((it) => {
            // Find full listing data for this item
            const fullListing = fullListings.find(fl => fl.id === it.id)
            
            return (
              <a key={it.id} href={it.url || `/annonser/detaljer/${it.id}`}>
                <ListingCard
                  id={it.id}
                  title={fullListing?.title || it.title}
                  price={fullListing?.price || it.price || 0}
                  location={fullListing?.location || it.location || ''}
                  category={fullListing?.categorySlug || fullListing?.category || ''}
                  status={(fullListing?.status as any) || 'APPROVED'}
                  mainImage={fullListing?.mainImage || it.mainImage || ''}
                  images={fullListing?.images}
                  views={fullListing?.views || 0}
                  createdAt={fullListing?.createdAt ? new Date(fullListing.createdAt) : (it.createdAt ? new Date(it.createdAt) : new Date())}
                  enableFortGjort={fullListing?.enableFortGjort}
                  listingType={fullListing?.listingType}
                  userId={fullListing?.userId}
                />
              </a>
            )
          })}
        </ListingGrid>
      </div>
    </section>
  )
}


