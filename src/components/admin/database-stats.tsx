'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Loader2, TrendingUp, Eye, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface HomepageStats {
  totalUsers: string
  dailyVolume: string
  customerSatisfaction: string
  aiPrecision: string
  activeListings: string
  todayListings: number
  totalListings: string
  categories: {
    bil: { active: string; soldToday: number }
    eiendom: { active: string; soldToday: number }
    torget: { active: string; soldToday: number }
  }
  featuredListings: Array<{
    title: string
    price: string
    category: string
    location: string
    image: string
    badge: string
  }>
  lastUpdated: string
  isLive: boolean
}

export default function DatabaseStats() {
  const [stats, setStats] = useState<HomepageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchStats = async () => {
    if (!isLoading) setIsRefreshing(true)
    
    try {
      const response = await fetch('/api/stats/homepage')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Feil ved henting av homepage stats:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // Auto-refresh hvert 30 sekund
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Henter live statistikk...</span>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Kunne ikke hente statistikk</p>
        <Button onClick={fetchStats} variant="outline" className="mt-4">
          Prøv igjen
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status and Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${stats.isLive ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <Badge className={stats.isLive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {stats.isLive ? 'Live Data' : 'Fallback Data'}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchStats}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
            <p className="text-sm text-gray-600">Brukere</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.dailyVolume}</p>
            <p className="text-sm text-gray-600">Daglig volum</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.customerSatisfaction}</p>
            <p className="text-sm text-gray-600">Tilfredshet</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.aiPrecision}</p>
            <p className="text-sm text-gray-600">AI-presisjon</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Kategori-statistikk
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">🚗 Biler:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{stats.categories.bil.active} aktive</span>
              <Badge variant="outline" className="text-xs">
                {stats.categories.bil.soldToday} i dag
              </Badge>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">🏠 Eiendom:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{stats.categories.eiendom.active} aktive</span>
              <Badge variant="outline" className="text-xs">
                {stats.categories.eiendom.soldToday} i dag
              </Badge>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">🛒 Torget:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{stats.categories.torget.active} aktive</span>
              <Badge variant="outline" className="text-xs">
                {stats.categories.torget.soldToday} i dag
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Listings Preview */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Populære annonser (fra database)
        </h4>
        <div className="space-y-2">
          {stats.featuredListings.map((listing, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                <span className="text-xl">{listing.image}</span>
                <div>
                  <p className="font-medium text-sm text-gray-900">{listing.title}</p>
                  <p className="text-xs text-gray-600">{listing.category} • {listing.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-[#af4c0f]">{listing.price}</p>
                <Badge variant="outline" className="text-xs">
                  {listing.badge}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-xs text-gray-500">
        Sist oppdatert: {new Date(stats.lastUpdated).toLocaleString('no-NO')}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/">
            <ExternalLink className="h-4 w-4 mr-2" />
            Se homepage
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/annonser">
            <Eye className="h-4 w-4 mr-2" />
            Se annonser
          </Link>
        </Button>
      </div>
    </div>
  )
}
