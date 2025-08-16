'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import ListingCard, { ListingGrid, ListingCardSkeleton } from '@/components/listing-card'
import { Button } from '@/components/ui/button'

type ApiListing = {
  id: string
  title: string
  price: number | null
  location: string
  category: string
  status: string
  mainImage: string
  images?: { url: string; altText?: string }[]
  views: number
  createdAt: string
  enableFortGjort?: boolean
  listingType?: string
  userId?: string
}

function buildParamsFromLastSearch(): URLSearchParams | null {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('kulbruk:lastSearch') : null
    if (!raw) return null
    const arr = JSON.parse(raw) as any[]
    if (!Array.isArray(arr) || arr.length === 0) return null
    const last = arr[0]
    const params = new URLSearchParams()
    if (last.category) params.set('category', last.category)
    if (last.sortBy) params.set('sort', last.sortBy)
    if (last.filters && typeof last.filters === 'object') {
      Object.entries(last.filters).forEach(([k, v]) => {
        if (v) params.set(String(k), String(v))
      })
    }
    return params
  } catch {
    return null
  }
}

export default function RecommendedListings() {
  const [listings, setListings] = useState<ApiListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const totalLoaded = listings.length
  const maxTotal = 50
  const pageSize = 10
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const paramsFromSearch = useMemo(buildParamsFromLastSearch, [])

  async function fetchPage(initial = false) {
    if (initial) setIsLoading(true)
    else setIsLoadingMore(true)
    try {
      const params = new URLSearchParams(paramsFromSearch || undefined)
      params.set('limit', String(pageSize))
      params.set('offset', String(offset))
      const res = await fetch(`/api/annonser/list?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      let newItems: ApiListing[] = data.listings || []
      // Dersom ingen preferanser er satt, bland rekkefølgen litt for å simulere "random"
      if (!paramsFromSearch && newItems.length > 1) {
        newItems = [...newItems].sort(() => Math.random() - 0.5)
      }
      const combined = initial ? newItems : [...listings, ...newItems]
      const trimmed = combined.slice(0, maxTotal)
      setListings(trimmed)
      const serverHasMore = data.pagination?.hasMore === true
      const notExceeded = trimmed.length < maxTotal
      setHasMore(serverHasMore && notExceeded)
      setOffset(offset + pageSize)
    } catch (e) {
      // Silent fail
      setHasMore(false)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchPage(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore) return
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0]
      if (first.isIntersecting && !isLoadingMore) {
        fetchPage(false)
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoadingMore, sentinelRef.current])

  if (isLoading) {
    return (
      <ListingGrid>
        {Array.from({ length: 8 }).map((_, i) => (<ListingCardSkeleton key={i} />))}
      </ListingGrid>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Ingen anbefalinger enda. Utforsk kategoriene for å komme i gang.</p>
        <Button className="mt-3" asChild>
          <a href="/annonser">Se annonser</a>
        </Button>
      </div>
    )
  }

  return (
    <>
      <ListingGrid>
        {listings.slice(0, Math.min(listings.length, maxTotal)).map((l) => (
          <ListingCard
            key={l.id}
            id={l.id}
            title={l.title}
            price={l.price || 0}
            location={l.location}
            category={l.category}
            status={l.status as any}
            mainImage={l.mainImage}
            images={l.images}
            views={l.views}
            createdAt={new Date(l.createdAt)}
            enableFortGjort={l.enableFortGjort}
            listingType={l.listingType}
            userId={l.userId}
          />
        ))}
      </ListingGrid>
      {hasMore && totalLoaded < maxTotal && (
        <div ref={sentinelRef} className="py-6 text-center text-sm text-gray-500">Laster flere…</div>
      )}
    </>
  )
}


