'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RotateCcw, Filter, Clock, Plane, Package, MapPin } from 'lucide-react'
import { getAirlineInfo } from '@/lib/airline-logos'

export interface FlightFilters {
  // Sortering
  sortBy: 'price' | 'duration' | 'departure' | 'arrival' | 'stops'
  sortOrder: 'asc' | 'desc'
  
  // Pris
  maxPrice: number
  minPrice: number
  
  // Mellomlanding
  directFlights: boolean
  maxStops: number
  
  // Tider
  departureTimeRange: [number, number] // Timer på døgnet (0-23)
  arrivalTimeRange: [number, number]
  
  // Reisetid
  maxTravelTime: number // Timer
  
  // Flyselskaper
  airlines: string[]
  
  // Flyplasser (mellomlanding)
  excludeAirports: string[]
  
  // Bagasje
  baggageIncluded: boolean
  
  // Kabin klasse
  cabinClasses: string[]
}

interface FlightFiltersProps {
  filters: FlightFilters
  onFiltersChange: (filters: FlightFilters) => void
  availableAirlines: string[]
  priceRange: { min: number; max: number }
  onResetFilters: () => void
}

const timeOptions = [
  { value: 0, label: '00:00' },
  { value: 6, label: '06:00' },
  { value: 12, label: '12:00' },
  { value: 18, label: '18:00' },
  { value: 23, label: '23:00' }
]

const airlineNames: Record<string, string> = {
  'SAS': 'SAS Scandinavian Airlines',
  'DY': 'Norwegian Air',
  'SK': 'SAS',
  'WF': 'Widerøe',
  'LH': 'Lufthansa',
  'KL': 'KLM',
  'AF': 'Air France',
  'BA': 'British Airways',
  'TK': 'Turkish Airlines',
  'EK': 'Emirates',
  'QR': 'Qatar Airways'
}

