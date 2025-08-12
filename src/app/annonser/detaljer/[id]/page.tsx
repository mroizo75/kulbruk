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
  Flag,
  Gauge,
  Fuel,
  Cog,
  Car as CarIcon,
  Droplet,
  Palette,
  Compass
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import ListingCard, { ListingGrid } from '@/components/listing-card'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

async function getVegvesenData(regNumber: string | null | undefined) {
  if (!regNumber) return null
  try {
    const res = await fetch(`/api/vegvesen?regNumber=${encodeURIComponent(regNumber)}`, {
      // Sørg for at dette kjøres på server. Uten cache for ferske data
      cache: 'no-store'
    })
    if (!res.ok) return null
    const json = await res.json()
    return json?.carData || null
  } catch {
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
  const showContactInfo = !!session?.user

  // Hent Vegvesen-data dersom registreringsnummer finnes
  const vegvesen = await getVegvesenData(listing.registrationNumber)
  // Liten heuristikk for "Mer som dette" (samme kategori og evt. merke/modell)
  const similar = await prisma.listing.findMany({
    where: {
      id: { not: listing.id },
      status: 'APPROVED',
      isActive: true,
      ...(listing.categoryId ? { categoryId: listing.categoryId } : {}),
      ...(vegvesen?.make || listing.vehicleSpec?.make
        ? {
            OR: [
              vegvesen?.make ? { title: { contains: String(vegvesen.make) } } : undefined,
              listing.vehicleSpec?.model ? { title: { contains: String(listing.vehicleSpec.model) } } : undefined,
            ].filter(Boolean) as any,
          }
        : {}),
    },
    include: { category: true, images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
    take: 8,
    orderBy: { createdAt: 'desc' },
  })
  
  // Vesentlige spesifikasjoner under tittel (kun i UI)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tilbake-knapp */}
        <div className="mb-6">
          <Link href="/annonser" className="inline-flex items-center text-gray-600 hover:text-gray-900">
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
              allowDownload={false}
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

            {/* Bil-spesifikasjoner (DB) */}
            {listing.category.slug === 'biler' && listing.vehicleSpec && (
              <Card>
                <CardHeader>
                  <CardTitle>Tekniske data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-600">Modellår</p>
                        <p className="font-medium">{listing.vehicleSpec.year ?? '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Compass className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-600">Kilometerstand</p>
                        <p className="font-medium">{listing.vehicleSpec.mileage ? listing.vehicleSpec.mileage.toLocaleString('no-NO') + ' km' : '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Fuel className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-600">Drivstoff</p>
                        <p className="font-medium">{listing.vehicleSpec.fuelType ?? '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Cog className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-600">Girkasse</p>
                        <p className="font-medium">{listing.vehicleSpec.transmission ?? '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Gauge className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-600">Effekt</p>
                        <p className="font-medium">{listing.vehicleSpec.power ? `${listing.vehicleSpec.power} hk` : '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Palette className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-600">Farge</p>
                        <p className="font-medium">{listing.vehicleSpec.color ?? '—'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Vegvesen data (ikon-liste) */}
            {listing.category.slug === 'biler' && vegvesen && (
              <Card>
                <CardHeader>
                  <CardTitle>Data fra Vegvesen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <CarIcon className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-600">Merke / Modell</p>
                          <p className="font-medium">{vegvesen.make} {vegvesen.model}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-600">Årsmodell</p>
                          <p className="font-medium">{vegvesen.year ?? '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Fuel className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-600">Drivstoff</p>
                          <p className="font-medium">{vegvesen.fuelType ?? '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Cog className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-600">Girkasse</p>
                          <p className="font-medium">{vegvesen.transmission ?? '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Gauge className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-600">Effekt</p>
                          <p className="font-medium">{vegvesen.maxPower ? `${vegvesen.maxPower} hk` : '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Droplet className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-600">CO₂ (blandet)</p>
                          <p className="font-medium">{vegvesen.co2Emissions ?? '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-600">Sitteplasser</p>
                          <p className="font-medium">{vegvesen.seats ?? '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-600">EU-kontroll</p>
                          <p className="font-medium">{vegvesen.lastApprovedInspection ?? vegvesen.lastInspection ?? '—'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {vegvesen.tires && vegvesen.tires.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Dekk og felg</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {vegvesen.tires.map((t: any, i: number) => (
                              <div key={i} className="flex justify-between bg-gray-50 rounded p-2">
                                <span>{t.dimension}</span>
                                <span>{t.rimSize}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {vegvesen.remarks && vegvesen.remarks.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Merknader</h4>
                          <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                            {vegvesen.remarks.map((m: string, i: number) => (
                              <li key={i}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Service og ekstrautstyr */}
            {listing.vehicleSpec && (listing.vehicleSpec.serviceHistory || listing.vehicleSpec.modifications) && (
              <Card>
                <CardHeader>
                  <CardTitle>Service og ekstrautstyr</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {listing.vehicleSpec.serviceHistory && (
                      <div>
                        <h4 className="font-semibold mb-2">Servicehistorikk</h4>
                        <p className="whitespace-pre-line text-sm text-gray-700">{listing.vehicleSpec.serviceHistory}</p>
                      </div>
                    )}
                    {listing.vehicleSpec.modifications && (
                      <div>
                        <h4 className="font-semibold mb-2">Ekstrautstyr</h4>
                        <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                          {(listing.vehicleSpec.modifications.split(/\r?\n|,|;/).map(s => s.trim()).filter(Boolean)).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
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

            {/* Selger-informasjon (kun for innloggede) */}
            {showContactInfo && (
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
                        <p className="font-medium">{listing.user.firstName || (listing as any).user.name} {listing.user.lastName || ''}</p>
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
            )}

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
        {similar && similar.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-2xl font-bold mb-4">Mer som dette</h2>
            <ListingGrid>
              {similar.map((s: any) => (
                <ListingCard
                  key={s.id}
                  id={s.id}
                  title={s.title}
                  price={s.price ? Number(s.price) : 0}
                  location={s.location}
                  category={s.category?.name || 'Ukjent'}
                  status={s.status}
                  mainImage={s.images?.[0]?.url || ''}
                  images={(s.images || []).map((img: any) => ({ url: img.url, altText: img.altText || undefined }))}
                  views={s.views}
                  createdAt={s.createdAt}
                />
              ))}
            </ListingGrid>
          </div>
        )}
      </div>
    </div>
  )
}