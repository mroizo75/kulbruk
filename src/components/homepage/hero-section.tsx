'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Car, Home, ShoppingBag, Plus, TrendingUp, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

// Hovedkategorier (inspirert av Finn.no)
const mainCategories = [
  {
    id: 'torget',
    title: 'Torget',
    icon: ShoppingBag,
    href: '/annonser/torget',
    count: '8,543',
    description: 'Møbler, elektronikk og mer',
    subcategories: ['Møbler', 'Elektronikk', 'Klær', 'Sport']
  },
  {
    id: 'bil',
    title: 'Bil og transport',
    icon: Car,
    href: '/annonser/bil',
    count: '2,847',
    description: 'Biler, motorsykler og båter',
    subcategories: ['Personbiler', 'Varebiler', 'MC', 'Båter']
  },
  {
    id: 'eiendom',
    title: 'Eiendom',
    icon: Home,
    href: '/annonser/eiendom',
    count: '1,234',
    description: 'Boliger til salgs og leie',
    subcategories: ['Boliger til salgs', 'Boliger til leie', 'Hytter', 'Tomter']
  }
]

// Mock anbefalte annonser (normalt ville kommet fra API)
const recommendedListings = [
  {
    id: '1',
    title: 'Tesla Model 3 Long Range',
    price: '385,000',
    location: 'Oslo',
    image: '/placeholder-car.jpg',
    category: 'Bil',
    timeAgo: '2 timer siden'
  },
  {
    id: '2',
    title: '3-roms leilighet med balkong',
    price: '3,200,000',
    location: 'Bergen',
    image: '/placeholder-apartment.jpg',
    category: 'Eiendom',
    timeAgo: '4 timer siden'
  },
  {
    id: '3',
    title: 'Sofa 3-seter i god stand',
    price: '4,500',
    location: 'Trondheim',
    image: '/placeholder-sofa.jpg',
    category: 'Møbler',
    timeAgo: '1 dag siden'
  },
  {
    id: '4',
    title: 'iPhone 15 Pro - som ny',
    price: '12,500',
    location: 'Stavanger',
    image: '/placeholder-phone.jpg',
    category: 'Elektronikk',
    timeAgo: '3 timer siden'
  }
]

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [liveStats, setLiveStats] = useState({
    activeListings: '12,624',
    newToday: '486',
    popularSearches: ['Tesla', 'iPhone', 'Leilighet Oslo', 'IKEA sofa']
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/annonser?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <div className="bg-white">
      {/* Hero Section med søk og kategorier */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4 leading-tight">
              Finn det du leter etter på 
              <span className="text-[#af4c0f]"> Kulbruk.no</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Norges markedsplass for trygg kjøp og salg
            </p>
          </div>

          {/* Søkeboks */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Søk etter biler, leiligheter, møbler..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 sm:pl-12 h-12 sm:h-14 text-base sm:text-lg bg-white border-2 border-gray-200 focus:border-[#af4c0f] focus:ring-[#af4c0f] text-gray-900 placeholder:text-gray-500 rounded-lg"
              />
              <Button 
                type="submit"
                className="absolute right-2 top-2 h-8 sm:h-10 px-3 sm:px-6 bg-[#af4c0f] hover:bg-[#af4c0f]/90 text-white rounded-md text-sm sm:text-base"
              >
                Søk
              </Button>
            </div>
          </form>

          {/* Populære søk */}
          <div className="text-center mb-6 sm:mb-8 px-4">
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Populære søk:</p>
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
              {liveStats.popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(search)
                    window.location.href = `/annonser?search=${encodeURIComponent(search)}`
                  }}
                  className="text-xs sm:text-sm text-[#af4c0f] hover:text-[#af4c0f]/80 border border-[#af4c0f]/20 hover:border-[#af4c0f]/40 px-2 sm:px-3 py-1 rounded-full transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          {/* Legg ut annonse knapp */}
          <div className="text-center px-4">
            <Button asChild size="lg" className="bg-[#af4c0f] hover:bg-[#af4c0f]/90 text-white w-full sm:w-auto">
              <Link href="/opprett">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Legg ut annonse
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Kategori-oversikt */}
      <section className="py-6 sm:py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Kategorier</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {mainCategories.map((category) => {
              const IconComponent = category.icon
              return (
                <Link key={category.id} href={category.href}>
                  <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group h-full border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#af4c0f] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#af4c0f] transition-colors">
                              {category.title}
                            </h3>
                            <p className="text-sm text-gray-600">{category.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[#af4c0f] border-[#af4c0f]/20">
                          {category.count}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {category.subcategories.map((sub, index) => (
                          <span 
                            key={index}
                            className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Anbefalte annonser */}
      <section className="py-6 sm:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Anbefalte annonser</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Basert på dine tidligere søk og interesse</p>
            </div>
            <Button asChild variant="outline" className="border-[#af4c0f] text-[#af4c0f] hover:bg-[#af4c0f]/5 w-full sm:w-auto">
              <Link href="/annonser">
                Se alle annonser
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {recommendedListings.map((listing) => (
              <Link key={listing.id} href={`/annonser/detaljer/${listing.id}`}>
                <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden">
                  <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                    {/* Placeholder for bilde */}
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Ingen bilde</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <Badge variant="secondary" className="text-xs mb-2">
                        {listing.category}
                      </Badge>
                      <h3 className="font-medium text-gray-900 group-hover:text-[#af4c0f] transition-colors line-clamp-2">
                        {listing.title}
                      </h3>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-[#af4c0f]">
                        {listing.price} kr
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{listing.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{listing.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Statistikk */}
      <section className="py-6 sm:py-8 bg-[#af4c0f]/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div>
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-[#af4c0f] rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{liveStats.activeListings}</div>
              <div className="text-sm text-gray-600">Aktive annonser</div>
            </div>
            
            <div>
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-[#af4c0f] rounded-full flex items-center justify-center">
                  <Plus className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{liveStats.newToday}</div>
              <div className="text-sm text-gray-600">Nye i dag</div>
            </div>
            
            <div>
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-[#af4c0f] rounded-full flex items-center justify-center">
                  <Search className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">2.4M+</div>
              <div className="text-sm text-gray-600">Månedlige søk</div>
            </div>
            
            <div>
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-[#af4c0f] rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">95%</div>
              <div className="text-sm text-gray-600">Fornøyde brukere</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
