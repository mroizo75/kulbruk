'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Calendar, Plane, MapPin, Users, ArrowUpDown, Search, X } from 'lucide-react'
import { NORWEGIAN_AIRPORTS, POPULAR_DESTINATIONS } from '@/lib/amadeus-client'

interface Airport {
  code: string
  name: string
  city: string
  country: string
}

interface FlightSearchFormData {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  adults: number
  children: number
  cabinClass: string
  tripType: 'oneway' | 'roundtrip'
}

interface FlightSearchFormCompactProps {
  onSearch: (data: FlightSearchFormData) => void
  isLoading?: boolean
}

export default function FlightSearchFormCompact({ onSearch, isLoading = false }: FlightSearchFormCompactProps) {
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('roundtrip')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [cabinClass, setCabinClass] = useState('ECONOMY')

  // Search states
  const [originSearch, setOriginSearch] = useState('')
  const [destinationSearch, setDestinationSearch] = useState('')
  const [showOriginDropdown, setShowOriginDropdown] = useState(false)
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false)

  // Date states
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  const [activeCalendar, setActiveCalendar] = useState<'departure' | 'return'>('departure')

  // Refs for dropdowns
  const originRef = useRef<HTMLDivElement>(null)
  const destinationRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  const { register, handleSubmit, setValue, watch } = useForm<FlightSearchFormData>({
    defaultValues: {
      origin: '',
      destination: '',
      departureDate: '',
      returnDate: '',
      adults: 1,
      children: 0,
      cabinClass: 'ECONOMY',
      tripType: 'roundtrip'
    }
  })

  const watchedOrigin = watch('origin')
  const watchedDestination = watch('destination')

  // Alle tilgjengelige flyplasser
  const allAirports: Airport[] = useMemo(() => [
    ...Object.values(NORWEGIAN_AIRPORTS),
    ...Object.values(POPULAR_DESTINATIONS)
  ], [])

  // Filtrerte flyplasser
  const filteredOriginAirports = useMemo(() => {
    if (!originSearch) return allAirports.slice(0, 5) // Vis populære når tomt
    const search = originSearch.toLowerCase()
    return allAirports.filter(airport =>
      airport.name.toLowerCase().includes(search) ||
      airport.city.toLowerCase().includes(search) ||
      airport.code.toLowerCase().includes(search)
    ).slice(0, 8)
  }, [originSearch, allAirports])

  const filteredDestinationAirports = useMemo(() => {
    if (!destinationSearch) return allAirports.slice(0, 5) // Vis populære når tomt
    const search = destinationSearch.toLowerCase()
    return allAirports.filter(airport =>
      airport.name.toLowerCase().includes(search) ||
      airport.city.toLowerCase().includes(search) ||
      airport.code.toLowerCase().includes(search)
    ).slice(0, 8)
  }, [destinationSearch, allAirports])

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginDropdown(false)
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationDropdown(false)
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOriginSelect = (airport: Airport) => {
    setValue('origin', airport.code)
    setOriginSearch(`${airport.city} (${airport.code})`)
    setShowOriginDropdown(false)
  }

  const handleDestinationSelect = (airport: Airport) => {
    setValue('destination', airport.code)
    setDestinationSearch(`${airport.city} (${airport.code})`)
    setShowDestinationDropdown(false)
  }

  const handleSwapAirports = () => {
    const currentOrigin = watch('origin')
    const currentOriginText = originSearch
    const currentDestination = watch('destination')
    const currentDestinationText = destinationSearch

    setValue('origin', currentDestination)
    setValue('destination', currentOrigin)
    setOriginSearch(currentDestinationText)
    setDestinationSearch(currentOriginText)
  }

  const getSelectedAirportName = (code: string) => {
    const airport = allAirports.find(a => a.code === code)
    return airport ? `${airport.city} (${airport.code})` : code
  }

  const onSubmit = (data: FlightSearchFormData) => {
    if (!data.origin || !data.destination) {
      return
    }

    const searchData = {
      ...data,
      tripType,
      adults,
      children,
      cabinClass
    }

    onSearch(searchData)
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <div className="p-6">
        {/* Trip Type Toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setTripType('roundtrip')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                tripType === 'roundtrip'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tur-retur
            </button>
            <button
              type="button"
              onClick={() => setTripType('oneway')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                tripType === 'oneway'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Én vei
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Main Search Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
            {/* Origin */}
            <div className="lg:col-span-3" ref={originRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Plane className="h-4 w-4 mr-1" />
                Fra
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Hvor flyr du fra?"
                  value={watchedOrigin ? getSelectedAirportName(watchedOrigin) : originSearch}
                  onChange={(e) => {
                    setOriginSearch(e.target.value)
                    if (!watchedOrigin) setValue('origin', '')
                    setShowOriginDropdown(true)
                  }}
                  onFocus={() => setShowOriginDropdown(true)}
                  className="h-12 pl-4 pr-4"
                />
                {watchedOrigin && (
                  <button
                    type="button"
                    onClick={() => {
                      setValue('origin', '')
                      setOriginSearch('')
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {showOriginDropdown && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                    {filteredOriginAirports.map((airport) => (
                      <div
                        key={airport.code}
                        onClick={() => handleOriginSelect(airport)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {airport.code}
                            </Badge>
                            <span className="text-sm font-medium">{airport.city}</span>
                          </div>
                          <span className="text-xs text-gray-500">{airport.name}</span>
                        </div>
                      </div>
                    ))}
                    {filteredOriginAirports.length === 0 && (
                      <div className="p-3 text-gray-500 text-sm">Ingen flyplasser funnet</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Swap Button */}
            <div className="lg:col-span-1 flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSwapAirports}
                className="rounded-full w-10 h-10 p-0 bg-white border-2 shadow-sm hover:shadow-md"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Destination */}
            <div className="lg:col-span-3" ref={destinationRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                Til
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Hvor flyr du til?"
                  value={watchedDestination ? getSelectedAirportName(watchedDestination) : destinationSearch}
                  onChange={(e) => {
                    setDestinationSearch(e.target.value)
                    if (!watchedDestination) setValue('destination', '')
                    setShowDestinationDropdown(true)
                  }}
                  onFocus={() => setShowDestinationDropdown(true)}
                  className="h-12 pl-4 pr-4"
                />
                {watchedDestination && (
                  <button
                    type="button"
                    onClick={() => {
                      setValue('destination', '')
                      setDestinationSearch('')
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {showDestinationDropdown && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                    {filteredDestinationAirports.map((airport) => (
                      <div
                        key={airport.code}
                        onClick={() => handleDestinationSelect(airport)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {airport.code}
                            </Badge>
                            <span className="text-sm font-medium">{airport.city}</span>
                          </div>
                          <span className="text-xs text-gray-500">{airport.name}</span>
                        </div>
                      </div>
                    ))}
                    {filteredDestinationAirports.length === 0 && (
                      <div className="p-3 text-gray-500 text-sm">Ingen flyplasser funnet</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Departure Date */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avreise
              </label>
              <Input
                type="date"
                {...register('departureDate')}
                min={new Date().toISOString().split('T')[0]}
                className="h-12"
              />
            </div>

            {/* Return Date */}
            {tripType === 'roundtrip' && (
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retur
                </label>
                <Input
                  type="date"
                  {...register('returnDate')}
                  min={departureDate ? new Date(new Date(departureDate).getTime() + 86400000).toISOString().split('T')[0] : undefined}
                  className="h-12"
                />
              </div>
            )}

            {/* Search Button */}
            <div className="lg:col-span-1">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Søker...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Search className="h-4 w-4 mr-2" />
                    Søk
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Additional Options Row */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Passasjerer:</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setAdults(Math.max(1, adults - 1))}
                  className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                >
                  -
                </button>
                <span className="text-sm font-medium min-w-[20px] text-center">{adults}</span>
                <button
                  type="button"
                  onClick={() => setAdults(Math.min(9, adults + 1))}
                  className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                >
                  +
                </button>
                <span className="text-sm text-gray-600 ml-2">voksne</span>
              </div>
              {children > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                  >
                    -
                  </button>
                  <span className="text-sm font-medium min-w-[20px] text-center">{children}</span>
                  <button
                    type="button"
                    onClick={() => setChildren(Math.min(9, children + 1))}
                    className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-600">barn</span>
                </div>
              )}
              {children === 0 && (
                <button
                  type="button"
                  onClick={() => setChildren(1)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Legg til barn
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Klasse:</span>
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="ECONOMY">Økonomi</option>
                <option value="PREMIUM_ECONOMY">Premium økonomi</option>
                <option value="BUSINESS">Business</option>
                <option value="FIRST">Første klasse</option>
              </select>
            </div>
          </div>
        </form>
      </div>
    </Card>
  )
}
