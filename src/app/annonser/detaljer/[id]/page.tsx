import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ImageGallery from '@/components/image-gallery'
import { 
  MapPin, 
  Calendar, 
  Eye, 
  Phone, 
  Mail, 
  User, 
  ArrowLeft,
  Heart,
  Share2,
  Flag
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

// Mock data - senere hentes fra database
const getMockListing = (id: string) => ({
  id,
  title: 'BMW X5 3.0d xDrive 2018',
  description: 'Velholdt BMW X5 med lav kilometerstand. Bilen har vært godt vedlikeholdt og har service historikk. Utstyrt med navigasjon, skinn interiør, og elektriske seter. Selges på grunn av bilskifte.',
  price: 450000,
  location: 'Oslo',
  category: 'Biler',
  status: 'APPROVED' as const,
  views: 234,
  createdAt: new Date('2024-01-15'),
  images: [
    '/api/placeholder/800/600?text=BMW+X5+Front',
    '/api/placeholder/800/600?text=BMW+X5+Interior',
    '/api/placeholder/800/600?text=BMW+X5+Engine'
  ],
  contactName: 'Ola Nordmann',
  contactEmail: 'ola@example.com',
  contactPhone: '12345678',
  seller: {
    name: 'Ola Nordmann',
    memberSince: new Date('2023-05-01'),
    location: 'Oslo',
    avatar: null,
    rating: 4.8,
    totalAds: 12
  },
  vehicleInfo: {
    year: 2018,
    make: 'BMW',
    model: 'X5',
    mileage: 85000,
    fuelType: 'Diesel',
    transmission: 'Automatisk',
    engineSize: '3.0L',
    color: 'Svart metallic'
  }
})

// Hent listing data fra database
async function getListing(id: string) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            createdAt: true
          }
        },
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        vehicleSpec: true
      }
    })

    return listing
  } catch (error) {
    console.error('Feil ved henting av listing:', error)
    return null
  }
}

export default async function ListingDetailPage({ params }: PageProps) {
  const session = await auth()
  const { id } = await params
  const listing = await getListing(id)
  
  if (!listing) {
    redirect('/annonser')
  }
  
  // Oppdater visningsantall
  try {
    await prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } }
    })
  } catch (error) {
    console.error('Feil ved oppdatering av visningsantall:', error)
  }
  
  // Sjekk om brukeren er innlogget for å vise kontaktinfo
  const showContactInfo = !!user

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tilbake-knapp */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake til annonser
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hovedinnhold */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bilder */}
            <ImageGallery
              images={listing.images?.map(img => img.url) || []}
              alt={listing.title}
              aspectRatio="video"
              allowDownload={true}
              allowShare={true}
            />

            {/* Tittel og pris */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {listing.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {listing.createdAt.toLocaleDateString('no-NO')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {listing.views} visninger
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-4xl font-bold text-blue-600 mb-4">
                  {Number(listing.price).toLocaleString('no-NO')} kr
                </div>
                
                <Badge className="mb-4">{listing.category.name}</Badge>
              </CardContent>
            </Card>

            {/* Beskrivelse */}
            <Card>
              <CardHeader>
                <CardTitle>Beskrivelse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </CardContent>
            </Card>

            {/* Bil-spesifikasjoner (kun for biler) */}
            {listing.category.slug === 'biler' && listing.vehicleSpec && (
              <Card>
                <CardHeader>
                  <CardTitle>Tekniske data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">År</span>
                      <p className="font-medium">{listing.vehicleSpec.year}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Kilometerstand</span>
                      <p className="font-medium">{listing.vehicleSpec.mileage?.toLocaleString('no-NO')} km</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Drivstoff</span>
                      <p className="font-medium">{listing.vehicleSpec.fuelType}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Girkasse</span>
                      <p className="font-medium">{listing.vehicleSpec.transmission}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Effekt</span>
                      <p className="font-medium">{listing.vehicleSpec.power} hk</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Farge</span>
                      <p className="font-medium">{listing.vehicleSpec.color}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Kontaktinformasjon */}
            <Card>
              <CardHeader>
                <CardTitle>Kontakt selger</CardTitle>
              </CardHeader>
              <CardContent>
                {showContactInfo ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="font-medium">{listing.contactName}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <Button className="w-full" size="lg">
                        <Phone className="h-4 w-4 mr-2" />
                        Ring {listing.contactPhone}
                      </Button>
                      
                      <Button variant="outline" className="w-full">
                        <Mail className="h-4 w-4 mr-2" />
                        Send melding
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>📧 {listing.contactEmail}</p>
                      <p>📱 {listing.contactPhone}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800 mb-3">
                        Du må være innlogget for å se kontaktinformasjon
                      </p>
                      <Link href="/sign-in">
                        <Button className="w-full" size="lg">
                          Logg inn for å kontakte
                        </Button>
                      </Link>
                    </div>
                    <Link href="/sign-up">
                      <Button variant="outline" className="w-full">
                        Opprett konto
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selger-informasjon */}
            <Card>
              <CardHeader>
                <CardTitle>Om selger</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">{listing.user.firstName || listing.user.name} {listing.user.lastName || ''}</p>
                      <p className="text-sm text-gray-600">{listing.location}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📅 Medlem siden {listing.user.createdAt.toLocaleDateString('no-NO', { month: 'long', year: 'numeric' })}</p>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    Se alle annonser fra selger
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sikkerhetstips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">💡 Sikkerhetstips</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-600 space-y-2">
                <p>• Møt alltid selger på et trygt, offentlig sted</p>
                <p>• Undersøk varen grundig før kjøp</p>
                <p>• Unngå forhåndsbetaling til ukjente</p>
                <p>• Bruk sikre betalingsmetoder</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}