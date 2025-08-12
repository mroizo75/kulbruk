'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  RefreshCw, 
  ArrowLeft,
  Car,
  Home,
  ShoppingBag
} from 'lucide-react'
import Link from 'next/link'
import ListingCard, { ListingGrid, ListingCardSkeleton } from '@/components/listing-card'
import AdvancedFilters from '@/components/advanced-filters'
import CarSearch from '@/components/car-search'
import { sorteringsAlternativer } from '@/lib/norway-data'

interface Listing {
  id: string
  title: string
  description?: string
  price: number | null
  location: string
  category: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SOLD' | 'EXPIRED' | 'SUSPENDED'
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

interface CategoryListingsProps {
  category: 'bil' | 'eiendom' | 'torget'
}

const categoryConfig = {
  bil: {
    title: 'Biler',
    icon: Car,
    color: 'bg-blue-500',
    tips: {
      title: '🚗 Tips for bilkjøp',
      items: [
        'Sjekk alltid EU-kontroll og service-historikk',
        'Be om prøvekjøring og få bilen sjekket av fagmann',
        'Verifiser kilometerstand og skader',
        'Kontroller at alle papirer er i orden',
        'Bruk NAFs bruktbilrapport for trygghet'
      ]
    },
    guide: {
      title: '💰 Prisguide',
      items: [
        'Sammenlign priser på Finn.no og Motor.no',
        'Sjekk takstverdi hos NAF eller Autovalg',
        'Husk at forhandlere kan ha høyere priser',
        'Vurder ekstra kostnader som omregistrering',
        'Elektriske biler kan ha lavere driftskostnader'
      ]
    },
    ctaText: 'Legg ut bil til salgs',
    searchPlaceholder: 'Søk etter bilmerke, modell eller registreringsnummer...'
  },
  eiendom: {
    title: 'Eiendom',
    icon: Home,
    color: 'bg-green-500',
    tips: {
      title: '🏠 Tips for eiendomskjøp',
      items: [
        'Få takst av kvalifisert takstmann',
        'Sjekk byggemeldinger og teknisk tilstand',
        'Vurder beliggenhet og fremtidig utvikling',
        'Kontroller kommunale avgifter og felleskostnader',
        'Få juridisk bistand til kjøpeprosessen'
      ]
    },
    guide: {
      title: '💡 Kjøpsguide',
      items: [
        'Sammenlign priser i området på Finn.no',
        'Sjekk solgte boliger på Eiendomsverdi.no',
        'Vurder lånemuligheter hos banken',
        'Husk ekstra kostnader som tinglysing',
        'Vurdér energimerkingen og oppvarmingskostnader'
      ]
    },
    ctaText: 'Legg ut eiendom til salgs',
    searchPlaceholder: 'Søk etter leilighet, hus eller sted...'
  },
  torget: {
    title: 'Torget',
    icon: ShoppingBag,
    color: 'bg-purple-500',
    tips: {
      title: '🛒 Tips for handel',
      items: [
        'Møt selger på trygg, offentlig plass',
        'Sjekk varen nøye før kjøp',
        'Be om kvittering eller garanti hvis relevant',
        'Bruk sikre betalingsmetoder',
        'Rapporter mistenkelig aktivitet'
      ]
    },
    guide: {
      title: '💫 Handelsguide',
      items: [
        'Sammenlign priser på Prisjakt og andre nettsider',
        'Sjekk selgers anmeldelser og historie',
        'Forhandl pris, men vær respektfull',
        'Vurder transportkostnader for store gjenstander',
        'Les annonsen nøye og still spørsmål'
      ]
    },
    ctaText: 'Legg ut på torget',
    searchPlaceholder: 'Søk etter møbler, elektronikk, klær...'
  }
}

export default function CategoryListings({ category }: CategoryListingsProps) {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [filters, setFilters] = useState({})
  const [sortBy, setSortBy] = useState('nyeste')

  const config = categoryConfig[category]

  const fetchListings = async () => {
    if (!isLoading) setIsRefreshing(true)
    
    try {
      const params = new URLSearchParams({
        category: category,
        limit: '20',
        sort: sortBy
      })
      
      // Legg til alle aktive filtre
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value as string)
        }
      })

      const response = await fetch(`/api/annonser/list?${params}`)
      if (response.ok) {
        const data = await response.json()
        setListings(data.listings)
        setTotalCount(data.totalCount)
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
  }, [category, filters, sortBy])

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handleSearch = () => {
    fetchListings()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/annonser" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tilbake til alle annonser
            </Link>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-lg ${config.color} text-white`}>
                <config.icon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{config.title}</h1>
                <p className="text-xl text-gray-600">Laster...</p>
              </div>
            </div>
          </div>

          <ListingGrid>
            {Array.from({ length: 6 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </ListingGrid>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/annonser" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake til alle annonser
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${config.color} text-white`}>
                <config.icon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{config.title}</h1>
                <p className="text-xl text-gray-600">
                  {totalCount} {totalCount === 1 ? 'annonse' : 'annonser'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Live data</span>
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
          </div>
        </div>

        {/* Søk og filtre */}
        {category === 'bil' ? (
          <CarSearch
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
          />
        ) : (
          <AdvancedFilters
            category={category}
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
          />
        )}

        {/* Sortering og resultater */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-600">
              Viser {listings.length} av {totalCount} annonser
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sorteringsAlternativer[category].map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Annonser */}
        {listings.length > 0 ? (
              <ListingGrid>
            {listings.map((listing) => {
              const callbackUrl = typeof window !== 'undefined' ? window.location.href : ''
              // Wrap ListingCard with a link including callbackUrl
              return (
                <a key={listing.id} href={`/annonser/detaljer/${listing.id}?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
                  <ListingCard 
                    id={listing.id}
                    title={listing.title}
                    price={listing.price || 0}
                    location={listing.location}
                    category={listing.category}
                    status={listing.status}
                    mainImage={listing.mainImage}
                    images={undefined}
                    views={listing.views}
                    createdAt={new Date(listing.createdAt)}
                  />
                </a>
              )
            })}
          </ListingGrid>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border">
            <config.icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ingen {config.title.toLowerCase()} funnet
            </h3>
            <p className="text-gray-600 mb-6">
              {Object.keys(filters).length > 0 ? 
                `Ingen resultater for de valgte filtrene. Prøv å justere søket ditt.` :
                `Det er for øyeblikket ingen ${config.title.toLowerCase()} i databasen.`
              }
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/opprett">
                <Button>
                  {config.ctaText}
                </Button>
              </Link>
              {Object.keys(filters).length === 0 && (
                <Link href="/dashboard/admin/database">
                  <Button variant="outline">
                    Admin: Seed database
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Tips og guide */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{config.tips.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              {config.tips.items.map((tip, index) => (
                <p key={index}>• {tip}</p>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{config.guide.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              {config.guide.items.map((item, index) => (
                <p key={index}>• {item}</p>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Call to action */}
        <Card className={`mt-8 bg-gradient-to-r ${config.color.replace('bg-', 'from-')}-500 ${config.color.replace('bg-', 'to-')}-600 text-white`}>
          <CardContent className="p-8 text-center">
            <config.icon className="h-12 w-12 mx-auto mb-4 opacity-80 text-[#af4c0f]" />
            <h2 className="text-2xl font-bold mb-4 text-[#af4c0f]">Har du noe å selge?</h2>
            <p className="text-lg mb-6 opacity-90 text-[#af4c0f]">
              Legg ut din annonse på Kulbruk.no og nå tusenvis av potensielle kjøpere
            </p>
            <Link href="/opprett">
              <Button 
                size="lg" 
                variant="secondary" 
                className="bg-[#af4c0f] text-white hover:bg-gray-100 hover:scale-105 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                {config.ctaText}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
