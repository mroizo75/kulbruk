'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plane, MapPin, Users, ArrowUpDown, RotateCcw } from 'lucide-react'
import { NORWEGIAN_AIRPORTS, POPULAR_DESTINATIONS } from '@/lib/amadeus-client'
import PriceCalendar from '@/components/price-calendar'

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

interface FlightSearchFormProps {
  onSearch: (data: FlightSearchFormData) => void
  isLoading?: boolean
}

export default function FlightSearchForm({ onSearch, isLoading = false }: FlightSearchFormProps) {
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('roundtrip')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [cabinClass, setCabinClass] = useState('ECONOMY')
  const [showCalendar, setShowCalendar] = useState(false)
  const [activeCalendar, setActiveCalendar] = useState<'departure' | 'return'>('departure')
  const [originSearch, setOriginSearch] = useState('')
  const [destinationSearch, setDestinationSearch] = useState('')
  const [showOriginDropdown, setShowOriginDropdown] = useState(false)
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FlightSearchFormData>({
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
  const allAirports = [
    ...Object.values(NORWEGIAN_AIRPORTS),
    ...Object.values(POPULAR_DESTINATIONS)
  ]

  // Filtrerte flyplasser basert på søk
  const filteredOriginAirports = useMemo(() => {
    if (!originSearch) return allAirports
    const search = originSearch.toLowerCase()
    return allAirports.filter(airport => 
      airport.name.toLowerCase().includes(search) ||
      airport.city.toLowerCase().includes(search) ||
      airport.code.toLowerCase().includes(search)
    )
  }, [originSearch, allAirports])

  const filteredDestinationAirports = useMemo(() => {
    if (!destinationSearch) return allAirports
    const search = destinationSearch.toLowerCase()
    return allAirports.filter(airport => 
      airport.name.toLowerCase().includes(search) ||
      airport.city.toLowerCase().includes(search) ||
      airport.code.toLowerCase().includes(search)
    )
  }, [destinationSearch, allAirports])

  const handleSwapAirports = () => {
    const currentOrigin = watchedOrigin
    const currentDestination = watchedDestination
    setValue('origin', currentDestination)
    setValue('destination', currentOrigin)
  }

  const onSubmit = (data: FlightSearchFormData) => {
    if (!data.origin || !data.destination) {
      return
    }

    const searchData = {
      ...data,
      adults,
      children,
      cabinClass,
      tripType
    }

    onSearch(searchData)
  }

  // Få minimum dato (i dag)
  const today = new Date().toISOString().split('T')[0]
  
  // Få minimum returdato (avreisedato + 1 dag)
  const departureDate = watch('departureDate')
  const minReturnDate = departureDate 
    ? new Date(new Date(departureDate).getTime() + 86400000).toISOString().split('T')[0]
    : today

  // Funksjoner for kalender
  const handleCalendarDateSelect = (date: string) => {
    if (activeCalendar === 'departure') {
      setValue('departureDate', date)
    } else {
      setValue('returnDate', date)
    }
    setShowCalendar(false)
  }

  const openCalendar = (type: 'departure' | 'return') => {
    setActiveCalendar(type)
    setShowCalendar(true)
  }

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('nb-NO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  // Funksjoner for flyplassvalg
  const handleOriginSelect = (airportCode: string) => {
    setValue('origin', airportCode)
    setOriginSearch('')
    setShowOriginDropdown(false)
  }

  const handleDestinationSelect = (airportCode: string) => {
    setValue('destination', airportCode)
    setDestinationSearch('')
    setShowDestinationDropdown(false)
  }

  const getSelectedAirportName = (code: string) => {
    const airport = allAirports.find(a => a.code === code)
    return airport ? `${airport.city} (${airport.code})` : code
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Trip Type Toggle - FINN.no stil */}
        <div className="flex flex-wrap gap-2 mb-6">
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Destinasjoner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            {/* Fra - med søkefunksjon */}
            <div className="space-y-2 relative">
              <Label htmlFor="origin" className="text-sm font-medium flex items-center">
                <Plane className="h-4 w-4 mr-1 text-gray-500" />
                Hvor flyr du fra?
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder={watchedOrigin ? getSelectedAirportName(watchedOrigin) : "Søk avreisested..."}
                  value={originSearch}
                  onChange={(e) => {
                    setOriginSearch(e.target.value)
                    setShowOriginDropdown(true)
                  }}
                  onFocus={() => setShowOriginDropdown(true)}
                  onBlur={() => setTimeout(() => setShowOriginDropdown(false), 200)}
                  className="h-12"
                />
                {showOriginDropdown && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                    {filteredOriginAirports.slice(0, 8).map((airport) => (
                      <div
                        key={airport.code}
                        onClick={() => handleOriginSelect(airport.code)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {airport.code}
                          </Badge>
                          <span className="text-sm">{airport.name}, {airport.city}</span>
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
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 md:block hidden">
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

            {/* Til - med søkefunksjon */}
            <div className="space-y-2 relative">
              <Label htmlFor="destination" className="text-sm font-medium flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                Hvor flyr du til?
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder={watchedDestination ? getSelectedAirportName(watchedDestination) : "Søk destinasjon..."}
                  value={destinationSearch}
                  onChange={(e) => {
                    setDestinationSearch(e.target.value)
                    setShowDestinationDropdown(true)
                  }}
                  onFocus={() => setShowDestinationDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDestinationDropdown(false), 200)}
                  className="h-12"
                />
                {showDestinationDropdown && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                    {filteredDestinationAirports.slice(0, 8).map((airport) => (
                      <div
                        key={airport.code}
                        onClick={() => handleDestinationSelect(airport.code)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {airport.code}
                          </Badge>
                          <span className="text-sm">{airport.name}, {airport.city}</span>
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
          </div>

          {/* Datoer med priskalender */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  Avreise
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openCalendar('departure')}
                  className="h-12 w-full justify-start text-left font-normal"
                >
                  {departureDate ? (
                    <span>{formatDisplayDate(departureDate)}</span>
                  ) : (
                    <span className="text-gray-500">Velg avreisedato</span>
                  )}
                  <Calendar className="ml-auto h-4 w-4" />
                </Button>
                {errors.departureDate && (
                  <p className="text-sm text-red-600">{errors.departureDate.message}</p>
                )}
              </div>

              {tripType === 'roundtrip' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                    Retur
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openCalendar('return')}
                    className="h-12 w-full justify-start text-left font-normal"
                  >
                    {watch('returnDate') ? (
                      <span>{formatDisplayDate(watch('returnDate') || '')}</span>
                    ) : (
                      <span className="text-gray-500">Velg returdato</span>
                    )}
                    <Calendar className="ml-auto h-4 w-4" />
                  </Button>
                  {errors.returnDate && (
                    <p className="text-sm text-red-600">{errors.returnDate.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Kompakt priskalender */}
            {showCalendar && (
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 z-50 bg-white border rounded-lg shadow-xl max-w-md mx-auto">
                  <div className="p-3 border-b bg-gray-50 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">
                        {activeCalendar === 'departure' ? 'Velg avreisedato' : 'Velg returdato'}
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCalendar(false)}
                        className="h-6 w-6 p-0 hover:bg-gray-200"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                  <div className="p-2">
                    <PriceCalendar
                      onDateSelect={handleCalendarDateSelect}
                      selectedDate={activeCalendar === 'departure' ? departureDate : watch('returnDate')}
                      origin={watchedOrigin}
                      destination={watchedDestination}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Skjulte input-felt for form validation */}
            <input type="hidden" {...register('departureDate', { required: 'Avreisedato er påkrevd' })} />
            {tripType === 'roundtrip' && (
              <input type="hidden" {...register('returnDate', { 
                required: tripType === 'roundtrip' ? 'Returdato er påkrevd for tur-retur' : false 
              })} />
            )}
          </div>

          {/* Passasjerer og klasse */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-1 text-gray-500" />
                Passasjerer
              </Label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Select value={adults.toString()} onValueChange={(value) => setAdults(parseInt(value))}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 voksen</SelectItem>
                      <SelectItem value="2">2 voksne</SelectItem>
                      <SelectItem value="3">3 voksne</SelectItem>
                      <SelectItem value="4">4 voksne</SelectItem>
                      <SelectItem value="5">5 voksne</SelectItem>
                      <SelectItem value="6">6 voksne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select value={children.toString()} onValueChange={(value) => setChildren(parseInt(value))}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 barn</SelectItem>
                      <SelectItem value="1">1 barn</SelectItem>
                      <SelectItem value="2">2 barn</SelectItem>
                      <SelectItem value="3">3 barn</SelectItem>
                      <SelectItem value="4">4 barn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Kabin</Label>
              <Select value={cabinClass} onValueChange={setCabinClass}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ECONOMY">Økonomi</SelectItem>
                  <SelectItem value="PREMIUM_ECONOMY">Premium økonomi</SelectItem>
                  <SelectItem value="BUSINESS">Business</SelectItem>
                  <SelectItem value="FIRST">Første klasse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Søkeknapp */}
          <Button
            type="submit"
            disabled={isLoading || !watchedOrigin || !watchedDestination}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Søker...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Plane className="h-5 w-5" />
                <span>Søk flyreiser</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}