'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Car, Home, ShoppingBag, RefreshCw, Search } from 'lucide-react'
import Link from 'next/link'
import ListingCard, { ListingGrid, ListingCardSkeleton } from '@/components/listing-card'

interface Listing {
  id: string
  title: string
  description?: string
  price: number | null
  location: string
  category: string
  status: string
  mainImage: string
  views: number
  createdAt: string | Date
  isFeatured?: boolean
  listingType?: string
  make?: string
  model?: string
  year?: number
  mileage?: number
  seller: {
    name: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  count: number
  isActive: boolean
}

interface ListingsResponse {
  listings: Listing[]
  totalCount: number
  categories: Category[]
  pagination: {
    limit: number
    offset: number
    hasMore: boolean
    totalPages: number
    currentPage: number
  }
  filters: {
    category: string | null
    search: string | null
  }
  error?: string
}

const categoryIcons = {
  'bil': Car,
  'biler': Car,
  'eiendom': Home,
  'elektronikk': ShoppingBag,
  'møbler': ShoppingBag,
  'klær': ShoppingBag,
  'sport': ShoppingBag,
  'default': ShoppingBag
}

const categoryColors = {
  'bil': 'bg-blue-500',
  'biler': 'bg-blue-500',
  'eiendom': 'bg-green-500',
  'elektronikk': 'bg-purple-500',
  'møbler': 'bg-amber-500',
  'klær': 'bg-pink-500',
  'sport': 'bg-orange-500',
  'default': 'bg-gray-500'
}

export default function LiveListings() {
  const [data, setData] = useState<ListingsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchListings = async () => {
    if (!isLoading) setIsRefreshing(true)
    
    try {
      const response = await fetch('/api/annonser/list')
      if (response.ok) {
        const listingsData = await response.json()
        setData(listingsData)
      }
    } catch (error) {
      console.error('Feil ved henting av annonser:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchListings()
    // Auto-refresh hvert 2 minutt
    const interval = setInterval(fetchListings, 120000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Laster annonser...</h2>
        </div>
        <ListingGrid>
          {Array.from({ length: 6 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </ListingGrid>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mb-12 text-center py-12">
        <p className="text-gray-600 mb-4">Kunne ikke laste annonser</p>
        <Button onClick={fetchListings} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Prøv igjen
        </Button>
      </div>
    )
  }

  const getIconForCategory = (categoryName: string) => {
    const key = categoryName.toLowerCase() as keyof typeof categoryIcons
    return categoryIcons[key] || categoryIcons.default
  }

  const getColorForCategory = (categoryName: string) => {
    const key = categoryName.toLowerCase() as keyof typeof categoryColors
    return categoryColors[key] || categoryColors.default
  }

  return (
    <>
      {/* Live status og kategorier */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-gray-900">Kategorier</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Live data</span>
              {data.error && (
                <Badge variant="outline" className="text-amber-700 border-amber-300">
                  Fallback mode
                </Badge>
              )}
            </div>
          </div>
          <Button
            onClick={fetchListings}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Kategorier grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {data.categories.filter(cat => cat.isActive).map((category) => {
            const IconComponent = getIconForCategory(category.name)
            const colorClass = getColorForCategory(category.name)
            
            return (
              <Link key={category.slug} href={`/annonser/${category.slug}`}>
                <div className="hover:shadow-lg transition-all duration-200 cursor-pointer group bg-white rounded-lg border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${colorClass} text-white group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary">{category.count} annonser</Badge>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                  {category.description && (
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Nyeste annonser */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {data.listings.length > 0 ? 'Nyeste annonser' : 'Ingen annonser funnet'}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {data.totalCount} totalt
            </span>
            {data.listings.length > 0 && (
              <Link href="/annonser/alle">
                <Button variant="outline">Se alle annonser</Button>
              </Link>
            )}
          </div>
        </div>

        {data.listings.length > 0 ? (
          <ListingGrid>
            {data.listings.map((listing) => (
              <ListingCard 
                key={listing.id} 
                {...listing}
                createdAt={new Date(listing.createdAt)}
              />
            ))}
          </ListingGrid>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ingen annonser å vise
            </h3>
            <p className="text-gray-600 mb-6">
              Det ser ut til at databasen er tom. Prøv å legge til noen testannonser.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/opprett">
                <Button>
                  Legg ut første annonse
                </Button>
              </Link>
              <Link href="/dashboard/admin/database">
                <Button variant="outline">
                  Admin: Seed database
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Database info */}
      {data.error && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 text-sm">
            <strong>Merknad:</strong> {data.error}
          </p>
        </div>
      )}
    </>
  )
}
