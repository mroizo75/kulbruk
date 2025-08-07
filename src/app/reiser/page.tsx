'use client'

import { useState, useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import FlightSearchForm from '@/components/flight-search-form'
import FlightFilters, { FlightFilters as FlightFiltersType } from '@/components/flight-filters'
import { FlightBookingModal } from '@/components/flight-booking-modal'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plane, Clock, MapPin, Users, ArrowRight, Star, TrendingDown, Package, DollarSign, Filter, SlidersHorizontal, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { getAirlineInfo } from '@/lib/airline-logos'

interface FlightOffer {
  id: string
  price: {
    total: number
    currency: string
    formattedNOK: string
  }
  numberOfBookableSeats: number
  validatingAirlineCodes: string[]
  itineraries: Array<{
    duration: string
    segments: Array<{
      departure: {
        iataCode: string
        at: string
        formatted: string
      }
      arrival: {
        iataCode: string
        at: string
        formatted: string
      }
      carrierCode: string
      number: string
      duration: string
      aircraft?: string | { code: string }
    }>
  }>
  originalOffer: any
}

// Populære ruter med sanntidspriser inspirert av FINN.no
const popularRoutes = [
  { from: 'Oslo', to: 'London', price: '612', month: 'oktober 2025', code: 'OSL-LHR', trend: 'ned' },
  { from: 'Oslo', to: 'København', price: '889', month: 'august 2025', code: 'OSL-CPH', trend: 'ned' },
  { from: 'Oslo', to: 'Stockholm', price: '959', month: 'august 2025', code: 'OSL-ARN', trend: 'opp' },
  { from: 'Bergen', to: 'London', price: '745', month: 'september 2025', code: 'BGO-LHR', trend: 'ned' },
  { from: 'Oslo', to: 'Barcelona', price: '828', month: 'mai 2026', code: 'OSL-BCN', trend: 'ned' },
  { from: 'Oslo', to: 'Amsterdam', price: '934', month: 'september 2025', code: 'OSL-AMS', trend: 'ned' },
  { from: 'Stavanger', to: 'Oslo', price: '499', month: 'september 2025', code: 'SVG-OSL', trend: 'ned' },
  { from: 'Oslo', to: 'Ålesund', price: '1001', month: 'august 2025', code: 'OSL-AES', trend: 'opp' },
  { from: 'Oslo', to: 'Gdansk', price: '318', month: 'september 2025', code: 'OSL-GDN', trend: 'ned' },
  { from: 'Oslo', to: 'Riga', price: '707', month: 'september 2025', code: 'OSL-RIX', trend: 'ned' },
  { from: 'Oslo', to: 'Vilnius', price: '761', month: 'oktober 2025', code: 'OSL-VNO', trend: 'ned' },
  { from: 'Oslo', to: 'Billund', price: '1089', month: 'august 2025', code: 'OSL-BLL', trend: 'opp' }
]

export default function ReiserPage() {
  const { user, isLoaded } = useUser()
  const [searchResults, setSearchResults] = useState<FlightOffer[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'cheapest' | 'best' | 'fastest'>('all')
  const [selectedOffer, setSelectedOffer] = useState<FlightOffer | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [bookingPassengers, setBookingPassengers] = useState(1)

  // Funksjon for å deduplisere flyresultater
  const deduplicateFlights = (offers: FlightOffer[]): FlightOffer[] => {
    console.log(`🔄 Deduplisering starter med ${offers.length} tilbud`)
    
    // Mindre aggressiv deduplisering - kun exact duplicate removal
    const seen = new Set<string>()
    const unique: FlightOffer[] = []
    
    for (const offer of offers) {
      // Kun fjern EKSAKTE duplikater (samme ID fra Amadeus)
      const signature = offer.id
      
      if (!seen.has(signature)) {
        seen.add(signature)
        unique.push(offer)
      } else {
        console.log(`🔄 Fjernet duplikat: ${offer.id}`)
      }
    }
    
    // Sorter etter pris for bedre visning av mangfold
    const sorted = unique.sort((a, b) => {
      const priceA = parseFloat(a.price.total.toString())
      const priceB = parseFloat(b.price.total.toString())
      return priceA - priceB
    })
    
    // Logg flyselskaper for debugging
    const segmentAirlines = [...new Set(sorted.flatMap(offer => 
      offer.itineraries.flatMap(it => it.segments.map(seg => seg.carrierCode))
    ))].filter(Boolean)
    
    const validatingAirlines = [...new Set(sorted.flatMap(offer => 
      offer.validatingAirlineCodes || []
    ))].filter(Boolean)
    
    console.log(`✈️ Dedupliserte flyresultater: ${offers.length} → ${sorted.length}`)
    console.log(`🏢 Segment airlines: ${segmentAirlines.join(', ')}`)
    console.log(`✅ Validating airlines: ${validatingAirlines.join(', ')}`)
    
    // Sjekk om målsatte flyselskaper finnes
    const targetAirlines = ['DY', 'BA', 'FR', 'U2']
    const foundTargets = targetAirlines.filter(code => 
      segmentAirlines.includes(code) || validatingAirlines.includes(code)
    )
    console.log(`🎯 Målsatte flyselskaper i dedupliserte data: ${foundTargets.join(', ') || 'INGEN!'}`)
    
    return sorted
  }

  // Default filter state
  const [filters, setFilters] = useState<FlightFiltersType>({
    sortBy: 'price',
    sortOrder: 'asc',
    maxPrice: 10000,
    minPrice: 0,
    directFlights: false,
    maxStops: 3,
    departureTimeRange: [0, 23],
    arrivalTimeRange: [0, 23],
    maxTravelTime: 24,
    airlines: [],
    excludeAirports: [],
    baggageIncluded: false,
    cabinClasses: []
  })

  const handleSearch = async (searchData: any) => {
    setIsSearching(true)
    setHasSearched(true)
    
    try {
      console.log('🔍 Søker etter flyreiser...', searchData)

      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          origin: searchData.origin,
          destination: searchData.destination,
          departureDate: searchData.departureDate,
          returnDate: searchData.tripType === 'roundtrip' ? searchData.returnDate : undefined,
          adults: searchData.adults,
          children: searchData.children,
          cabinClass: searchData.cabinClass,
          nonStop: false
        })
      })

      const result = await response.json()

      if (result.success) {
        const offers = result.offers || []
        const uniqueOffers = deduplicateFlights(offers)
        setSearchResults(uniqueOffers)
        toast.success(`Fant ${uniqueOffers.length} unike flytilbud${offers.length > uniqueOffers.length ? ` (${offers.length - uniqueOffers.length} duplikater fjernet)` : ''}`)
        
        // Update price range based on results
        if (uniqueOffers.length > 0) {
          const prices = uniqueOffers.map((offer: FlightOffer) => offer.price.total)
          const minPrice = Math.min(...prices)
          const maxPrice = Math.max(...prices)
          setFilters(prev => ({
            ...prev,
            minPrice: Math.floor(minPrice / 100) * 100,
            maxPrice: Math.ceil(maxPrice / 100) * 100
          }))
        }
      } else {
        toast.error(result.error || 'Kunne ikke søke etter flyreiser')
        setSearchResults([])
      }

    } catch (error) {
      console.error('Flight search error:', error)
      toast.error('Kunne ikke søke etter flyreiser')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleBookFlight = (offer: FlightOffer, passengers: number = 1) => {
    // La brukere starte booking-prosessen uten å være logget inn
    setSelectedOffer(offer)
    setBookingPassengers(passengers)
    setIsBookingModalOpen(true)
  }

  const handleQuickSearch = (route: any) => {
    const [fromCode, toCode] = route.code.split('-')
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 14) // 2 uker frem
    
    const searchData = {
      origin: fromCode,
      destination: toCode,
      departureDate: futureDate.toISOString().split('T')[0],
      adults: 1,
      children: 0,
      cabinClass: 'ECONOMY',
      tripType: 'oneway' as const
    }
    
    handleSearch(searchData)
  }

  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?/)
    if (!match) return duration
    
    const hours = match[1] ? match[1].replace('H', 't ') : ''
    const minutes = match[2] ? match[2].replace('M', 'm') : ''
    return `${hours}${minutes}`.trim()
  }

  // Helper function to calculate number of stops
  const getStopsCount = (offer: FlightOffer) => {
    return Math.max(...offer.itineraries.map(itinerary => itinerary.segments.length - 1))
  }

  // Helper function to get flight duration in hours
  const getTotalDurationHours = (offer: FlightOffer) => {
    const durations = offer.itineraries.map(itinerary => {
      const match = itinerary.duration.match(/PT(\d+H)?(\d+M)?/)
      if (!match) return 0
      const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0
      const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0
      return hours + minutes / 60
    })
    return Math.max(...durations)
  }

  // Helper function to get departure hour
  const getDepartureHour = (offer: FlightOffer) => {
    const firstSegment = offer.itineraries[0]?.segments[0]
    if (!firstSegment) return 0
    return new Date(firstSegment.departure.at).getHours()
  }

    // Helper function to get arrival hour
  const getArrivalHour = (offer: FlightOffer) => {
    const lastItinerary = offer.itineraries[offer.itineraries.length - 1]
    const lastSegment = lastItinerary?.segments[lastItinerary.segments.length - 1]
    if (!lastSegment) return 0
    return new Date(lastSegment.arrival.at).getHours()
  }

  // Helper function to calculate "best" score (kombinerer pris, tid og komfort)
  const getBestScore = (offer: FlightOffer) => {
    const priceScore = parseFloat(offer.price.total.toString()) / 100 // Normalisér pris
    const durationScore = getTotalDurationHours(offer) * 10 // Tid er viktig
    const stopsScore = getStopsCount(offer) * 50 // Straff for stopp
    return priceScore + durationScore + stopsScore
  }

  // Helper function to get aircraft display string
  const getAircraftDisplay = (aircraft?: string | { code: string }) => {
    if (!aircraft) return 'N/A'
    if (typeof aircraft === 'string') return aircraft
    return aircraft.code || 'N/A'
  }

  // Get sorted results based on active tab (bruker RAW searchResults som base for tabs)
  const getTabResults = () => {
    if (!searchResults.length) return []
    
    // For tabs: bruk RAW searchResults, for 'all': bruk filtrerte
    const baseResults = activeTab === 'all' ? filteredAndSortedResults : searchResults
    
    switch (activeTab) {
      case 'cheapest':
        return [...baseResults]
          .sort((a, b) => {
            const priceA = parseFloat(a.price.total.toString())
            const priceB = parseFloat(b.price.total.toString())
            return priceA - priceB
          })
          .slice(0, 50) // Top 50 billigste
          
      case 'fastest':
        return [...baseResults]
          .sort((a, b) => getTotalDurationHours(a) - getTotalDurationHours(b))
          .slice(0, 50) // Top 50 raskeste
          
      case 'best':
        return [...baseResults]
          .sort((a, b) => getBestScore(a) - getBestScore(b))
          .slice(0, 50) // Top 50 "beste" (balanse av pris/tid/komfort)
          
      default: // 'all'
        return filteredAndSortedResults
    }
  }

  // Filter and sort results
  const filteredAndSortedResults = useMemo(() => {
    let filtered = searchResults.filter(offer => {
      // Price filter
      if (offer.price.total < filters.minPrice || offer.price.total > filters.maxPrice) {
        return false
      }

      // Direct flights filter
      const stopsCount = getStopsCount(offer)
      if (filters.directFlights && stopsCount > 0) {
        return false
      }

      // Max stops filter
      if (stopsCount > filters.maxStops) {
        return false
      }

      // Airlines filter
      if (filters.airlines.length > 0) {
        const hasSelectedAirline = offer.validatingAirlineCodes.some(code => 
          filters.airlines.includes(code)
        )
        if (!hasSelectedAirline) {
          return false
        }
      }

      // Travel time filter
      const travelTimeHours = getTotalDurationHours(offer)
      if (travelTimeHours > filters.maxTravelTime) {
        return false
      }

      // Departure time filter
      const departureHour = getDepartureHour(offer)
      if (departureHour < filters.departureTimeRange[0] || departureHour > filters.departureTimeRange[1]) {
        return false
      }

      // Arrival time filter
      const arrivalHour = getArrivalHour(offer)
      if (arrivalHour < filters.arrivalTimeRange[0] || arrivalHour > filters.arrivalTimeRange[1]) {
        return false
      }

      return true
    })

    // Sort results (med riktig håndtering av pris som string/number)
    filtered.sort((a, b) => {
      const multiplier = filters.sortOrder === 'asc' ? 1 : -1
      
      switch (filters.sortBy) {
        case 'price':
          const priceA = parseFloat(a.price.total.toString())
          const priceB = parseFloat(b.price.total.toString())
          return (priceA - priceB) * multiplier
        case 'duration':
          return (getTotalDurationHours(a) - getTotalDurationHours(b)) * multiplier
        case 'departure':
          return (getDepartureHour(a) - getDepartureHour(b)) * multiplier
        case 'arrival':
          return (getArrivalHour(a) - getArrivalHour(b)) * multiplier
        case 'stops':
          return (getStopsCount(a) - getStopsCount(b)) * multiplier
        default:
          return 0
      }
    })

    return filtered
  }, [searchResults, filters])

  // Get available airlines from search results
  const availableAirlines = useMemo(() => {
    const airlines = new Set<string>()
    searchResults.forEach(offer => {
      // Sikker håndtering hvis validatingAirlineCodes mangler
      const codes = offer.validatingAirlineCodes || []
      codes.forEach(code => airlines.add(code))
    })
    return Array.from(airlines).sort()
  }, [searchResults])

  // Get price range from search results
  const priceRange = useMemo(() => {
    if (searchResults.length === 0) {
      return { min: 0, max: 10000 }
    }
    const prices = searchResults.map(offer => offer.price.total)
    return {
      min: Math.floor(Math.min(...prices) / 100) * 100,
      max: Math.ceil(Math.max(...prices) / 100) * 100
    }
  }, [searchResults])

  const resetFilters = () => {
    setFilters({
      sortBy: 'price',
      sortOrder: 'asc',
      maxPrice: priceRange.max,
      minPrice: priceRange.min,
      directFlights: false,
      maxStops: 3,
      departureTimeRange: [0, 23],
      arrivalTimeRange: [0, 23],
      maxTravelTime: 24,
      airlines: [],
      excludeAirports: [],
      baggageIncluded: false,
      cabinClasses: []
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section med søkeskjema */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Reise</h1>
              <p className="text-lg text-gray-600">
                Søk og sammenlign flypriser fra Norwegian, SAS og andre flyselskaper
              </p>
            </div>

            {/* Search Form Container */}
            <div className="bg-white rounded-lg shadow-lg border p-6">
              <FlightSearchForm onSearch={handleSearch} isLoading={isSearching} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Results Layout */}
          {hasSearched && (
            <div className="flex gap-6">
              {/* Filter Sidebar */}
              {showFilters && (
                <div className="hidden lg:block">
                  <FlightFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    availableAirlines={availableAirlines}
                    priceRange={priceRange}
                    onResetFilters={resetFilters}
                  />
                </div>
              )}

              {/* Results Content */}
              <div className="flex-1">
                {/* Mobile Filter Toggle */}
                <div className="lg:hidden mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtrer og sorter
                  </Button>
                </div>

                {/* Search Progress */}
                {isSearching && (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Søker etter flyreiser...</p>
                  </div>
                )}

                {/* Results Tabs */}
                {searchResults.length > 0 && (
                  <div className="mb-6">
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-8">
                        <button
                          onClick={() => setActiveTab('all')}
                          className={`py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'all'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Alle resultater ({searchResults.length})
                        </button>
                        <button
                          onClick={() => setActiveTab('cheapest')}
                          className={`py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'cheapest'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          💰 Billigst
                        </button>
                        <button
                          onClick={() => setActiveTab('best')}
                          className={`py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'best'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          ⭐ Best
                        </button>
                        <button
                          onClick={() => setActiveTab('fastest')}
                          className={`py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'fastest'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          ⚡ Raskest
                        </button>
                      </nav>
                    </div>
                  </div>
                )}

                {/* Results Header */}
                {getTabResults().length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {getTabResults().length} flyreiser
                        {activeTab !== 'all' && (
                          <span className="text-lg font-normal text-gray-600 ml-2">
                            ({activeTab === 'cheapest' && 'billigste'}
                             {activeTab === 'best' && 'beste'}
                             {activeTab === 'fastest' && 'raskeste'})
                          </span>
                        )}
                      </h2>
                      {activeTab === 'all' && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>Sortert etter:</span>
                          <Badge variant="outline">
                            {filters.sortBy === 'price' && 'Pris'}
                            {filters.sortBy === 'duration' && 'Reisetid'}
                            {filters.sortBy === 'departure' && 'Avreise'}
                            {filters.sortBy === 'arrival' && 'Ankomst'}
                            {filters.sortBy === 'stops' && 'Mellomlanding'}
                            {' '}
                            ({filters.sortOrder === 'asc' ? 'stigende' : 'synkende'})
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Flight Results */}
                {getTabResults().length > 0 && (
                  <div className="space-y-4">
                    {getTabResults().map((offer, offerIndex) => (
                      <Card key={`${offer.id}-${offerIndex}`} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            {/* Flight Details */}
                            <div className="flex-1">
                              {offer.itineraries.map((itinerary, idx) => {
                                // Få alle flyselskaper for denne reiseruten
                                const allCarriers = itinerary.segments.map(seg => seg.carrierCode)
                                const uniqueCarriers = [...new Set(allCarriers)]
                                const mainCarrier = itinerary.segments[0].carrierCode
                                const airlineInfo = getAirlineInfo(mainCarrier)
                                
                                return (
                                  <div key={`${offer.id}-itinerary-${idx}`} className="mb-4 last:mb-0">
                                    <div className="flex items-center gap-3 mb-3">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                                          <img 
                                            src={airlineInfo.logo} 
                                            alt={`${mainCarrier} logo`}
                                            className="w-full h-full object-contain airline-logo"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement
                                              const container = target.parentElement
                                              
                                              // Sjekk om det er lokal logo som feiler først
                                              if (target.src.includes('/flylogo/')) {
                                                // Prøv Daisycon API som backup
                                                const fallbackUrl = `https://images.daisycon.io/airline/?iata=${mainCarrier.toLowerCase()}&width=60&height=60&color=ffffff`
                                                target.src = fallbackUrl
                                              } else {
                                                // Både lokal og Daisycon feilet - vis fly-ikon
                                                target.style.display = 'none'
                                                if (container) {
                                                  container.innerHTML = '<div class="w-full h-full bg-blue-100 rounded flex items-center justify-center"><svg class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg></div>'
                                                }
                                              }
                                            }}
                                          />
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                          {uniqueCarriers.map(carrier => (
                                            <Badge key={carrier} className="bg-blue-100 text-blue-800 text-xs">
                                              {carrier}
                                            </Badge>
                                          ))}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">
                                          {airlineInfo.name}
                                          {uniqueCarriers.length > 1 && ` +${uniqueCarriers.length - 1}`}
                                        </span>
                                      </div>
                                    <span className="text-sm text-gray-500 flex items-center">
                                      <Clock className="h-4 w-4 mr-1" />
                                      {formatDuration(itinerary.duration)}
                                    </span>
                                    {getStopsCount(offer) > 0 && (
                                      <Badge variant="outline" className="text-xs">
                                        {getStopsCount(offer)} stopp
                                      </Badge>
                                    )}
                                    {getStopsCount(offer) === 0 && (
                                      <Badge className="bg-green-100 text-green-800 text-xs">
                                        Direktefly
                                      </Badge>
                                    )}
                                    </div>
                                    
                                    {/* Ekstra informasjon */}
                                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-2">
                                      <div className="flex items-center gap-1">
                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>{new Date(itinerary.segments[0].departure.at).toLocaleDateString('nb-NO', { 
                                          weekday: 'short', 
                                          day: 'numeric', 
                                          month: 'short' 
                                        })}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>Economy</span>
                                      </div>
                                      {itinerary.segments.some(seg => seg.aircraft) && (
                                        <div className="flex items-center gap-1">
                                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                          </svg>
                                          <span>{getAircraftDisplay(itinerary.segments[0].aircraft)}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-1">
                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Kan endres</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        <span>Inkl. håndbagasje</span>
                                      </div>
                                    </div>
                                  
                                    {itinerary.segments.map((segment, segIdx) => (
                                    <div key={`${offer.id}-${idx}-segment-${segIdx}`} className="flex items-center gap-6 text-lg">
                                      <div className="text-center min-w-[80px]">
                                        <div className="font-bold text-xl">{segment.departure.iataCode}</div>
                                        <div className="text-sm text-gray-500">
                                          {new Date(segment.departure.at).toLocaleTimeString('nb-NO', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                          })}
                                        </div>
                                      </div>
                                      
                                      <div className="flex-1 flex items-center justify-center">
                                        <div className="flex items-center space-x-2 text-gray-400">
                                          <div className="h-px bg-gray-300 w-12"></div>
                                          <Plane className="h-5 w-5" />
                                          <div className="h-px bg-gray-300 w-12"></div>
                                        </div>
                                      </div>
                                      
                                      <div className="text-center min-w-[80px]">
                                        <div className="font-bold text-xl">{segment.arrival.iataCode}</div>
                                        <div className="text-sm text-gray-500">
                                          {new Date(segment.arrival.at).toLocaleTimeString('nb-NO', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                          })}
                                        </div>
                                      </div>
                                      
                                      <div className="text-sm text-gray-600 min-w-[80px] text-center flex flex-col">
                                        <span className="font-medium">{segment.carrierCode} {segment.number}</span>
                                        {segment.aircraft && (
                                          <span className="text-xs text-gray-400">{getAircraftDisplay(segment.aircraft)}</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                )
                              })}
                            </div>

                            {/* Pris og booking */}
                            <div className="flex flex-col items-end space-y-3 lg:min-w-[200px]">
                              <div className="text-right">
                                <div className="text-3xl font-bold text-blue-600">
                                  {offer.price.formattedNOK}
                                </div>
                                <div className="text-sm text-gray-500">per person</div>
                              </div>
                              
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Users className="h-4 w-4" />
                                <span>{offer.numberOfBookableSeats} plasser igjen</span>
                              </div>
                              
                              <Button 
                                className="bg-blue-600 hover:bg-blue-700 px-8 py-2"
                                onClick={() => handleBookFlight(offer, 1)}
                              >
                                Book Reise
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Ingen resultater etter filtrering */}
                {hasSearched && searchResults.length > 0 && filteredAndSortedResults.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Ingen resultater med dine filtre
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Prøv å justere filtrene eller tilbakestill dem
                    </p>
                    <Button variant="outline" onClick={resetFilters}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Tilbakestill filtre
                    </Button>
                  </div>
                )}

                {/* Ingen resultater fra søk */}
                {hasSearched && searchResults.length === 0 && !isSearching && (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <Plane className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Ingen flyreiser funnet
                    </h3>
                    <p className="text-gray-600">Prøv å endre datoer eller destinasjon</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Populære ruter - kun når ikke søkt */}
          {!hasSearched && (
            <>
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Rimelige reiser akkurat nå
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {popularRoutes.map((route, idx) => (
                    <Card 
                      key={`${route.code}-${idx}`} 
                      className="hover:shadow-md transition-all duration-200 cursor-pointer group"
                      onClick={() => handleQuickSearch(route)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                                {route.from} - {route.to}
                              </h3>
                              <p className="text-sm text-gray-500">{route.month}</p>
                            </div>
                            {route.trend === 'ned' && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <TrendingDown className="h-3 w-3 mr-1" />
                                Lav pris
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-end">
                            <div>
                              <span className="text-xl font-bold text-blue-600">
                                fra {route.price} kr
                              </span>
                              <p className="text-xs text-gray-500">per person</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Flere alternativer - FINN.no stil med Amadeus tjenester */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Flere reisealternativer</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="group cursor-pointer hover:shadow-md transition-shadow border-orange-200">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                        <svg className="h-8 w-8 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 0 0 .707-1.707l-9-9a.999.999 0 0 0-1.414 0l-9 9A1 1 0 0 0 3 13zm7 7v-5h4v5h-4zm2-15.586 6 6V15l.001 5H16v-5c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v5H6v-9.586l6-6z"/>
                        </svg>
                      </div>
                      <h3 className="font-bold text-lg mb-2">🏨 Hoteller</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        <strong>Via Amadeus API</strong><br/>
                        Søk og book hoteller verden rundt med live priser og tilgjengelighet
                      </p>
                      <div className="flex items-center justify-center text-orange-600 group-hover:text-orange-700">
                        <span className="text-sm font-medium">Kommer snart</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="group cursor-pointer hover:shadow-md transition-shadow border-green-200">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                        <svg className="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                        </svg>
                      </div>
                      <h3 className="font-bold text-lg mb-2">🚗 Leiebiler</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        <strong>Via Amadeus API</strong><br/>
                        Finn og sammenlign leiebiler fra alle store utleieselskaper
                      </p>
                      <div className="flex items-center justify-center text-green-600 group-hover:text-green-700">
                        <span className="text-sm font-medium">Kommer snart</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="group cursor-pointer hover:shadow-md transition-shadow border-blue-200">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                        <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                      </div>
                      <h3 className="font-bold text-lg mb-2">🎯 Reiseinspirajon</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        <strong>Via Amadeus AI</strong><br/>
                        Oppdage nye destinasjoner basert på priser og personlige preferanser
                      </p>
                      <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-700">
                        <span className="text-sm font-medium">Kommer snart</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Amadeus info banner */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        ✈️ Powered by Amadeus - Verdens ledende reise-API
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Kulbruk.no bruker Amadeus sitt omfattende API-system som gir tilgang til:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span><strong>✈️ Flyreiser:</strong> 800+ flyselskaper inkludert SAS og Norwegian</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          <span><strong>🏨 Hoteller:</strong> 2M+ hoteller verden rundt</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span><strong>🚗 Leiebiler:</strong> Alle store utleieselskaper</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <span><strong>🤖 AI-analyse:</strong> Prisforutsigelser og reiseråd</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features section */}
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plane className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Alle flyselskaper</h3>
                    <p className="text-sm text-gray-600">
                      Sammenlign priser fra Norwegian, SAS og mange flere via Amadeus API
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Beste priser</h3>
                    <p className="text-sm text-gray-600">
                      Live priser direkte fra flyselskaper - alltid oppdatert
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Sanntidsdata</h3>
                    <p className="text-sm text-gray-600">
                      Oppdaterte avgangstider og ledige plasser hver gang
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Flight Booking Modal */}
      <FlightBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        flightOffer={selectedOffer}
        passengers={bookingPassengers}
      />
    </div>
  )
}