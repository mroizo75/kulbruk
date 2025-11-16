'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plane,
  MapPin,
  Users,
  ArrowUpDown,
  Search,
  X,
  Calendar,
  Minus,
  Plus,
  Clock
} from 'lucide-react'
import { NORWEGIAN_AIRPORTS, POPULAR_DESTINATIONS } from '@/lib/amadeus-client'

interface Airport {
  id: string
  iataCode?: string
  code?: string
  name: string
  city?: string
  cityName?: string
  country?: string
  countryName?: string
  address?: {
    cityName?: string
    countryName?: string
  }
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

interface FlightSearchFormSkyscannerProps {
  onSearch: (data: FlightSearchFormData) => void
  isLoading?: boolean
}

export default function FlightSearchFormSkyscanner({ onSearch, isLoading = false }: FlightSearchFormSkyscannerProps) {
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('roundtrip')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [cabinClass, setCabinClass] = useState('ECONOMY')

  // Airport search states
  const [originQuery, setOriginQuery] = useState('')
  const [destinationQuery, setDestinationQuery] = useState('')
  const [originAirports, setOriginAirports] = useState<Airport[]>([])
  const [destinationAirports, setDestinationAirports] = useState<Airport[]>([])
  const [showOriginDropdown, setShowOriginDropdown] = useState(false)
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false)
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false)
  const [isSearchingDestination, setIsSearchingDestination] = useState(false)

  // Date states
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')

  // Passenger dropdown
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false)

  // Refs
  const originRef = useRef<HTMLDivElement>(null)
  const destinationRef = useRef<HTMLDivElement>(null)
  const passengerRef = useRef<HTMLDivElement>(null)

  const { register, setValue, watch, handleSubmit } = useForm<FlightSearchFormData>({
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

  // Static fallback airports
  const staticAirports = useMemo(() => [
    ...Object.values(NORWEGIAN_AIRPORTS),
    ...Object.values(POPULAR_DESTINATIONS)
  ], [])

  // Search airports using Amadeus API
  const searchAirports = useCallback(async (query: string) => {
    if (!query.trim()) return []

    console.log('🔍 Searching for airports:', query)

    try {
      const response = await fetch(`/api/flights/airports?search=${encodeURIComponent(query)}`)
      const result = await response.json()

      console.log('📡 API Response:', result)

      if (result.success && result.airports) {
        let airports = result.airports.map((airport: any) => ({
          id: airport.iataCode || airport.code,
          iataCode: airport.iataCode,
          code: airport.code || airport.iataCode,
          name: airport.name,
          city: airport.city,
          cityName: airport.city,
          country: airport.country,
          countryName: airport.country,
          address: {
            cityName: airport.city,
            countryName: airport.country
          }
        }))

        console.log('✈️ Mapped airports:', airports.slice(0, 3))

        // Smart sortering: starter med søketerm > inneholder søketerm > eksakt match
        const queryLower = query.toLowerCase()
        airports.sort((a: Airport, b: Airport) => {
          const aCity = (a.cityName || a.city || a.name || '').toLowerCase()
          const bCity = (b.cityName || b.city || b.name || '').toLowerCase()
          const aName = a.name.toLowerCase()
          const bName = b.name.toLowerCase()
          const aCode = (a.iataCode || a.code || '').toLowerCase()
          const bCode = (b.iataCode || b.code || '').toLowerCase()

          // Prioritet 1: Starter med søketerm
          const aStartsWith = aCity.startsWith(queryLower) || aName.startsWith(queryLower) || aCode.startsWith(queryLower)
          const bStartsWith = bCity.startsWith(queryLower) || bName.startsWith(queryLower) || bCode.startsWith(queryLower)

          if (aStartsWith && !bStartsWith) return -1
          if (!aStartsWith && bStartsWith) return 1

          // Prioritet 2: Inneholder søketerm
          const aContains = aCity.includes(queryLower) || aName.includes(queryLower) || aCode.includes(queryLower)
          const bContains = bCity.includes(queryLower) || bName.includes(queryLower) || bCode.includes(queryLower)

          if (aContains && !bContains) return -1
          if (!aContains && bContains) return 1

          // Prioritet 3: Eksakt match
          const aExact = aCode === queryLower || aCity === queryLower || aName === queryLower
          const bExact = bCode === queryLower || bCity === queryLower || bName === queryLower

          if (aExact && !bExact) return -1
          if (!aExact && bExact) return 1

          return 0
        })

        // Begrens til 6 resultater
        const finalResults = airports.slice(0, 6)
        console.log('✅ Final sorted airports:', finalResults)
        return finalResults
      }
    } catch (error) {
      console.error('Airport search error:', error)
    }

    // Fallback to static data if API fails - smart sortering
    console.log('🔄 Using fallback static data')
    const queryLower = query.toLowerCase()
    let filtered: Airport[] = staticAirports.filter((airport: Airport) =>
      airport.name.toLowerCase().includes(queryLower) ||
      airport.city?.toLowerCase().includes(queryLower) ||
      airport.code?.toLowerCase().includes(queryLower)
    )

    console.log('📊 Static airports before sorting:', filtered.length)

    // Smart sortering: samme logikk som API
    filtered.sort((a: Airport, b: Airport) => {
      const aCity = (a.city || a.cityName || a.name || '').toLowerCase()
      const bCity = (b.city || b.cityName || b.name || '').toLowerCase()
      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()
      const aCode = (a.code || a.iataCode || '').toLowerCase()
      const bCode = (b.code || b.iataCode || '').toLowerCase()

      // Prioritet 1: Starter med søketerm
      const aStartsWith = aCity.startsWith(queryLower) || aName.startsWith(queryLower) || aCode.startsWith(queryLower)
      const bStartsWith = bCity.startsWith(queryLower) || bName.startsWith(queryLower) || bCode.startsWith(queryLower)

      if (aStartsWith && !bStartsWith) return -1
      if (!aStartsWith && bStartsWith) return 1

      // Prioritet 2: Inneholder søketerm
      const aContains = aCity.includes(queryLower) || aName.includes(queryLower) || aCode.includes(queryLower)
      const bContains = bCity.includes(queryLower) || bName.includes(queryLower) || bCode.includes(queryLower)

      if (aContains && !bContains) return -1
      if (!aContains && bContains) return 1

      // Prioritet 3: Eksakt match
      const aExact = aCode === queryLower || aCity === queryLower || aName === queryLower
      const bExact = bCode === queryLower || bCity === queryLower || bName === queryLower

      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1

      return 0
    })

    const finalFallback = filtered.slice(0, 6)
    console.log('✅ Fallback results:', finalFallback)
    return finalFallback
  }, [staticAirports])

  // Debounced origin search
  useEffect(() => {
    if (!originQuery.trim()) {
      setOriginAirports(staticAirports.slice(0, 5))
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsSearchingOrigin(true)
      const results = await searchAirports(originQuery)
      setOriginAirports(results)
      setIsSearchingOrigin(false)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [originQuery, searchAirports, staticAirports])

  // Debounced destination search
  useEffect(() => {
    if (!destinationQuery.trim()) {
      setDestinationAirports(staticAirports.slice(0, 5))
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsSearchingDestination(true)
      const results = await searchAirports(destinationQuery)
      setDestinationAirports(results)
      setIsSearchingDestination(false)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [destinationQuery, searchAirports, staticAirports])

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginDropdown(false)
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationDropdown(false)
      }
      if (passengerRef.current && !passengerRef.current.contains(event.target as Node)) {
        setShowPassengerDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOriginSelect = (airport: Airport) => {
    const code = airport.iataCode || airport.code
    console.log('Setting origin to:', code, 'from airport:', airport)
    setValue('origin', code, { shouldValidate: true })
    setOriginQuery(`${airport.cityName || airport.city || airport.name} (${code})`)
    setShowOriginDropdown(false)
  }

  const handleDestinationSelect = (airport: Airport) => {
    const code = airport.iataCode || airport.code
    console.log('Setting destination to:', code, 'from airport:', airport)
    setValue('destination', code, { shouldValidate: true })
    setDestinationQuery(`${airport.cityName || airport.city || airport.name} (${code})`)
    setShowDestinationDropdown(false)
  }

  const handleSwapAirports = () => {
    const currentOrigin = watch('origin')
    const currentOriginText = originQuery
    const currentDestination = watch('destination')
    const currentDestinationText = destinationQuery

    setValue('origin', currentDestination)
    setValue('destination', currentOrigin)
    setOriginQuery(currentDestinationText)
    setDestinationQuery(currentOriginText)
  }

  const getSelectedAirportName = (code: string) => {
    const airport = staticAirports.find((a: Airport) => (a.code || a.iataCode) === code)
    if (airport) {
      const displayCode = airport.code || airport.iataCode
      const displayCity = airport.city || airport.cityName || airport.name
      return `${displayCity} (${displayCode})`
    }
    return code
  }

  const totalPassengers = adults + children

  const onSubmit = (data: FlightSearchFormData) => {
    console.log('🛫 Form submitted with data:', data)
    console.log('🛫 Watched values:', { origin: watch('origin'), destination: watch('destination'), departureDate: watch('departureDate') })

    if (!data.origin || !data.destination) {
      console.error('❌ Missing required fields:', { origin: data.origin, destination: data.destination })
      return
    }

    if (!data.departureDate) {
      console.error('❌ Missing departure date')
      return
    }

    const searchData = {
      ...data,
      tripType,
      adults,
      children,
      cabinClass
    }

    console.log('✅ Calling onSearch with:', searchData)
    onSearch(searchData)
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-8">
      {/* Trip Type Toggle */}
      <div className="flex justify-center mb-4">
        <div className="bg-gray-100 rounded-full p-1 flex shadow-sm">
          <button
            type="button"
            onClick={() => setTripType('roundtrip')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              tripType === 'roundtrip'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tur-retur
          </button>
          <button
            type="button"
            onClick={() => setTripType('oneway')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              tripType === 'oneway'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Én vei
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Main Search Row */}
              <div className="flex flex-col xl:flex-row xl:items-end gap-2">
                {/* Origin */}
                <div className="flex-1 min-w-0" ref={originRef}>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Plane className="h-5 w-5 mr-2 text-blue-600" />
                    Hvor flyr du fra?
                  </label>
                  <div className="relative">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Søk etter by eller flyplass..."
                        value={watchedOrigin ? getSelectedAirportName(watchedOrigin) : originQuery}
                        onChange={(e) => {
                          const newValue = e.target.value
                          setOriginQuery(newValue)
                          // Clear form value if user is typing (not selecting from dropdown)
                          if (watchedOrigin && !newValue.includes('(')) {
                            setValue('origin', '')
                          }
                          setShowOriginDropdown(true)
                        }}
                        onFocus={() => setShowOriginDropdown(true)}
                        className="h-14 pl-4 pr-10 text-lg border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                      />
                      {watchedOrigin && (
                        <button
                          type="button"
                          onClick={() => {
                            setValue('origin', '')
                            setOriginQuery('')
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                      {isSearchingOrigin && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    {showOriginDropdown && (
                      <div className="absolute top-full left-0 right-0 z-50 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto mt-2">
                        {originAirports.map((airport) => (
                          <div
                            key={airport.id || airport.iataCode}
                            onClick={() => handleOriginSelect(airport)}
                            className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 px-2 py-1">
                                    {airport.iataCode}
                                  </Badge>
                                  <div>
                                    <div className="font-semibold text-gray-900">
                                      {airport.cityName || airport.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {airport.name}{airport.cityName && airport.name !== airport.cityName ? `, ${airport.cityName}` : ''}
                                      {airport.countryName && `, ${airport.countryName}`}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {originAirports.length === 0 && !isSearchingOrigin && (
                          <div className="p-4 text-gray-500 text-center">Ingen flyplasser funnet</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex-shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSwapAirports}
                    className="rounded-full w-10 h-10 p-0 bg-white border-2 shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all duration-200"
                  >
                    <ArrowUpDown className="h-4 w-4 text-blue-600" />
                  </Button>
                </div>

                {/* Destination */}
                <div className="flex-1 min-w-0" ref={destinationRef}>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    Hvor flyr du til?
                  </label>
                  <div className="relative">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Søk etter by eller flyplass..."
                        value={watchedDestination ? getSelectedAirportName(watchedDestination) : destinationQuery}
                        onChange={(e) => {
                          const newValue = e.target.value
                          setDestinationQuery(newValue)
                          // Clear form value if user is typing (not selecting from dropdown)
                          if (watchedDestination && !newValue.includes('(')) {
                            setValue('destination', '')
                          }
                          setShowDestinationDropdown(true)
                        }}
                        onFocus={() => setShowDestinationDropdown(true)}
                        className="h-14 pl-4 pr-10 text-lg border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                      />
                      {watchedDestination && (
                        <button
                          type="button"
                          onClick={() => {
                            setValue('destination', '')
                            setDestinationQuery('')
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                      {isSearchingDestination && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    {showDestinationDropdown && (
                      <div className="absolute top-full left-0 right-0 z-50 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto mt-2">
                        {destinationAirports.map((airport) => (
                          <div
                            key={airport.id || airport.iataCode}
                            onClick={() => handleDestinationSelect(airport)}
                            className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 px-2 py-1">
                                    {airport.iataCode}
                                  </Badge>
                                  <div>
                                    <div className="font-semibold text-gray-900">
                                      {airport.cityName || airport.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {airport.name}{airport.cityName && airport.name !== airport.cityName ? `, ${airport.cityName}` : ''}
                                      {airport.countryName && `, ${airport.countryName}`}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {destinationAirports.length === 0 && !isSearchingDestination && (
                          <div className="p-4 text-gray-500 text-center">Ingen flyplasser funnet</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Departure Date */}
                <div className="w-40 flex-shrink-0">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    Avreise
                  </label>
                  <Input
                    type="date"
                    {...register('departureDate')}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full h-14 text-lg border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>

                {/* Return Date */}
                {tripType === 'roundtrip' && (
                  <div className="w-40 flex-shrink-0">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Retur
                    </label>
                    <Input
                      type="date"
                      {...register('returnDate')}
                      min={departureDate ? new Date(new Date(departureDate).getTime() + 86400000).toISOString().split('T')[0] : undefined}
                      className="h-14 text-lg border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>
                )}

                {/* Passengers */}
                <div className="w-44 flex-shrink-0" ref={passengerRef}>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Passasjerer
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                      className="w-full h-14 flex items-center justify-start text-left pl-4 pr-8 text-lg border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    >
                      {totalPassengers} {totalPassengers === 1 ? 'passasjer' : 'passasjerer'}
                    </button>

                    {showPassengerDropdown && (
                      <div className="absolute top-full left-0 right-0 z-50 bg-white border-2 border-gray-200 rounded-xl shadow-2xl p-6 mt-2">
                        <div className="space-y-6">
                          {/* Adults */}
                          <div className="space-y-3">
                            <div className="text-center">
                              <div className="font-semibold text-gray-900">Voksne</div>
                              <div className="text-sm text-gray-500">12 år og eldre</div>
                            </div>
                            <div className="flex items-center justify-center space-x-3">
                              <button
                                type="button"
                                onClick={() => setAdults(Math.max(1, adults - 1))}
                                className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-blue-500 flex items-center justify-center transition-colors"
                                disabled={adults <= 1}
                              >
                                <Minus className="h-5 w-5" />
                              </button>
                              <span className="font-semibold text-xl min-w-[30px] text-center">{adults}</span>
                              <button
                                type="button"
                                onClick={() => setAdults(Math.min(9, adults + 1))}
                                className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-blue-500 flex items-center justify-center transition-colors"
                                disabled={adults >= 9}
                              >
                                <Plus className="h-5 w-5" />
                              </button>
                            </div>
                          </div>

                          {/* Children */}
                          <div className="space-y-3">
                            <div className="text-center">
                              <div className="font-semibold text-gray-900">Barn</div>
                              <div className="text-sm text-gray-500">2-11 år</div>
                            </div>
                            <div className="flex items-center justify-center space-x-3">
                              <button
                                type="button"
                                onClick={() => setChildren(Math.max(0, children - 1))}
                                className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-blue-500 flex items-center justify-center transition-colors"
                                disabled={children <= 0}
                              >
                                <Minus className="h-5 w-5" />
                              </button>
                              <span className="font-semibold text-xl min-w-[30px] text-center">{children}</span>
                              <button
                                type="button"
                                onClick={() => setChildren(Math.min(8, children + 1))}
                                className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-blue-500 flex items-center justify-center transition-colors"
                                disabled={children >= 8}
                              >
                                <Plus className="h-5 w-5" />
                              </button>
                            </div>
                          </div>

                          {/* Cabin Class */}
                          <div className="pt-4 border-t">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Kabin</label>
                            <select
                              value={cabinClass}
                              onChange={(e) => setCabinClass(e.target.value)}
                              className="w-full h-12 border-2 border-gray-200 rounded-lg px-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                            >
                              <option value="ECONOMY">Økonomi</option>
                              <option value="PREMIUM_ECONOMY">Premium økonomi</option>
                              <option value="BUSINESS">Business</option>
                              <option value="FIRST">Første klasse</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Search Button */}
                <div className="w-32 flex-shrink-0">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                        Søker...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Search className="h-6 w-6 mr-3" />
                        Søk
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </form>
        </div>


  )
}
