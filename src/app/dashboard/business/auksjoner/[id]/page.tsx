import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Clock, 
  MapPin, 
  User, 
  Phone,
  Mail,
  Car,
  Fuel,
  Calendar,
  Settings,
  Gauge,
  Shield,
  CheckCircle,
  Target,
  TrendingUp,
  Eye,
  Gavel
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import Link from 'next/link'
import BidModal from '@/components/bid-modal'

const prisma = new PrismaClient()

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AuctionDetailPage({ params }: PageProps) {
  const session = await auth()
  const { id } = await params
  
  if (!session) {
    redirect('/sign-in?redirectUrl=/dashboard/business/auksjoner/' + id)
  }

  // Sjekk business tilgang
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user?.id },
    select: { role: true, companyName: true }
  })

  if (!dbUser || dbUser.role !== 'business') {
    redirect('/registrer-bedrift')
  }

  // Mock detailed auction data
  const auction = {
    id: id,
    title: '2020 BMW X5 xDrive40i - Perfekt stand med full utstyrspakke',
    description: `Denne BMW X5 er i utmerket stand og har vært kjørt av kun en eier siden ny. Bilen har full servicehistorikk fra autorisert BMW-forhandler og kommer med alle originaldokumenter.

Bilen har følgende ekstrautstyr:
• Panoramatak i glass
• Harman Kardon surroundanlegg  
• Adaptiv cruise control med stopp/start
• LED-frontlykter med adaptive funksjon
• Skinninteriør i cognac
• 4-soners klimaanlegg
• Elektrisk justerbare og oppvarmede forseter
• HEAD-UP display
• Navigasjonssystem Professional
• Parkeringsassistent foran og bak

Bilen selges grunnet familieforøkelse og behov for større bil.`,
    
    status: 'ACTIVE',
    createdAt: new Date('2024-01-15T10:00:00'),
    endDate: new Date('2024-01-25T15:00:00'),
    location: 'Oslo',
    
    // Selger info
    seller: {
      firstName: 'Lars',
      lastName: 'Hansen',
      phone: '+47 123 45 678',
      email: 'lars.hansen@email.com',
      verificationLevel: 'HIGH'
    },
    
    // Bil specs
    vehicle: {
      make: 'BMW',
      model: 'X5',
      variant: 'xDrive40i',
      year: 2020,
      mileage: 45000,
      fuelType: 'Bensin',
      transmission: 'Automat',
      power: 340,
      doors: 5,
      seats: 7,
      driveType: 'Firehjulsdrift',
      color: 'Alpinweiß',
      nextInspection: new Date('2025-03-15'),
      registrationNumber: 'EK 12345',
      chassisNumber: 'WBAFR9104LC######'
    },
    
    // Priser og bud
    estimatedPrice: 465000,
    priceConfidence: 'HIGH',
    startingPrice: 400000,
    currentBid: 435000,
    bidCount: 3,
    myBid: null,
    
    // Bud historie
    bidHistory: [
      {
        id: '1',
        amount: 435000,
        bidder: 'Oslo Bil AS',
        isMyBid: false,
        timestamp: new Date('2024-01-18T14:30:00')
      },
      {
        id: '2', 
        amount: 420000,
        bidder: 'Bergen Motor',
        isMyBid: false,
        timestamp: new Date('2024-01-18T10:15:00')
      },
      {
        id: '3',
        amount: 410000,
        bidder: 'Trondheim Auto',
        isMyBid: false,
        timestamp: new Date('2024-01-17T16:45:00')
      }
    ],
    
    // Bilder (mock)
    images: [
      '/api/placeholder/800/600',
      '/api/placeholder/800/600',
      '/api/placeholder/800/600'
    ]
  }

  const getTimeLeft = () => {
    const now = new Date()
    const diff = auction.endDate.getTime() - now.getTime()
    
    if (diff <= 0) return 'Avsluttet'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days} dag${days !== 1 ? 'er' : ''}, ${hours}t ${minutes}m`
    return `${hours}t ${minutes}m`
  }

  const calculateProfit = (bidPrice: number) => {
    const sellPrice = auction.estimatedPrice * 1.15
    const profit = sellPrice - bidPrice
    const margin = (profit / sellPrice) * 100
    
    return {
      sellPrice: Math.round(sellPrice),
      profit: Math.round(profit),
      margin: margin.toFixed(1)
    }
  }

  return (
    <DashboardLayout userRole="business">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/business/auksjoner">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tilbake til auksjoner
            </Link>
          </Button>
          <Badge variant="outline" className="text-green-600 border-green-200">
            <Clock className="h-3 w-3 mr-1" />
            {getTimeLeft()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Hovedinnhold */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Bil overskrift */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{auction.title}</CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {auction.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {auction.vehicle.year}
                  </span>
                  <span className="flex items-center gap-1">
                    <Car className="h-4 w-4" />
                    {auction.vehicle.mileage.toLocaleString('no-NO')} km
                  </span>
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Bilder - Mock */}
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                  <div className="md:col-span-2 bg-gray-200 aspect-[4/3] flex items-center justify-center">
                    <Car className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-1">
                    <div className="bg-gray-100 aspect-[4/3] flex items-center justify-center">
                      <Car className="h-8 w-8 text-gray-300" />
                    </div>
                    <div className="bg-gray-100 aspect-[4/3] flex items-center justify-center">
                      <Car className="h-8 w-8 text-gray-300" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tekniske spesifikasjoner */}
            <Card>
              <CardHeader>
                <CardTitle>Tekniske spesifikasjoner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{auction.vehicle.make} {auction.vehicle.model}</div>
                      <div className="text-gray-600">{auction.vehicle.variant}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{auction.vehicle.year}</div>
                      <div className="text-gray-600">Årsmodell</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{auction.vehicle.mileage.toLocaleString('no-NO')} km</div>
                      <div className="text-gray-600">Kilometerstand</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{auction.vehicle.fuelType}</div>
                      <div className="text-gray-600">Drivstoff</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{auction.vehicle.transmission}</div>
                      <div className="text-gray-600">Gir</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{auction.vehicle.power} hk</div>
                      <div className="text-gray-600">Effekt</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{auction.vehicle.doors} dører</div>
                      <div className="text-gray-600">Antall dører</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{auction.vehicle.seats} seter</div>
                      <div className="text-gray-600">Sitteplasser</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{auction.vehicle.nextInspection.toLocaleDateString('no-NO')}</div>
                      <div className="text-gray-600">Neste EU-kontroll</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Beskrivelse */}
            <Card>
              <CardHeader>
                <CardTitle>Beskrivelse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {auction.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-700 mb-3">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bud historie */}
            <Card>
              <CardHeader>
                <CardTitle>Budhistorikk ({auction.bidCount} bud)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auction.bidHistory.map((bid, index) => (
                    <div key={bid.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={index === 0 ? "default" : "outline"}>
                          {index === 0 ? 'Høyeste' : `#${index + 1}`}
                        </Badge>
                        <div>
                          <div className="font-medium">{bid.bidder}</div>
                          <div className="text-sm text-gray-600">
                            {bid.timestamp.toLocaleDateString('no-NO')} {bid.timestamp.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold">
                        {bid.amount.toLocaleString('no-NO')} kr
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Bud og info */}
          <div className="space-y-6">
            
            {/* Prisestimering */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Prisestimering
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-gray-900">
                    {auction.estimatedPrice.toLocaleString('no-NO')} kr
                  </div>
                  <Badge variant="outline" className="mt-2 text-green-600 border-green-200">
                    {auction.priceConfidence === 'HIGH' ? 'Høy' : 'Middels'} sikkerhet
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Startpris:</span>
                    <span>{auction.startingPrice.toLocaleString('no-NO')} kr</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nåværende bud:</span>
                    <span className="font-semibold text-green-600">
                      {auction.currentBid.toLocaleString('no-NO')} kr
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Antall bud:</span>
                    <span>{auction.bidCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gi bud */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Gi ditt bud
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <BidModal 
                  auctionId={auction.id}
                  title={auction.title}
                  currentBid={auction.currentBid}
                  estimatedPrice={auction.estimatedPrice}
                />
                
                {/* Profit preview */}
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <div className="font-medium text-blue-900 mb-2">Profit-estimat (ved nåværende høyeste bud)</div>
                  <div className="space-y-1">
                    {(() => {
                      const profit = calculateProfit(auction.currentBid)
                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Kjøp:</span>
                            <span>{auction.currentBid.toLocaleString('no-NO')} kr</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Salg:</span>
                            <span>{profit.sellPrice.toLocaleString('no-NO')} kr</span>
                          </div>
                          <div className="flex justify-between font-semibold border-t border-blue-200 pt-1">
                            <span className="text-blue-700">Profit:</span>
                            <span className="text-green-700">
                              {profit.profit.toLocaleString('no-NO')} kr ({profit.margin}%)
                            </span>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selger informasjon */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Selger
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {auction.seller.firstName} {auction.seller.lastName}
                  </span>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verifisert
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{auction.seller.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{auction.seller.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{auction.location}</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full mt-3">
                  <Phone className="h-4 w-4 mr-2" />
                  Kontakt selger
                </Button>
              </CardContent>
            </Card>

            {/* Handlinger */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Legg til favoritter
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Del annonse
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
