'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Clock, 
  MapPin, 
  Car, 
  Fuel, 
  Calendar, 
  Eye,
  Gavel,
  TrendingUp,
  Filter,
  Search,
  Wifi,
  WifiOff,
  RefreshCw,
  Zap,
  Target,
  Award,
  Activity
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import Link from 'next/link'
import BidModal from '@/components/bid-modal'
import { useLiveAuctions } from '@/hooks/use-live-auctions'
import { cn } from '@/lib/utils'

export default function BusinessAuctionsPage() {
  const { 
    auctions, 
    isConnected, 
    lastUpdate, 
    refreshAuctions, 
    manualReconnect 
  } = useLiveAuctions()

  const getTimeLeft = (endDate: Date | string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return 'Avsluttet'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days} dag${days !== 1 ? 'er' : ''}, ${hours}t`
    if (hours > 0) return `${hours}t ${minutes}m`
    return `${minutes} min`
  }

  const getStatusBadge = (auction: any) => {
    switch (auction.status) {
      case 'ACTIVE':
        return auction.isWinning ? (
          <Badge className="bg-green-600 animate-pulse">
            <Target className="h-3 w-3 mr-1" />
            Leder
          </Badge>
        ) : (
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Aktiv
          </Badge>
        )
      case 'ENDING_SOON':
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-200 animate-pulse">
            <Zap className="h-3 w-3 mr-1" />
            Avslutter snart
          </Badge>
        )
      case 'ENDED':
        return auction.isWinning ? (
          <Badge className="bg-green-600">
            <Award className="h-3 w-3 mr-1" />
            Vunnet
          </Badge>
        ) : (
          <Badge variant="destructive">Avsluttet</Badge>
        )
      default:
        return <Badge variant="outline">Ukjent</Badge>
    }
  }

  const getPriceConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'HIGH':
        return <Badge variant="outline" className="text-green-600 border-green-200">🤖 Høy sikkerhet</Badge>
      case 'MEDIUM':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">🤖 Middels sikkerhet</Badge>
      case 'LOW':
        return <Badge variant="outline" className="text-red-600 border-red-200">🤖 Lav sikkerhet</Badge>
      default:
        return <Badge variant="outline">Ukjent</Badge>
    }
  }

  const getMarketTrendIcon = (trend: string) => {
    switch (trend) {
      case 'RISING':
        return <TrendingUp className="h-3 w-3 text-green-600" />
      case 'DECLINING':
        return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />
      default:
        return <TrendingUp className="h-3 w-3 text-gray-600" />
    }
  }

  // Filter auctions by status
  const activeAuctions = auctions.filter(a => a.status === 'ACTIVE')
  const endingSoonAuctions = auctions.filter(a => a.status === 'ENDING_SOON')
  const myBids = auctions.filter(a => a.myBid)
  const wonAuctions = auctions.filter(a => a.status === 'ENDED' && a.isWinning)

  return (
    <DashboardLayout userRole="business">
      <div className="space-y-6">
        {/* Header with live status */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Gavel className="h-6 w-6" />
              Live auksjoner
              {auctions.some(a => a.isNew) && (
                <Badge className="bg-red-600 animate-bounce">
                  <Zap className="h-3 w-3 mr-1" />
                  NYE
                </Badge>
              )}
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-600" />
                  Live oppdateringer aktive - {auctions.length} auksjoner
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-600" />
                  Ikke tilkoblet live feed
                </>
              )}
              {lastUpdate && (
                <span className="text-xs text-gray-500">
                  • Sist oppdatert: {lastUpdate.toLocaleTimeString('no-NO')}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshAuctions}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Oppdater
            </Button>
            {!isConnected && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={manualReconnect}
                className="text-orange-600 border-orange-200"
              >
                <Wifi className="h-4 w-4 mr-2" />
                Koble til
              </Button>
            )}
            <Button asChild>
              <Link href="/dashboard/business/profit">
                <TrendingUp className="h-4 w-4 mr-2" />
                Profit-analyse
              </Link>
            </Button>
          </div>
        </div>

        {/* Live statistikk */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aktive auksjoner</p>
                  <p className="text-2xl font-bold text-blue-600">{activeAuctions.length}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avslutter snart</p>
                  <p className="text-2xl font-bold text-orange-600">{endingSoonAuctions.length}</p>
                </div>
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mine bud</p>
                  <p className="text-2xl font-bold text-green-600">{myBids.length}</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vunnet</p>
                  <p className="text-2xl font-bold text-purple-600">{wonAuctions.length}</p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Søk og filter */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input placeholder="Søk bilmerke, modell..." />
              <select className="h-10 px-3 rounded-md border border-input bg-background">
                <option value="">Alle merker</option>
                <option value="bmw">BMW</option>
                <option value="audi">Audi</option>
                <option value="tesla">Tesla</option>
                <option value="mercedes">Mercedes</option>
              </select>
              <select className="h-10 px-3 rounded-md border border-input bg-background">
                <option value="">Alle statuser</option>
                <option value="active">Aktive</option>
                <option value="ending">Avslutter snart</option>
                <option value="my_bids">Mine bud</option>
              </select>
              <select className="h-10 px-3 rounded-md border border-input bg-background">
                <option value="">Sortér etter</option>
                <option value="newest">Nyeste først</option>
                <option value="ending">Avslutter snart</option>
                <option value="price-low">Lavest pris</option>
                <option value="price-high">Høyest pris</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Live auksjoner */}
        <div className="grid grid-cols-1 gap-6">
          {auctions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Gavel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ingen auksjoner for øyeblikket
                </h3>
                <p className="text-gray-600 mb-4">
                  Hold øynene åpne - nye bil-auksjoner kommer hele tiden!
                </p>
                <Button onClick={refreshAuctions} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sjekk for nye auksjoner
                </Button>
              </CardContent>
            </Card>
          ) : (
            auctions.map((auction) => (
              <Card 
                key={auction.id} 
                className={cn(
                  "hover:shadow-lg transition-all duration-300",
                  auction.isNew && "ring-2 ring-blue-500 ring-opacity-50 bg-blue-50",
                  auction.status === 'ENDING_SOON' && "border-orange-200 bg-orange-50",
                  auction.isWinning && "border-green-200 bg-green-50"
                )}
              >
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Bil informasjon */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {auction.title}
                            </h3>
                            {auction.isNew && (
                              <Badge className="bg-blue-600 animate-pulse">
                                NYE
                              </Badge>
                            )}
                            {getStatusBadge(auction)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {auction.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {auction.year}
                            </div>
                            <div className="flex items-center gap-1">
                              <Car className="h-4 w-4" />
                              {(auction as any).vehicleSpec?.mileage ? Number((auction as any).vehicleSpec.mileage).toLocaleString('no-NO') : 'N/A'} km
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {getTimeLeft(auction.endDate)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 mb-3">
                        Selger: {auction.seller.firstName} {auction.seller.lastName}
                      </div>

                      {/* Vehicle specs */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="font-medium">Merke:</span>
                          <p>{auction.make}</p>
                        </div>
                        <div>
                          <span className="font-medium">Modell:</span>
                          <p>{auction.model}</p>
                        </div>
                        <div>
                          <span className="font-medium">Drivstoff:</span>
                          <p>{(auction as any).vehicleSpec?.fuelType || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium">Gir:</span>
                          <p>{(auction as any).vehicleSpec?.transmission || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Prisestimering og bud */}
                    <div className="lg:col-span-1 border-l lg:pl-6">
                      <div className="space-y-4">
                        
                        {/* AI Prisestimering */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-900">AI Prisestimering</span>
                            {getMarketTrendIcon((auction as any).marketTrend || 'STABLE')}
                          </div>
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            {auction.estimatedPrice?.toLocaleString('no-NO')} kr
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {getPriceConfidenceBadge((auction as any).priceConfidence || 'MEDIUM')}
                            <Badge variant="outline" className="text-xs">
                              {(auction as any).pricingMethodology === 'AI_ANALYSIS' ? '🧠 AI' : 
                               (auction as any).pricingMethodology === 'MARKET_COMPARISON' ? '📊 Marked' : '📈 Basic'}
                            </Badge>
                          </div>
                          {(auction as any).priceRange && (
                            <div className="text-xs text-gray-600 mt-1">
                              Område: {(auction as any).priceRange.min?.toLocaleString('no-NO')} - {(auction as any).priceRange.max?.toLocaleString('no-NO')} kr
                            </div>
                          )}
                        </div>

                        {/* Nåværende bud */}
                        {auction.currentBid ? (
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Høyeste bud:</div>
                            <div className="text-xl font-semibold text-green-600">
                              {auction.currentBid.toLocaleString('no-NO')} kr
                            </div>
                            <div className="text-xs text-gray-500">
                              {auction.bidCount} bud totalt
                            </div>
                            {auction.myBid && (
                              <div className="text-xs mt-1">
                                <span className="text-blue-600">Mitt bud: {auction.myBid.toLocaleString('no-NO')} kr</span>
                                {auction.isWinning && <span className="text-green-600 ml-2">✅ Leder!</span>}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Ingen bud ennå</div>
                            <div className="text-lg text-gray-400">Vær først ut!</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Startpris: {(auction as any).startingPrice?.toLocaleString('no-NO') || 'N/A'} kr
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="space-y-2 pt-2">
                          <BidModal 
                            auctionId={auction.id}
                            title={auction.title}
                            currentBid={auction.currentBid}
                            estimatedPrice={auction.estimatedPrice || 400000}
                          />
                          
                          <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link href={`/dashboard/business/auksjoner/${auction.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Se detaljer
                            </Link>
                          </Button>
                        </div>

                        {/* Profit estimat */}
                        <div className="bg-green-50 p-3 rounded-lg text-sm">
                          <div className="font-medium text-green-900 mb-1">Quick Profit</div>
                          <div className="text-green-700 text-xs space-y-1">
                            <div>Kjøp: {(auction.currentBid || (auction as any).startingPrice || 0).toLocaleString('no-NO')} kr</div>
                            <div>Salg: ~{Math.round((auction.estimatedPrice || 400000) * 1.15).toLocaleString('no-NO')} kr</div>
                            <div className="font-semibold border-t border-green-200 pt-1">
                              Margin: ~{Math.round((auction.estimatedPrice || 400000) * 0.15).toLocaleString('no-NO')} kr
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Connection status footer */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    <span className="text-green-700">Live tilkoblet - Auksjoner oppdateres automatisk</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <span className="text-red-700">Ikke tilkoblet - Klikk "Koble til" for live oppdateringer</span>
                  </>
                )}
              </div>
              <div className="text-gray-500">
                💡 Nye auksjoner og bud-oppdateringer kommer automatisk
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}