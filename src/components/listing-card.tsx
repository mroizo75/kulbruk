import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Calendar, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ListingCardProps {
  id: string
  title: string
  price: number
  location: string
  category: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SOLD' | 'EXPIRED' | 'SUSPENDED'
  mainImage?: string
  images?: Array<{ url: string; altText?: string }>
  views?: number
  createdAt: Date
  isFeatured?: boolean
}

const statusConfig = {
  PENDING: { label: 'Venter godkjenning', variant: 'secondary' as const },
  APPROVED: { label: 'Aktiv', variant: 'default' as const },
  REJECTED: { label: 'Avvist', variant: 'destructive' as const },
  SOLD: { label: 'Solgt', variant: 'outline' as const },
  EXPIRED: { label: 'Utløpt', variant: 'secondary' as const },
  SUSPENDED: { label: 'Suspendert', variant: 'destructive' as const },
}

export default function ListingCard({
  id,
  title,
  price,
  location,
  category,
  status,
  mainImage,
  images,
  views = 0,
  createdAt,
  isFeatured = false
}: ListingCardProps) {
  const statusInfo = statusConfig[status]
  const isClickable = status === 'APPROVED'
  
  const cardContent = (
    <Card className={`overflow-hidden transition-all duration-200 ${
      isClickable 
        ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' 
        : 'opacity-75'
    } ${isFeatured ? 'ring-2 ring-primary/20' : ''}`}>
      {/* Bilde */}
      <div className="relative aspect-video bg-gray-100">
        {(images && images.length > 0) ? (
          <Image
            src={images[0].url}
            alt={images[0].altText || title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : mainImage ? (
          <Image
            src={mainImage}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-sm">Ingen bilde</span>
          </div>
        )}
        
        {/* Bilde-indikator hvis flere bilder */}
        {images && images.length > 1 && (
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-black/50 text-white border-0 text-xs">
              +{images.length - 1} bilder
            </Badge>
          </div>
        )}
        
        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <Badge variant={statusInfo.variant} className="text-xs">
            {statusInfo.label}
          </Badge>
        </div>
        
        {/* Featured badge */}
        {isFeatured && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-yellow-500 text-yellow-900 text-xs">
              Fremhevet
            </Badge>
          </div>
        )}
        
        {/* Views counter */}
        {views > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {views}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Kategori */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
            {category}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {createdAt.toLocaleDateString('no-NO', { 
              day: 'numeric', 
              month: 'short' 
            })}
          </span>
        </div>

        {/* Tittel */}
        <h3 className="font-semibold text-lg leading-tight mb-2 max-h-[3.5rem] overflow-hidden">
          {title}
        </h3>

        {/* Pris */}
        <p className="text-2xl font-bold text-primary mb-2">
          {price === 0 ? 'Gratis' : `${price.toLocaleString('no-NO')} kr`}
        </p>

        {/* Lokasjon */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
      </CardContent>
    </Card>
  )

  // Hvis annonsen ikke er godkjent, vis bare kortet uten link
  if (!isClickable) {
    return cardContent
  }

  // Hvis annonsen er godkjent, wrap i Link
  return (
    <Link href={`/annonser/detaljer/${id}`} className="block">
      {cardContent}
    </Link>
  )
}

// Skeleton loader for når data lastes
export function ListingCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-gray-200 animate-pulse" />
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
        </div>
        <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse" />
        <div className="h-8 bg-gray-200 rounded mb-2 animate-pulse w-24" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
      </CardContent>
    </Card>
  )
}

// Grid layout for annonser
interface ListingGridProps {
  children: React.ReactNode
  className?: string
}

export function ListingGrid({ children, className = "" }: ListingGridProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {children}
    </div>
  )
}