export default function FlightFilters({ 
  filters, 
  onFiltersChange, 
  availableAirlines, 
  priceRange,
  onResetFilters 
}: FlightFiltersProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const updateFilter = (key: keyof FlightFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleAirline = (airline: string) => {
    const newAirlines = filters.airlines.includes(airline)
      ? filters.airlines.filter(a => a !== airline)
      : [...filters.airlines, airline]
    
    updateFilter('airlines', newAirlines)
  }

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`
  }

  const activeFiltersCount = [
    filters.directFlights,
    filters.baggageIncluded,
    filters.maxPrice < priceRange.max,
    filters.minPrice > priceRange.min,
    filters.airlines.length > 0,
    filters.maxStops < 3,
    filters.maxTravelTime < 24,
    filters.departureTimeRange[0] > 0 || filters.departureTimeRange[1] < 23,
    filters.arrivalTimeRange[0] > 0 || filters.arrivalTimeRange[1] < 23
  ].filter(Boolean).length

  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto h-full">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Filtrer & sorter</h2>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onResetFilters}
            className="text-blue-600 hover:text-blue-800"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Tilbakestill
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Sortering */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sorter etter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select 
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split('-') as ['price' | 'duration' | 'departure' | 'arrival' | 'stops', 'asc' | 'desc']
                updateFilter('sortBy', sortBy)
                updateFilter('sortOrder', sortOrder)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-asc">Pris (lavest først)</SelectItem>
                <SelectItem value="price-desc">Pris (høyest først)</SelectItem>
                <SelectItem value="duration-asc">Reisetid (kortest)</SelectItem>
                <SelectItem value="duration-desc">Reisetid (lengst)</SelectItem>
                <SelectItem value="departure-asc">Avreise (tidligst)</SelectItem>
                <SelectItem value="departure-desc">Avreise (senest)</SelectItem>
                <SelectItem value="arrival-asc">Ankomst (tidligst)</SelectItem>
                <SelectItem value="arrival-desc">Ankomst (senest)</SelectItem>
                <SelectItem value="stops-asc">Færrest mellomlanding</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Pris */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Pris per person
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{filters.minPrice} kr</span>
                <span>{filters.maxPrice} kr</span>
              </div>
              <div className="px-2">
                <Slider
                  value={[filters.minPrice, filters.maxPrice]}
                  onValueChange={([min, max]) => {
                    updateFilter('minPrice', min)
                    updateFilter('maxPrice', max)
                  }}
                  max={priceRange.max}
                  min={priceRange.min}
                  step={100}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mellomlanding */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Plane className="h-4 w-4 mr-2" />
              Mellomlanding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="direct-flights"
                checked={filters.directFlights}
                onCheckedChange={(checked) => updateFilter('directFlights', checked)}
              />
              <Label htmlFor="direct-flights" className="text-sm">
                Kun direktefly
              </Label>
            </div>
            
            {!filters.directFlights && (
              <div className="space-y-2">
                <Label className="text-sm">Maks antall mellomlanding</Label>
                <Select 
                  value={filters.maxStops.toString()}
                  onValueChange={(value) => updateFilter('maxStops', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Direktefly</SelectItem>
                    <SelectItem value="1">Maksimalt 1 stopp</SelectItem>
                    <SelectItem value="2">Maksimalt 2 stopp</SelectItem>
                    <SelectItem value="3">Maksimalt 3 stopp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Avreise- og ankomsttider */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Avreise- og ankomsttider
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Avreise mellom</Label>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatTime(filters.departureTimeRange[0])}</span>
                <span>{formatTime(filters.departureTimeRange[1])}</span>
              </div>
              <div className="px-2">
                <Slider
                  value={filters.departureTimeRange}
                  onValueChange={(value) => updateFilter('departureTimeRange', value as [number, number])}
                  max={23}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Ankomst mellom</Label>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatTime(filters.arrivalTimeRange[0])}</span>
                <span>{formatTime(filters.arrivalTimeRange[1])}</span>
              </div>
              <div className="px-2">
                <Slider
                  value={filters.arrivalTimeRange}
                  onValueChange={(value) => updateFilter('arrivalTimeRange', value as [number, number])}
                  max={23}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maks reisetid */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Maksimal reisetid</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Reisetid: {filters.maxTravelTime}t</span>
              </div>
              <div className="px-2">
                <Slider
                  value={[filters.maxTravelTime]}
                  onValueChange={([value]) => updateFilter('maxTravelTime', value)}
                  max={24}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flyselskaper */}
        {availableAirlines.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Plane className="h-4 w-4 mr-2" />
                Flyselskaper
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {availableAirlines.map((airline) => {
                const airlineInfo = getAirlineInfo(airline)
                return (
                  <div key={airline} className="flex items-center space-x-3">
                    <Checkbox 
                      id={`airline-${airline}`}
                      checked={filters.airlines.includes(airline)}
                      onCheckedChange={() => toggleAirline(airline)}
                    />
                    <Label htmlFor={`airline-${airline}`} className="text-sm flex-1 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img 
                            src={airlineInfo.logo} 
                            alt={`${airline} logo`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              // Fallback til Daisycon API hvis lokal logo ikke finnes
                              const fallbackUrl = `https://images.daisycon.io/airline/?iata=${airline.toLowerCase()}&width=60&height=60&color=ffffff`
                              if (target.src !== fallbackUrl) {
                                target.src = fallbackUrl
                              } else {
                                // Hvis Daisycon også feiler, vis ikon
                                target.style.display = 'none'
                                target.nextElementSibling?.classList.remove('hidden')
                              }
                            }}
                          />
                          <div className="hidden w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                            <Plane className="h-3 w-3 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs font-medium">
                              {airline}
                            </Badge>
                            <span className="font-medium">{airlineInfo.name}</span>
                          </div>
                          <div className="text-xs text-gray-500">{airlineInfo.country}</div>
                        </div>
                      </div>
                    </Label>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Bagasje */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Bagasje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="baggage-included"
                checked={filters.baggageIncluded}
                onCheckedChange={(checked) => updateFilter('baggageIncluded', checked)}
              />
              <Label htmlFor="baggage-included" className="text-sm">
                Kun tilbud med bagasje inkludert
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
