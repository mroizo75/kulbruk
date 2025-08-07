import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Car, 
  Clock, 
  DollarSign, 
  Target, 
  Award,
  Calendar,
  BarChart3,
  Gavel,
  Eye,
  Plus
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function BusinessDashboard() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in?redirectUrl=/dashboard/business')
  }

  // Sjekk at brukeren er business
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { 
      role: true, 
      companyName: true, 
      orgNumber: true,
      phone: true,
      website: true,
      createdAt: true
    },
    include: {
      subscription: true
    }
  })

  if (!dbUser || dbUser.role !== 'business') {
    redirect('/registrer-bedrift')
  }

  // Hent business statistikk
  const [
    activeAuctions,
    totalBids,
    wonAuctions,
    pendingAuctions
  ] = await Promise.all([
    // Mock data - implementer når Auction model er klar
    Promise.resolve(12), // Aktive auksjoner
    Promise.resolve(28), // Mine bud
    Promise.resolve(5),  // Vunne auksjoner
    Promise.resolve(3)   // Ventende resultater
  ])

  // Mock profit data
  const profitData = {
    thisMonth: 245000,
    lastMonth: 198000,
    avgMargin: 18.5,
    totalProfit: 1250000
  }

  const profitChange = ((profitData.thisMonth - profitData.lastMonth) / profitData.lastMonth * 100).toFixed(1)

  // Mock nylige auksjoner
  const recentAuctions = [
    {
      id: '1',
      title: '2020 BMW X5 xDrive40i',
      location: 'Oslo',
      estimatedPrice: 450000,
      myBid: 425000,
      status: 'active' as const,
      endsAt: new Date('2024-01-20T15:00:00'),
      leadingBid: 440000,
      isLeading: false
    },
    {
      id: '2', 
      title: '2019 Audi A6 Avant',
      location: 'Bergen',
      estimatedPrice: 320000,
      myBid: 310000,
      status: 'won' as const,
      endsAt: new Date('2024-01-18T12:00:00'),
      leadingBid: 310000,
      isLeading: true
    },
    {
      id: '3',
      title: '2021 Tesla Model 3',
      location: 'Trondheim', 
      estimatedPrice: 280000,
      myBid: 275000,
      status: 'lost' as const,
      endsAt: new Date('2024-01-17T18:00:00'),
      leadingBid: 285000,
      isLeading: false
    }
  ]

  const getTimeUntil = (date: Date) => {
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    
    if (diff <= 0) return 'Avsluttet'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days} dag${days !== 1 ? 'er' : ''}`
    }
    
    return `${hours}t ${minutes}m`
  }

  const getStatusBadge = (auction: typeof recentAuctions[0]) => {
    switch (auction.status) {
      case 'active':
        return auction.isLeading ? 
          <Badge className="bg-green-600">Leder</Badge> :
          <Badge variant="outline" className="text-orange-600 border-orange-200">Aktiv</Badge>
      case 'won':
        return <Badge className="bg-green-600">Vunnet</Badge>
      case 'lost':
        return <Badge variant="destructive">Tapt</Badge>
    }
  }

  return (
    <DashboardLayout userRole="business">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Velkommen, {dbUser.companyName}
            </h1>
            <p className="text-gray-600">
              Få oversikt over dine auksjoner og profit-muligheter
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive auksjoner</CardTitle>
              <Gavel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeAuctions}</div>
              <p className="text-xs text-muted-foreground">Pågående budprosesser</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mine bud</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{totalBids}</div>
              <p className="text-xs text-muted-foreground">Totale bud sendt</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vunne auksjoner</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{wonAuctions}</div>
              <p className="text-xs text-muted-foreground">Suksessrate: {((wonAuctions / totalBids) * 100).toFixed(1)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventende</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{pendingAuctions}</div>
              <p className="text-xs text-muted-foreground">Avventer resultat</p>
            </CardContent>
          </Card>
        </div>

        {/* Profit oversikt */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Profit-oversikt
            </CardTitle>
            <CardDescription>
              Din fortjeneste og margin-analyse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {profitData.thisMonth.toLocaleString('no-NO')} kr
                </div>
                <p className="text-sm text-gray-600">Denne måneden</p>
                <Badge variant={parseFloat(profitChange) > 0 ? 'default' : 'destructive'} className="mt-1">
                  {parseFloat(profitChange) > 0 ? '+' : ''}{profitChange}%
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {profitData.avgMargin}%
                </div>
                <p className="text-sm text-gray-600">Gjennomsnittlig margin</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {profitData.lastMonth.toLocaleString('no-NO')} kr
                </div>
                <p className="text-sm text-gray-600">Forrige måned</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {profitData.totalProfit.toLocaleString('no-NO')} kr
                </div>
                <p className="text-sm text-gray-600">Total profit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aktive og nylige auksjoner */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Nylige auksjoner</CardTitle>
                <CardDescription>
                  Dine siste bud og resultater
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href="/dashboard/business/auksjoner">
                  Se alle
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAuctions.map((auction) => (
                <div key={auction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{auction.title}</h3>
                      {getStatusBadge(auction)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Lokasjon:</span>
                        <p>{auction.location}</p>
                      </div>
                      <div>
                        <span className="font-medium">Estimat:</span>
                        <p>{auction.estimatedPrice.toLocaleString('no-NO')} kr</p>
                      </div>
                      <div>
                        <span className="font-medium">Mitt bud:</span>
                        <p className="font-semibold">{auction.myBid.toLocaleString('no-NO')} kr</p>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <p>{auction.status === 'active' ? getTimeUntil(auction.endsAt) : 
                            auction.status === 'won' ? 'Vunnet!' : 'Tapt'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {auction.status === 'active' && (
                      <Button size="sm" variant="outline">
                        Oppdater bud
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/dashboard/business/auksjoner/${auction.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hurtig tilgang */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Hurtig tilgang</CardTitle>
              <CardDescription>
                Vanlige oppgaver
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/business/auksjoner">
                  <Gavel className="h-4 w-4 mr-2" />
                  Se nye auksjoner
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/business/mine-bud">
                  <Target className="h-4 w-4 mr-2" />
                  Mine aktive bud
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/business/profit">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Profit-kalkulator
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bedriftsinformasjon</CardTitle>
              <CardDescription>
                Din registrerte bedrift
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Bedrift:</span>
                  <p className="text-gray-600">{dbUser.companyName}</p>
                </div>
                <div>
                  <span className="font-medium">Org.nr:</span>
                  <p className="text-gray-600">{dbUser.orgNumber}</p>
                </div>
                <div>
                  <span className="font-medium">Telefon:</span>
                  <p className="text-gray-600">{dbUser.phone}</p>
                </div>
                <div>
                  <span className="font-medium">Medlem siden:</span>
                  <p className="text-gray-600">
                    {new Date(dbUser.createdAt).toLocaleDateString('no-NO')}
                  </p>
                </div>
              </div>
              
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href="/dashboard/business/innstillinger">
                  Oppdater informasjon
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}