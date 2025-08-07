import { Suspense } from 'react'
import Link from 'next/link'
import { Search, Filter, SlidersHorizontal, Car, Home, ShoppingBag } from 'lucide-react'
import { MAIN_CATEGORIES } from '@/lib/category-mapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import ListingCard, { ListingGrid, ListingCardSkeleton } from '@/components/listing-card'
import LiveListings from '@/components/live-listings'

// Mock data - senere hentes fra database
const getMockListings = () => [
  {
    id: '1',
    title: 'BMW X5 3.0d xDrive 2018',
    price: 450000,
    location: 'Oslo',
    category: 'Biler',
    status: 'APPROVED' as const,
    mainImage: '/api/placeholder/400/300?text=BMW+X5',
    views: 234,
    createdAt: new Date('2024-01-15'),
    isFeatured: true
  },
  {
    id: '2',
    title: 'Leilighet med fantastisk utsikt',
    price: 4500000,
    location: 'Bergen',
    category: 'Eiendom',
    status: 'APPROVED' as const,
    mainImage: '/api/placeholder/400/300?text=Leilighet',
    views: 156,
    createdAt: new Date('2024-01-12'),
  },
  {
    id: '3',
    title: 'Vintage sofa i skinn',
    price: 15000,
    location: 'Trondheim',
    category: 'Møbler',
    status: 'APPROVED' as const,
    mainImage: '/api/placeholder/400/300?text=Sofa',
    views: 89,
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '4',
    title: 'iPhone 15 Pro Max',
    price: 12000,
    location: 'Stavanger',
    category: 'Elektronikk',
    status: 'APPROVED' as const,
    mainImage: '/api/placeholder/400/300?text=iPhone',
    views: 67,
    createdAt: new Date('2024-01-08'),
  },
  {
    id: '5',
    title: 'Audi A4 Avant 2020',
    price: 320000,
    location: 'Kristiansand',
    category: 'Biler',
    status: 'APPROVED' as const,
    mainImage: '/api/placeholder/400/300?text=Audi+A4',
    views: 145,
    createdAt: new Date('2024-01-05'),
  },
  {
    id: '6',
    title: 'Enebolig med hage',
    price: 6200000,
    location: 'Drammen',
    category: 'Eiendom',
    status: 'APPROVED' as const,
    mainImage: '/api/placeholder/400/300?text=Enebolig',
    views: 203,
    createdAt: new Date('2024-01-03'),
  }
]

const categories = [
  {
    name: MAIN_CATEGORIES.bil.name,
    slug: MAIN_CATEGORIES.bil.slug,
    icon: Car,
    description: MAIN_CATEGORIES.bil.description,
    color: 'bg-blue-500',
    count: 0 // Vil bli oppdatert fra API
  },
  {
    name: MAIN_CATEGORIES.eiendom.name,
    slug: MAIN_CATEGORIES.eiendom.slug,
    icon: Home,
    description: MAIN_CATEGORIES.eiendom.description,
    color: 'bg-green-500',
    count: 0 // Vil bli oppdatert fra API
  },
  {
    name: MAIN_CATEGORIES.torget.name,
    slug: MAIN_CATEGORIES.torget.slug,
    icon: ShoppingBag,
    description: MAIN_CATEGORIES.torget.description,
    color: 'bg-purple-500',
    count: 0 // Vil bli oppdatert fra API
  }
]

export default function AnnonsePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Alle annonser</h1>
          <p className="text-xl text-gray-600">
            Finn det du leter etter blant våre annonser
          </p>
        </div>

        {/* Kategorier */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Velg kategori</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <Link key={category.slug} href={`/annonser/${category.slug}`}>
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${category.color} text-white group-hover:scale-110 transition-transform`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary">{category.count} annonser</Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-gray-600 text-sm">{category.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Søk og filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Søk etter annonser..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Sorter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live annonser fra database */}
        <Suspense fallback={
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
        }>
          <LiveListings />
        </Suspense>

        {/* Populære underkategorier */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Populære underkategorier</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Bil underkategorier */}
            {['Tesla', 'BMW', 'Audi', 'Elbiler'].map((cat) => (
              <Link key={cat} href={`/annonser/bil?search=${cat}`}>
                <div className="p-4 bg-white rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
                  <span className="text-sm font-medium text-gray-700">{cat}</span>
                </div>
              </Link>
            ))}
            {/* Eiendom underkategorier */}
            {['Leiligheter', 'Eneboliger', 'Hytter', 'Tomter'].map((cat) => (
              <Link key={cat} href={`/annonser/eiendom?search=${cat}`}>
                <div className="p-4 bg-white rounded-lg border hover:border-green-300 hover:bg-green-50 transition-colors text-center">
                  <span className="text-sm font-medium text-gray-700">{cat}</span>
                </div>
              </Link>
            ))}
            {/* Torget underkategorier */}
            {['Elektronikk', 'Møbler', 'Klær', 'Sport'].map((cat) => (
              <Link key={cat} href={`/annonser/torget?search=${cat}`}>
                <div className="p-4 bg-white rounded-lg border hover:border-purple-300 hover:bg-purple-50 transition-colors text-center">
                  <span className="text-sm font-medium text-gray-700">{cat}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Har du noe å selge?</h2>
            <p className="text-xl mb-6 opacity-90">
              Legg ut din annonse på Kulbruk.no og nå tusenvis av potensielle kjøpere
            </p>
            <Link href="/opprett">
              <Button size="lg" variant="secondary" className="text-blue-600">
                Legg ut annonse gratis
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}