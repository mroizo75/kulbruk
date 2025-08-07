'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Car, Home, ShoppingCart, TrendingUp, Eye, Clock, ArrowRight, Plane } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const categories = [
  {
    id: 'reiser',
    title: 'Flyreiser',
    icon: Plane,
    description: 'Søk og sammenlign flypriser fra SAS, Norwegian og andre',
    href: '/reiser',
    color: 'from-sky-500 to-sky-600',
    bgColor: 'bg-sky-50',
    iconColor: 'text-sky-600',
    stats: {
      active: 'Live priser',
      sold: 'Fra 499 kr'
    },
    features: ['Profesjonelle reise-API-er', 'Norske flyselskaper', 'NOK priser'],
    trending: true,
    isNew: true,
    image: '/api/placeholder/400/300'
  },
  {
    id: 'bil',
    title: 'Biler',
    icon: Car,
    description: 'Kjøp og selg biler med AI-powered prisestimering',
    href: '/annonser/bil',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    stats: {
      active: '2,847',
      sold: '156 i dag'
    },
    features: ['AI-prisestimering', 'Live auksjoner', 'Vegvesen-data'],
    trending: true,
    image: '/api/placeholder/400/300'
  },
  {
    id: 'eiendom',
    title: 'Eiendom',
    icon: Home,
    description: 'Leiligheter, hus og næringseiendommer',
    href: '/annonser/eiendom',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    stats: {
      active: '1,234',
      sold: '23 i dag'
    },
    features: ['Boligkalkulator', 'Områdeanalyse', 'Visningsbestilling'],
    trending: false,
    image: '/api/placeholder/400/300'
  },
  {
    id: 'torget',
    title: 'Torget',
    icon: ShoppingCart,
    description: 'Alt annet - møbler, elektronikk, klær og mer',
    href: '/annonser/torget',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    stats: {
      active: '8,543',
      sold: '342 i dag'
    },
    features: ['Rask salg', 'Lokale oppgjør', 'Trygg handel'],
    trending: false,
    image: '/api/placeholder/400/300'
  }
]

export default function CategoriesSection() {
  const [liveStats, setLiveStats] = useState({
    categories: {
      bil: { active: '2,847', soldToday: 156 },
      eiendom: { active: '1,234', soldToday: 23 },
      torget: { active: '8,543', soldToday: 342 }
    },
    featuredListings: [
      {
        title: '2020 BMW X5 xDrive40i',
        price: '465,000 kr',
        category: 'Bil',
        location: 'Oslo',
        image: '🚗',
        badge: 'AI-estimering'
      },
      {
        title: '3-roms leilighet, Majorstuen',
        price: '4,2M kr',
        category: 'Eiendom',
        location: 'Oslo',
        image: '🏠',
        badge: 'Visning i dag'
      },
      {
        title: 'iPhone 14 Pro Max - Ny',
        price: '12,999 kr',
        category: 'Elektronikk',
        location: 'Bergen',
        image: '📱',
        badge: 'Rask salg'
      }
    ],
    totalListings: '12,624'
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const response = await fetch('/api/stats/homepage')
        if (response.ok) {
          const data = await response.json()
          setLiveStats({
            categories: data.categories,
            featuredListings: data.featuredListings,
            totalListings: data.totalListings
          })
        }
      } catch (error) {
        console.error('Feil ved henting av kategori stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLiveStats()
    // Oppdater stats hver 60 sekund
    const interval = setInterval(fetchLiveStats, 60000)
    return () => clearInterval(interval)
  }, [])

  // Oppdater kategorier med live data
  const updatedCategories = categories.map(category => {
    if (category.id === 'bil') {
      return {
        ...category,
        stats: {
          active: liveStats.categories.bil.active,
          sold: `${liveStats.categories.bil.soldToday} i dag`
        }
      }
    }
    if (category.id === 'eiendom') {
      return {
        ...category,
        stats: {
          active: liveStats.categories.eiendom.active,
          sold: `${liveStats.categories.eiendom.soldToday} i dag`
        }
      }
    }
    if (category.id === 'torget') {
      return {
        ...category,
        stats: {
          active: liveStats.categories.torget.active,
          sold: `${liveStats.categories.torget.soldToday} i dag`
        }
      }
    }
    return category
  })

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Utforsk våre
            <span className="text-[#af4c0f]"> kategorier</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Fra biler med AI-powered prisestimering til eiendom og hverdagsting - 
            finn det du leter etter i våre spesialiserte kategorier.
          </p>
        </div>

                 {/* Categories Grid */}
         <div className="grid md:grid-cols-3 gap-8 mb-16">
           {updatedCategories.map((category) => (
            <Card key={category.id} className="group hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden bg-white">
              <CardContent className="p-0">
                
                {/* Category Header */}
                <div className={`${category.bgColor} p-6 relative overflow-hidden`}>
                  {category.isNew && (
                    <Badge className="absolute top-4 right-4 bg-green-600 hover:bg-green-700">
                      ✨ NYT
                    </Badge>
                  )}
                  {category.trending && !category.isNew && (
                    <Badge className="absolute top-4 right-4 bg-[#af4c0f] hover:bg-[#af4c0f]/90">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Populær
                    </Badge>
                  )}
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                      <category.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{category.title}</h3>
                      <p className="text-gray-600">{category.description}</p>
                    </div>
                  </div>

                  {/* Live Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Aktive</span>
                      </div>
                                             <p className={`text-lg font-bold text-gray-900 ${isLoading ? 'animate-pulse' : ''}`}>{category.stats.active}</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600">Solgt</span>
                      </div>
                                             <p className={`text-lg font-bold text-green-600 ${isLoading ? 'animate-pulse' : ''}`}>{category.stats.sold}</p>
                    </div>
                  </div>
                </div>

                {/* Category Content */}
                <div className="p-6">
                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Funksjoner:</h4>
                    <div className="flex flex-wrap gap-2">
                      {category.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button asChild className="w-full bg-[#af4c0f] hover:bg-[#af4c0f]/90">
                      <Link href={category.href}>
                        <Eye className="h-4 w-4 mr-2" />
                        Se alle {category.title.toLowerCase()}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/opprett">
                        Legg ut annonse
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Listings Preview */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Populære annonser nå</h3>
              <p className="text-gray-600">Se hva som selger best på Kulbruk.no</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/annonser">
                Se alle
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

                     {/* Quick Listings Grid - Live Data */}
           <div className="grid md:grid-cols-3 gap-6">
             {liveStats.featuredListings.map((listing, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{listing.image}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm leading-tight">{listing.title}</h4>
                        <Badge variant="outline" className="text-xs shrink-0 ml-2">
                          {listing.badge}
                        </Badge>
                      </div>
                      <p className="text-lg font-bold text-[#af4c0f] mb-1">{listing.price}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{listing.category}</span>
                        <span>{listing.location}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

                 {/* Bottom CTA - Live Data */}
         <div className="text-center mt-12">
           <Button asChild size="lg" className="bg-[#af4c0f] hover:bg-[#af4c0f]/90">
             <Link href="/annonser">
               <Eye className="h-5 w-5 mr-2" />
               Utforsk alle {liveStats.totalListings} annonser
               <ArrowRight className="h-5 w-5 ml-2" />
             </Link>
           </Button>
         </div>
      </div>
    </section>
  )
}
