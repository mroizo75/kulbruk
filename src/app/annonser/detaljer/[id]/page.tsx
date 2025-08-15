import { auth } from '@/lib/auth'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import ImageGallery from '@/components/image-gallery'
import VehicleSpecifications from '@/components/vehicle-specifications'
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
import ContactSeller from '@/components/contact-seller'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import ListingCard from '@/components/listing-card'
import LoanCalculator from '@/components/loan-calculator'
import ReviewSummary from '@/components/reviews/review-summary'
import ReviewForm from '@/components/reviews/review-form'
import RecentlyViewedRecorder from '@/components/recently-viewed-recorder'
// Address map uses a simple Google Maps embed per your preference

export const dynamic = 'force-dynamic'
export const revalidate = 0
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  // Hent listing tittel/bilde for OG
  try {
    const item = await prisma.listing.findFirst({
      where: { OR: [{ id }, { shortCode: id }] },
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
    })
    const title = item?.title ? `${item.title} – Kulbruk` : 'Annonse – Kulbruk'
    const description = item?.description?.slice(0, 160) || 'Se detaljer for annonsen på Kulbruk.'
    const ogImage = item?.images?.[0]?.url
    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
      title,
      description,
      alternates: { canonical: `/annonser/detaljer/${id}` },
      openGraph: {
        title,
        description,
        type: 'article',
        images: ogImage ? [{ url: ogImage }] : undefined,
      },
    }
  } catch {
    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
      title: 'Annonse – Kulbruk',
      description: 'Se detaljer for annonsen på Kulbruk.',
    }
  }
}

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
  const listingById = await getListing(id)
  // Hvis ikke funnet med id, forsøk kortkode (shortCode)
  const listing = listingById || await prisma.listing.findFirst({
    where: { shortCode: id },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, createdAt: true } },
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      vehicleSpec: true,
    }
  })
  
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

  // Bedre "Mer som dette": bruk make/model fra både Vegvesen og VehicleSpec
  const searchTerms = [
    vegvesen?.make,
    vegvesen?.model,
    listing.vehicleSpec?.make,
    listing.vehicleSpec?.model,
  ].filter((t): t is string => typeof t === 'string' && t.trim().length > 0)

  let similar = await prisma.listing.findMany({
    where: {
      id: { not: listing.id },
      status: 'APPROVED',
      isActive: true,
      ...(listing.categoryId ? { categoryId: listing.categoryId } : {}),
      ...(searchTerms.length > 0
        ? {
            OR: searchTerms.map((term) => ({ title: { contains: term } })),
          }
        : {}),
    },
    include: { category: true, images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
    take: 8,
    orderBy: { createdAt: 'desc' },
  })

  // Fallback: hvis ingen treff på make/model, vis flere fra samme kategori
  if (!similar || similar.length === 0) {
    similar = await prisma.listing.findMany({
      where: {
        id: { not: listing.id },
        status: 'APPROVED',
        isActive: true,
        ...(listing.categoryId ? { categoryId: listing.categoryId } : {}),
      },
      include: { category: true, images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
      take: 8,
      orderBy: { createdAt: 'desc' },
    })
  }
  
  // Vesentlige spesifikasjoner under tittel (kun i UI)
  const showAddressEnabled = (listing as any)?.showAddress === true

  // Hent callbackUrl for tilbake-knapp
  const hdrs = await headers()
  const referer = hdrs.get('referer') || '/annonser'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RecentlyViewedRecorder 
          id={listing.id}
          title={listing.title}
          mainImage={listing.images?.[0]?.url || null}
          price={Number(listing.price)}
          location={listing.location}
          createdAt={listing.createdAt}
        />
        {/* Tilbake-knapp */}
        <div className="mb-6">
          <Link href={referer} className="inline-flex items-center text-gray-600 hover:text-gray-900">
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
                
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {Number(listing.price).toLocaleString('no-NO')} kr
                </div>
                <div className="mb-4">
                  <ReviewSummary userId={listing.user.id} />
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{listing.category.name}</Badge>
                  {listing.shortCode && (
                    <Badge variant="outline">Annonsenr: {listing.shortCode}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lånekalkulator */}
            <LoanCalculator listingId={listing.id} priceNok={Number(listing.price)} />

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
            {/* Komplett bil-spesifikasjon */}
            {listing.category.slug === 'biler' && listing.vehicleSpec && (
              <VehicleSpecifications 
                vehicleSpec={{
                  ...listing.vehicleSpec,
                  additionalEquipment: Array.isArray(listing.vehicleSpec.additionalEquipment) 
                    ? listing.vehicleSpec.additionalEquipment as string[]
                    : [],
                  remarks: [],
                  firstRegistrationDate: undefined,
                  lastInspection: undefined,
                  nextInspection: listing.vehicleSpec.nextInspection?.toISOString(),
                }}
                listingPrice={Number(listing.price)}
              />
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

            {/* Vurdering av selger */}
            <Card>
              <CardHeader>
                <CardTitle>Vurder selger</CardTitle>
              </CardHeader>
              <CardContent>
                {session?.user ? (
                  <ReviewForm revieweeId={listing.user.id} listingId={listing.id} />
                ) : (
                  <div className="text-sm text-gray-600">
                    Du må være innlogget for å legge igjen vurdering. {' '}
                    <Link className="underline" href="/sign-in">Logg inn</Link>
                  </div>
                )}
              </CardContent>
            </Card>
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
                      
                      <ContactSeller listingId={listing.id} sellerId={listing.user.id} />
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

            {/* Kart over selgers adresse (kun hvis selger vil vise adresse) */}
            {showAddressEnabled && listing.location && (
              <Card>
                <CardHeader>
                  <CardTitle>Adresse</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-700 mb-3">{listing.location}</div>
                  <iframe
                    title="Kart"
                    className="w-full h-64 rounded-md border"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(listing.location)}&output=embed`}
                  />
                </CardContent>
              </Card>
            )}

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            </div>
          </div>
        )}
      </div>
    </div>
  )
}