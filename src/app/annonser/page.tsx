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
  // Midlertidig: redirect til forside der søket er forbedret
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Søk etter annonser</h1>
        <p className="text-gray-600 mb-4">Bruk søket på forsiden for en bedre opplevelse med filtrering og anbefalinger.</p>
        <Link href="/">
          <Button>Gå til forsiden</Button>
        </Link>
      </div>
    </div>
  )
}