import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Eye,
  Car,
  MapPin,
  Calendar,
  DollarSign,
  BarChart3
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function BusinessBidsPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/sign-in?redirectUrl=/dashboard/business/mine-bud')
  }

  // Sjekk business tilgang
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user?.id },
    select: { role: true, companyName: true, id: true }
  })

  if (!dbUser || dbUser.role !== 'business') {
    redirect('/registrer-bedrift')
  }

  // Hent alle bud fra denne bedriften (mock data for nå)
  const mockBids = [
    {
      id: '1',
      listingId: 'listing_1',
      amount: 435000,
      message: 'Tilbudet gjelder bilen slik den er fremstilt...',
      status: 'ACTIVE' as const,
      createdAt: new Date('2024-01-18T10:00:00'),
      isWinning: true,
      listing: {
        id: 'listing_1',
        title: '2020 BMW X5 xDrive40i - Perfekt stand',
        status: 'ACTIVE' as const,
        location: 'Oslo',
        endDate: new Date('2024-01-25T15:00:00'),
        estimatedPrice: 450000,
        currentHighestBid: 435000,
        bidCount: 3,
        user: { firstName: 'Lars', lastName: 'Hansen' }
      }
    },
    {
      id: '2',
      listingId: 'listing_2', 
      amount: 310000,
      message: 'Kjøper med øyeblikkelig betaling...',
      status: 'WON' as const,
      createdAt: new Date('2024-01-15T14:30:00'),
      isWinning: true,
      listing: {
        id: 'listing_2',
        title: '2019 Audi A6 Avant 45 TDI quattro',
        status: 'SOLD' as const,
        location: 'Bergen',
        endDate: new Date('2024-01-18T12:00:00'),
        estimatedPrice: 320000,
        currentHighestBid: 310000,
        bidCount: 2,
        user: { firstName: 'Anne', lastName: 'Svendsen' }
      }
    },
    {
      id: '3',
      listingId: 'listing_3',
      amount: 275000,
      message: 'Konkurransedyktig tilbud...',
      status: 'LOST' as const,
      createdAt: new Date('2024-01-14T09:15:00'),
      isWinning: false,
      listing: {
        id: 'listing_3',
        title: '2021 Tesla Model 3 Long Range',
        status: 'SOLD' as const,
        location: 'Trondheim',
        endDate: new Date('2024-01-17T18:00:00'),
        estimatedPrice: 280000,
        currentHighestBid: 285000,
        bidCount: 4,
        user: { firstName: 'Erik', lastName: 'Olsen' }
      }
    },
    {
      id: '4',
      listingId: 'listing_4',
      amount: 195000,
      message: 'Rask handel ønskes...',
      status: 'ACTIVE' as const,
      createdAt: new Date('2024-01-19T16:45:00'),
      isWinning: false,
      listing: {
        id: 'listing_4',
        title: '2018 Volkswagen Golf GTI',
        status: 'ACTIVE' as const,
        location: 'Stavanger',
        endDate: new Date('2024-01-26T20:00:00'),
        estimatedPrice: 210000,
        currentHighestBid: 200000,
        bidCount: 5,
        user: { firstName: 'Maria', lastName: 'Johansen' }
      }
    }
  ]

  // Statistikk
  const stats = {
    activeBids: mockBids.filter(b => b.status === 'ACTIVE').length,
    wonBids: mockBids.filter(b => b.status === 'WON').length,
    lostBids: mockBids.filter(b => b.status === 'LOST').length,
    totalInvested: mockBids.filter(b => b.status === 'WON').reduce((sum, b) => sum + b.amount, 0),
    winRate: Math.round((mockBids.filter(b => b.status === 'WON').length / mockBids.filter(b => b.status !== 'ACTIVE').length) * 100) || 0
  }

  const getTimeLeft = (endDate: Date) => {
    const now = new Date()
    const diff = endDate.getTime() - now.getTime()
    
    if (diff <= 0) return 'Avsluttet'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days} dag${days !== 1 ? 'er' : ''}, ${hours}t`
    return `${hours} timer`
  }

  const getBidStatus = (bid: typeof mockBids[0]) => {
    switch (bid.status) {
      case 'ACTIVE':
        return bid.isWinning ? (
          <Badge className="bg-green-600">Leder</Badge>
        ) : (
          <Badge variant="outline" className="text-orange-600 border-orange-200">Utkonkurrert</Badge>
        )
      case 'WON':
        return <Badge className="bg-green-600">Vunnet</Badge>
      case 'LOST':
        return <Badge variant="destructive">Tapt</Badge>
      default:
        return <Badge variant="outline">Ukjent</Badge>
    }
  }

  const getProfitEstimate = (bidAmount: number, estimatedPrice: number) => {
    const sellPrice = estimatedPrice * 1.15 // 15% markup
    const profit = sellPrice - bidAmount
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
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="h-6 w-6" />
              Mine bud
            </h1>
            <p className="text-gray-600">
              Oversikt over alle dine aktive og tidligere bud
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/business/auksjoner">
                <Eye className="h-4 w-4 mr-2" />
                Se auksjoner
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/business/profit">
                <BarChart3 className="h-4 w-4 mr-2" />
                Profit-analyse
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistikk kort */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive bud</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.activeBids}</div>
              <p className="text-xs text-muted-foreground">Pågående auksjoner</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vunne bud</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.wonBids}</div>
              <p className="text-xs text-muted-foreground">Vellykkede kjøp</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tapte bud</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.lostBids}</div>
              <p className="text-xs text-muted-foreground">Utkonkurrert</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investert</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalInvested.toLocaleString('no-NO')} kr
              </div>
              <p className="text-xs text-muted-foreground">Totalt i vunne bud</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vinnerrate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.winRate}%</div>
              <p className="text-xs text-muted-foreground">Avsluttede auksjoner</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button className="px-3 py-1 text-sm font-medium bg-white text-gray-900 rounded shadow-sm">
            Alle ({mockBids.length})
          </button>
          <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900">
            Aktive ({stats.activeBids})
          </button>
          <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900">
            Vunnet ({stats.wonBids})
          </button>
          <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900">
            Tapt ({stats.lostBids})
          </button>
        </div>

        {/* Bud liste */}
        <div className="space-y-4">
          {mockBids.map((bid) => {
            const profit = getProfitEstimate(bid.amount, bid.listing.estimatedPrice)
            
            return (
              <Card key={bid.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* Bil informasjon */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {bid.listing.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {bid.listing.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {bid.listing.status === 'ACTIVE' ? getTimeLeft(bid.listing.endDate) : 'Avsluttet'}
                            </div>
                          </div>
                        </div>
                        {getBidStatus(bid)}
                      </div>

                      <div className="text-sm text-gray-600 mb-3">
                        Selger: {bid.listing.user.firstName} {bid.listing.user.lastName}
                      </div>

                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        <strong>Ditt tilbud:</strong> {bid.message.substring(0, 80)}...
                      </div>
                    </div>

                    {/* Bud informasjon */}
                    <div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-600">Ditt bud</div>
                          <div className="text-xl font-bold text-gray-900">
                            {bid.amount.toLocaleString('no-NO')} kr
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-600">Høyeste bud</div>
                          <div className="text-lg font-semibold text-green-600">
                            {bid.listing.currentHighestBid.toLocaleString('no-NO')} kr
                          </div>
                          <div className="text-xs text-gray-500">
                            {bid.listing.bidCount} bud totalt
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-600">Estimert verdi</div>
                          <div className="text-lg font-semibold">
                            {bid.listing.estimatedPrice.toLocaleString('no-NO')} kr
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Profit og actions */}
                    <div>
                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <div className="text-sm font-medium text-blue-900 mb-2">
                          Profit-estimat
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700">Salgspris:</span>
                            <span className="font-semibold">{profit.sellPrice.toLocaleString('no-NO')} kr</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Profit:</span>
                            <span className="font-semibold text-green-700">
                              {profit.profit.toLocaleString('no-NO')} kr ({profit.margin}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button size="sm" variant="outline" className="w-full" asChild>
                          <Link href={`/dashboard/business/auksjoner/${bid.listingId}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Se detaljer
                          </Link>
                        </Button>
                        
                        {bid.status === 'ACTIVE' && (
                          <Button size="sm" className="w-full">
                            Oppdater bud
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Pagination */}
        <div className="flex justify-center">
          <div className="flex gap-2">
            <Button variant="outline" disabled>Forrige</Button>
            <Button variant="outline" className="bg-blue-600 text-white">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">Neste</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
