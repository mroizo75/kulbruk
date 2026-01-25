'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Users,
  Calendar,
  Minus,
  Plus,
  Search,
  X,
  Bed
} from 'lucide-react'
import { RateHawkDestination, RateHawkHotelSearchParams } from '@/lib/types'

interface HotelSearchFormData {
  destination: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
  rooms: number
  currency?: string
}

interface HotelSearchFormProps {
  onSearch: (data: HotelSearchFormData) => void
  isLoading?: boolean
}

export default function HotelSearchForm({ onSearch, isLoading = false }: HotelSearchFormProps) {
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [rooms, setRooms] = useState(1)
  const [currency, setCurrency] = useState('NOK')

  // Destination search states
  const [destinationQuery, setDestinationQuery] = useState('')
  const [destinations, setDestinations] = useState<RateHawkDestination[]>([])
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false)
  const [isSearchingDestination, setIsSearchingDestination] = useState(false)

  // Date states
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  // Passenger dropdown
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false)

  // Refs
  const destinationRef = useRef<HTMLDivElement>(null)
  const passengerRef = useRef<HTMLDivElement>(null)

  const { register, setValue, watch, handleSubmit } = useForm<HotelSearchFormData>({
    defaultValues: {
      destination: '',
      checkIn: '',
      checkOut: '',
      adults: 2,
      children: 0,
      rooms: 1
    }
  })

  const watchedDestination = watch('destination')

  // Search destinations using API
  const searchDestinations = useCallback(async (query: string) => {
    console.log('🏨 Searching destinations:', query)

    try {
      const response = await fetch(`/api/hotels/destinations?q=${encodeURIComponent(query)}`)

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.destinations) {
          console.log('✅ Found destinations:', data.destinations.length)
          return data.destinations
        }
      }
    } catch (error) {
      console.error('❌ Destination search error:', error)
    }

    // Returnerer tomt array hvis API feiler
    return []
  }, [])

  // Debounced destination search
  useEffect(() => {
    if (!destinationQuery.trim()) {
      // Hent populære destinasjoner når query er tom
      searchDestinations('').then(results => {
        // Vis bare de første 10 populære destinasjonene
        setDestinations(results.slice(0, 10))
      })
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsSearchingDestination(true)
      const results = await searchDestinations(destinationQuery)
      setDestinations(results)
      setIsSearchingDestination(false)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [destinationQuery, searchDestinations])

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  const handleDestinationSelect = (destination: RateHawkDestination) => {
    console.log('Setting destination to:', destination.id)
    setValue('destination', destination.id, { shouldValidate: true })
    setDestinationQuery(`${destination.name}`)
    setShowDestinationDropdown(false)
  }

  const totalGuests = adults + children

  const onSubmit = async (data: HotelSearchFormData) => {
    console.log('🏨 Hotel search submitted:', data)
    console.log('🏨 Watched destination:', watch('destination'))

    if (!data.destination) {
      console.error('❌ Missing destination')
      alert('Velg en destinasjon først')
      return
    }

    if (!data.checkIn || !data.checkOut) {
      console.error('❌ Missing check-in/check-out dates')
      alert('Velg innsjekk og utsjekk datoer')
      return
    }

    const searchData = {
      ...data,
      adults,
      children,
      rooms,
      currency
    }

    console.log('✅ Calling hotel search with:', searchData)
    onSearch(searchData)
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Finn ditt drømmehotell</h2>
        <p className="text-lg text-gray-600">
          Søk og sammenlign hoteller fra hele verden med de beste prisene
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Main Search Row */}
        <div className="flex flex-col xl:flex-row xl:items-end gap-2">
          {/* Destination */}
          <div className="flex-1 min-w-0" ref={destinationRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Hvor vil du bo?
            </label>
            <div className="relative">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Søk etter by eller destinasjon..."
                  value={watchedDestination ? destinationQuery : destinationQuery}
                  onChange={(e) => {
                    const newValue = e.target.value
                    setDestinationQuery(newValue)
                    if (watchedDestination && !newValue.includes(',')) {
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
                  {destinations.map((destination) => (
                    <div
                      key={destination.id}
                      onClick={() => handleDestinationSelect(destination)}
                      className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 px-2 py-1">
                              {destination.type}
                            </Badge>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {destination.name}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {destinations.length === 0 && !isSearchingDestination && (
                    <div className="p-4 text-gray-500 text-center">Ingen destinasjoner funnet</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Check-in Date */}
          <div className="w-40 flex-shrink-0">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Innsjekk
            </label>
            <Input
              type="date"
              {...register('checkIn')}
              min={new Date().toISOString().split('T')[0]}
              className="w-full h-14 text-lg border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
            />
          </div>

          {/* Check-out Date */}
          <div className="w-40 flex-shrink-0">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Utsjekk
            </label>
            <Input
              type="date"
              {...register('checkOut')}
              min={checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0] : undefined}
              className="w-full h-14 text-lg border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
            />
          </div>

          {/* Guests */}
          <div className="w-44 flex-shrink-0" ref={passengerRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Gjester
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                className="w-full h-14 flex items-center justify-start text-left pl-4 pr-8 text-lg border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              >
                {totalGuests} {totalGuests === 1 ? 'gjest' : 'gjester'}
              </button>

              {showPassengerDropdown && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white border-2 border-gray-200 rounded-xl shadow-2xl p-6 mt-2">
                  <div className="space-y-6">
                    {/* Adults */}
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">Voksne</div>
                        <div className="text-sm text-gray-500">18 år og eldre</div>
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
                          onClick={() => setAdults(Math.min(10, adults + 1))}
                          className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-blue-500 flex items-center justify-center transition-colors"
                          disabled={adults >= 10}
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">Barn</div>
                        <div className="text-sm text-gray-500">0-17 år</div>
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

                    {/* Rooms */}
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">Rom</div>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setRooms(Math.max(1, rooms - 1))}
                          className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-blue-500 flex items-center justify-center transition-colors"
                          disabled={rooms <= 1}
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                        <span className="font-semibold text-xl min-w-[30px] text-center">{rooms}</span>
                        <button
                          type="button"
                          onClick={() => setRooms(Math.min(5, rooms + 1))}
                          className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-blue-500 flex items-center justify-center transition-colors"
                          disabled={rooms >= 5}
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Currency Selector */}
          <div className="w-24 flex-shrink-0">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Valuta
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full h-14 text-lg border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 px-3"
            >
              <option value="NOK">NOK</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="SEK">SEK</option>
              <option value="DKK">DKK</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="w-32 flex-shrink-0">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
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
