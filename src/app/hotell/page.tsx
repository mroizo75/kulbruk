'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import HotelSearchForm from '@/components/hotel-search-form'
import HotelResults from '@/components/hotel-results'
import HotelDetailsDialog from '@/components/hotel-details-dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Bed, Star, MapPin, Wifi, Car, Utensils } from 'lucide-react'
import { RateHawkHotel } from '@/lib/types'

interface PopularDestination {
  id: string
  name: string
  country: string
  hotels: string
  image: string
}

interface RoomConfig {
  adults: number
  childAges: number[]
}

interface HotelSearchFormData {
  destination: string
  destinationLabel?: string
  destinationType?: string
  checkIn: string
  checkOut: string
  rooms: RoomConfig[]
  residency: string
  currency?: string
}

const PLACEHOLDER_SVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450"%3E%3Crect fill="%23e5e7eb" width="800" height="450"/%3E%3Ctext fill="%239ca3af" font-family="system-ui" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E' + encodeURIComponent('Laster...') + '%3C/text%3E%3C/svg%3E'

interface DebugEntry {
  ts: string
  step: string
  data: unknown
}

export default function HotellPage() {
  const [searchResults, setSearchResults] = useState<RateHawkHotel[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchParams, setSearchParams] = useState<HotelSearchFormData | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [popularDestinations, setPopularDestinations] = useState<PopularDestination[]>([])
  const [debugLog, setDebugLog] = useState<DebugEntry[]>([])
  const [showDebug, setShowDebug] = useState(true)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Hotel chunk: direkte dialog når spesifikt hotell velges fra autocomplete
  const [directHotelId, setDirectHotelId] = useState<string | null>(null)
  const [directDialogOpen, setDirectDialogOpen] = useState(false)
  const [directSearchParams, setDirectSearchParams] = useState<HotelSearchFormData | null>(null)

  const dbg = (step: string, data: unknown = {}) => {
    const entry: DebugEntry = { ts: new Date().toISOString().split('T')[1].slice(0, 12), step, data }
    console.log(`[DBG] ${entry.ts} ${step}`, data)
    setDebugLog(prev => [...prev.slice(-49), entry])
  }

  const handleHotelSearch = async (data: HotelSearchFormData) => {
    dbg('1. onSearch kalt', { destination: data.destination, destinationType: data.destinationType, checkIn: data.checkIn, checkOut: data.checkOut, rooms: data.rooms })

    // Hotel chunk: spesifikt hotell valgt → gå direkte til HP uten SERP
    if (data.destinationType === 'hotel' && data.destination) {
      dbg('2. Hotel chunk: direkte til HP', { hotelId: data.destination })
      setDirectHotelId(data.destination)
      setDirectSearchParams(data)
      setDirectDialogOpen(true)
      return
    }

    dbg('2. Starter vanlig søk')
    setIsSearching(true)
    setSearchParams(data)
    setSearchError(null)
    setSearchResults(null)

    const totalAdults = data.rooms.reduce((s, r) => s + r.adults, 0)
    const allChildAges = data.rooms.flatMap(r => r.childAges)
    const requestBody = {
      destination: data.destination,
      destinationType: data.destinationType || '',
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      adults: totalAdults,
      children: allChildAges,
      rooms: data.rooms.length,
      roomConfigs: data.rooms,
      residency: data.residency,
      currency: data.currency || 'NOK',
    }
    dbg('3. Sender POST /api/hotels/search', requestBody)

    try {
      const response = await fetch('/api/hotels/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      dbg('4. HTTP-svar mottatt', { status: response.status, ok: response.ok })
      const result = await response.json()
      dbg('5. JSON parset', { success: result.success, hotelsCount: result.hotels?.length ?? 'N/A', error: result.error ?? null })

      if (result.success && result.hotels) {
        setSearchResults(result.hotels)
        dbg('6. ✅ setSearchResults kalt', { count: result.hotels.length })
        if (result._fallback) {
          setSearchError(`⚠️ ${result._fallback_reason || 'Viser test hotel som fallback'}`)
        } else {
          setSearchError(null)
        }
      } else {
        dbg('6. ❌ Søk feilet', { error: result.error, technicalError: result.technicalError })
        setSearchError(result.error || 'Søket feilet')
        setSearchResults([])
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      dbg('5. ❌ fetch-exception', { message: msg })
      setSearchError(msg || 'En uventet feil oppstod')
      setSearchResults([])
    } finally {
      setIsSearching(false)
      dbg('7. isSearching = false')
    }
  }

  useEffect(() => {
    if (!isSearching && (searchResults !== null || searchError) && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [isSearching, searchResults, searchError])

  useEffect(() => {
    fetch('/api/hotels/popular-destinations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.destinations) {
          setPopularDestinations(data.destinations)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Finn ditt perfekte hotell
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Søk blant millioner av hoteller og finn de beste tilbudene
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <Suspense fallback={<div className="text-center py-12">Laster søkeskjema...</div>}>
          <HotelSearchForm onSearch={handleHotelSearch} isLoading={isSearching} />
        </Suspense>
      </div>

      {/* Hotel chunk: direkte detaljdialog uten SERP */}
      {directHotelId && directSearchParams && (
        <HotelDetailsDialog
          hotelId={directHotelId}
          open={directDialogOpen}
          onOpenChange={setDirectDialogOpen}
          searchParams={{
            checkIn: directSearchParams.checkIn,
            checkOut: directSearchParams.checkOut,
            adults: directSearchParams.rooms.reduce((s, r) => s + r.adults, 0),
            children: directSearchParams.rooms.flatMap(r => r.childAges),
            rooms: directSearchParams.rooms.length,
            roomConfigs: directSearchParams.rooms,
            residency: directSearchParams.residency,
          }}
        />
      )}

      {/* Search Results Section */}
      {(searchResults !== null || searchError) && (
        <div ref={resultsRef} className="container mx-auto px-4 py-8">
          {searchError && (
            <div className={`border rounded-lg p-4 mb-6 ${
              searchError.includes('⚠️') || searchError.includes('fallback')
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {searchError.includes('⚠️') || searchError.includes('fallback') ? (
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98 1.742 2.98H4.42c1.955 0 2.992-1.646 1.742-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    searchError.includes('⚠️') || searchError.includes('fallback')
                      ? 'text-yellow-800'
                      : 'text-red-800'
                  }`}>
                    {searchError.includes('⚠️') || searchError.includes('fallback') ? 'Varsel' : 'Søket feilet'}
                  </h3>
                  <div className={`mt-2 text-sm ${
                    searchError.includes('⚠️') || searchError.includes('fallback')
                      ? 'text-yellow-700'
                      : 'text-red-700'
                  }`}>
                    <p>{searchError}</p>
                    <p className="mt-2 text-xs">
                      💡 Tips: Prøv en annen destinasjon eller endre datoene.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Suspense fallback={<div className="text-center py-12">Laster resultater...</div>}>
            <HotelResults
              hotels={searchResults || []}
              searchParams={searchParams}
              isLoading={isSearching}
              destinationName={searchParams?.destinationLabel}
            />
          </Suspense>

        </div>
      )}

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <Bed className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Beste priser</h3>
              <p className="text-gray-600">
                Få tilgang til de beste hotellprisene fra ledende hotelleverandører
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <Star className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Kvalitetssikret</h3>
              <p className="text-gray-600">
                Alle hoteller er kvalitetssikret og har gode anmeldelser
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <MapPin className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Verdensomspennende</h3>
              <p className="text-gray-600">
                Hoteller i over 190 land og territorier over hele verden
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Populære destinasjoner</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {(popularDestinations.length > 0 ? popularDestinations : [
              { id: '2563', name: 'Oslo', country: 'Norge', hotels: '500+ hoteller', image: PLACEHOLDER_SVG },
              { id: '1953', name: 'København', country: 'Danmark', hotels: '400+ hoteller', image: PLACEHOLDER_SVG },
              { id: '1775', name: 'Paris', country: 'Frankrike', hotels: '3000+ hoteller', image: PLACEHOLDER_SVG },
              { id: '1869', name: 'London', country: 'Storbritannia', hotels: '2000+ hoteller', image: PLACEHOLDER_SVG },
            ]).map((destination) => {
              const tomorrow = new Date()
              tomorrow.setDate(tomorrow.getDate() + 1)
              const dayAfter = new Date(tomorrow)
              dayAfter.setDate(dayAfter.getDate() + 1)
              const defaultSearch = {
                destination: destination.id,
                destinationLabel: `${destination.name}, ${destination.country}`,
                destinationType: 'city',
                checkIn: tomorrow.toISOString().split('T')[0],
                checkOut: dayAfter.toISOString().split('T')[0],
                rooms: [{ adults: 2, childAges: [] }],
                residency: 'no',
                currency: 'NOK',
              }
              return (
                <Card
                  key={destination.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleHotelSearch(defaultSearch)}
                >
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{destination.name}</h3>
                    <p className="text-gray-500 text-sm mb-1">{destination.country}</p>
                    <p className="text-gray-600 text-sm">{destination.hotels}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* DEBUG-PANEL – kun development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-[9999] w-[420px] max-h-[50vh] flex flex-col bg-gray-950 text-green-400 font-mono text-[11px] rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          <div
            className="flex items-center justify-between px-3 py-2 bg-gray-900 cursor-pointer select-none"
            onClick={() => setShowDebug(v => !v)}
          >
            <span className="font-bold text-green-300">🐛 Debug-logg ({debugLog.length} oppføringer)</span>
            <span className="text-gray-400">{showDebug ? '▼ skjul' : '▲ vis'}</span>
          </div>
          {showDebug && (
            <div className="overflow-y-auto p-3 space-y-1 flex-1">
              {debugLog.length === 0 && <div className="text-gray-500 italic">Klikk Søk for å se logg...</div>}
              {debugLog.map((e, i) => (
                <div key={i} className="border-b border-gray-800 pb-1">
                  <span className="text-gray-500">{e.ts}</span>{' '}
                  <span className={e.step.includes('❌') ? 'text-red-400' : e.step.includes('✅') ? 'text-green-300' : 'text-yellow-300'}>
                    {e.step}
                  </span>
                  <pre className="text-gray-400 text-[10px] whitespace-pre-wrap break-all mt-0.5">
                    {JSON.stringify(e.data, null, 1)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Amenities Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Hva kan du forvente</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Wifi, name: 'Gratis WiFi', desc: 'Høyhastighets internett' },
              { icon: Car, name: 'Parkering', desc: 'Praktisk parkering' },
              { icon: Utensils, name: 'Restaurant', desc: 'Lokal og internasjonal mat' },
              { icon: Bed, name: 'Komfort', desc: 'Kvalitetssenger og luksus' }
            ].map((amenity) => (
              <div key={amenity.name} className="text-center">
                <amenity.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">{amenity.name}</h3>
                <p className="text-gray-600 text-sm">{amenity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
