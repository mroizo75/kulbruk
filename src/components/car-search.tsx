'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Calendar,
  Fuel,
  Settings,
  X,
  Star,
  TrendingUp,
  Filter,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'
import { useCarSearch } from '@/hooks/use-car-search'

interface CarSearchFilters {
  searchTerm?: string
  make?: string
  model?: string
  location?: string
  priceMin?: number
  priceMax?: number
  yearMin?: number
  yearMax?: number
  fuelType?: string
  transmission?: string
  mileageMax?: number
}

interface CarSearchProps {
  onFiltersChange: (filters: CarSearchFilters) => void
  onSearch: () => void
}

// Populære bilmerker i Norge (basert på NAF statistikk)
const popularCarMakes = [
  'Toyota', 'Volkswagen', 'BMW', 'Audi', 'Mercedes-Benz', 'Tesla', 'Volvo', 
  'Ford', 'Skoda', 'Nissan', 'Hyundai', 'Peugeot', 'Kia', 'Mazda'
]

// Populære modeller per merke
const carModels: { [key: string]: string[] } = {
  'Toyota': ['Corolla', 'Camry', 'RAV4', 'Prius', 'Yaris', 'Avensis', 'C-HR', 'Highlander'],
  'Volkswagen': ['Golf', 'Passat', 'Polo', 'Tiguan', 'Touran', 'Arteon', 'ID.4', 'e-Golf'],
  'BMW': ['3-serie', '5-serie', 'X3', 'X5', 'i3', 'iX3', '1-serie', 'X1'],
  'Audi': ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'e-tron', 'A1'],
  'Mercedes-Benz': ['C-klasse', 'E-klasse', 'A-klasse', 'GLC', 'GLE', 'EQC', 'B-klasse'],
  'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X'],
  'Volvo': ['XC60', 'XC90', 'V60', 'V70', 'S60', 'XC40', 'V40'],
  'Ford': ['Focus', 'Fiesta', 'Kuga', 'Mondeo', 'Explorer', 'Mustang Mach-E'],
  'Skoda': ['Octavia', 'Superb', 'Fabia', 'Kodiaq', 'Karoq', 'Scala'],
  'Nissan': ['Qashqai', 'X-Trail', 'Micra', 'Leaf', 'Juke', 'Note']
}

// Norske byer/regioner
const norwegianCities = [
  'Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Kristiansand', 'Fredrikstad',
  'Drammen', 'Skien', 'Ålesund', 'Sandefjord', 'Tønsberg', 'Moss',
  'Haugesund', 'Arendal', 'Bodø', 'Tromsø', 'Hamar', 'Lillehammer'
]

// Populære søkeforslag
const popularSearches = [
  'Tesla Model 3 Oslo',
  'BMW X5 diesel',
  'Audi A4 automat',
  'Toyota RAV4 hybrid',
  'Volkswagen Golf elbil',
  'Volvo XC60 Bergen',
  'Mercedes E-klasse',
  'Ford Kuga 4WD'
]

// Pris-ranges for bil
const priceRanges = [
  { label: 'Under 100k', min: 0, max: 100000 },
  { label: '100k - 250k', min: 100000, max: 250000 },
  { label: '250k - 500k', min: 250000, max: 500000 },
  { label: '500k - 750k', min: 500000, max: 750000 },
  { label: '750k - 1M', min: 750000, max: 1000000 },
  { label: 'Over 1M', min: 1000000, max: null }
]

export default function CarSearch({ onFiltersChange, onSearch }: CarSearchProps) {
  const { popularData, generateSmartSuggestions } = useCarSearch()
  const [filters, setFilters] = useState<CarSearchFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  // Oppdater filtre når de endres
  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  // Generer søkeforslag basert på input
  const generateSuggestions = (input: string) => {
    const smartSuggestions = generateSmartSuggestions(input)
    setSuggestions(smartSuggestions)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setFilters(prev => ({ ...prev, searchTerm: value }))
    generateSuggestions(value)
    setShowSuggestions(true)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion)
    setFilters(prev => ({ ...prev, searchTerm: suggestion }))
    setShowSuggestions(false)
    
    // Parse suggestion for smart filtering
    const lowerSuggestion = suggestion.toLowerCase()
    const newFilters: Partial<CarSearchFilters> = { searchTerm: suggestion }

    // Auto-detect make
    popularCarMakes.forEach(make => {
      if (lowerSuggestion.includes(make.toLowerCase())) {
        newFilters.make = make
      }
    })

    // Auto-detect location
    norwegianCities.forEach(city => {
      if (lowerSuggestion.includes(city.toLowerCase())) {
        newFilters.location = city
      }
    })

    // Auto-detect fuel type
    if (lowerSuggestion.includes('elbil') || lowerSuggestion.includes('elektrisk')) {
      newFilters.fuelType = 'Elektrisk'
    } else if (lowerSuggestion.includes('hybrid')) {
      newFilters.fuelType = 'Hybrid'
    } else if (lowerSuggestion.includes('diesel')) {
      newFilters.fuelType = 'Diesel'
    }

    // Auto-detect transmission
    if (lowerSuggestion.includes('automat')) {
      newFilters.transmission = 'Automat'
    }

    setFilters(prev => ({ ...prev, ...newFilters }))
    onSearch()
  }

  const updateFilter = (key: keyof CarSearchFilters, value: any) => {
    // Håndter "alle_*" verdier som undefined
    const alleVerdier = [
      'alle_merker', 'alle_modeller', 'alle_omrader', 'alle_drivstoff',
      'alle_girkasser', 'alle_aarganger', 'alle_priser'
    ]
    
    const actualValue = alleVerdier.includes(value) ? undefined : value
    setFilters(prev => ({ ...prev, [key]: actualValue }))
    
    // Update available models when make changes
    if (key === 'make') {
      setSelectedModels(carModels[actualValue] || [])
      setFilters(prev => ({ ...prev, model: undefined }))
    }
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
    setSelectedModels([])
    setShowAdvanced(false)
  }

  const handlePriceRangeSelect = (range: typeof priceRanges[0]) => {
    setFilters(prev => ({
      ...prev,
      priceMin: range.min,
      priceMax: range.max
    }))
  }

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== '').length

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Hovedsøk */}
          <div className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={searchRef}
                  placeholder="Søk etter bilmerke, modell, sted... (f.eks. 'BMW X5 Oslo')"
                  className="pl-10 text-lg h-12"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => {
                      setSearchTerm('')
                      setFilters(prev => ({ ...prev, searchTerm: '' }))
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button onClick={onSearch} className="h-12 px-8">
                <Search className="h-4 w-4 mr-2" />
                Søk
              </Button>
            </div>

            {/* Søkeforslag */}
            {showSuggestions && suggestions.length > 0 && (
              <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto">
                <CardContent className="p-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center gap-2"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Search className="h-4 w-4 text-gray-400" />
                      <span>{suggestion}</span>
                      {popularSearches.includes(suggestion) && (
                        <Star className="h-3 w-3 text-yellow-500 ml-auto" />
                      )}
                      {suggestion.includes('Tesla') && (
                        <TrendingUp className="h-3 w-3 text-green-500 ml-auto" />
                      )}
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Hurtigfiltre */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">Hurtigfiltre:</span>
            {priceRanges.slice(0, 4).map((range, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handlePriceRangeSelect(range)}
                className="h-8"
              >
                <DollarSign className="h-3 w-3 mr-1" />
                {range.label}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter('fuelType', 'Elektrisk')}
              className="h-8"
            >
              <Fuel className="h-3 w-3 mr-1" />
              Elbiler
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter('fuelType', 'Hybrid')}
              className="h-8"
            >
              <Fuel className="h-3 w-3 mr-1" />
              Hybrid
            </Button>
            {/* Trending søk fra data */}
            {popularData?.trendingTerms.slice(0, 2).map((term, index) => (
              <Button
                key={`trend-${index}`}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(term.term)}
                className="h-8"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                {term.term}
              </Button>
            ))}
          </div>

          {/* Avanserte filtre */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-gray-600"
            >
              <Settings className="h-4 w-4 mr-2" />
              {showAdvanced ? 'Skjul' : 'Vis'} avanserte filtre
            </Button>
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {activeFiltersCount} aktive filtre
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-600"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Nullstill
                </Button>
              </div>
            )}
          </div>

          {/* Avanserte filtre panel */}
          {showAdvanced && (
            <div className="border-t pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Merke */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Merke</label>
                  <Select value={filters.make || 'alle_merker'} onValueChange={(value) => updateFilter('make', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg merke" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alle_merker">Alle merker</SelectItem>
                      {(popularData?.popularMakes || popularCarMakes.map(make => ({ make, count: 0 }))).map(({ make }) => (
                        <SelectItem key={make} value={make}>
                          {make}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Modell */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Modell</label>
                  <Select 
                    value={filters.model || 'alle_modeller'} 
                    onValueChange={(value) => updateFilter('model', value)}
                    disabled={!filters.make}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={filters.make ? "Velg modell" : "Velg merke først"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alle_modeller">Alle modeller</SelectItem>
                      {selectedModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lokasjon */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Lokasjon
                  </label>
                  <Select value={filters.location || 'alle_omrader'} onValueChange={(value) => updateFilter('location', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg område" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alle_omrader">Alle områder</SelectItem>
                      {norwegianCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Drivstoff */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
                    <Fuel className="h-3 w-3" />
                    Drivstoff
                  </label>
                  <Select value={filters.fuelType || 'alle_drivstoff'} onValueChange={(value) => updateFilter('fuelType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg drivstoff" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alle_drivstoff">Alle</SelectItem>
                      <SelectItem value="Elektrisk">Elektrisk</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="Plugin-hybrid">Plugin-hybrid</SelectItem>
                      <SelectItem value="Bensin">Bensin</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Prisområde */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Fra pris (kr)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.priceMin || ''}
                    onChange={(e) => updateFilter('priceMin', parseInt(e.target.value) || undefined)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Til pris (kr)</label>
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={filters.priceMax || ''}
                    onChange={(e) => updateFilter('priceMax', parseInt(e.target.value) || undefined)}
                  />
                </div>
              </div>

              {/* År og km */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Fra år
                  </label>
                  <Input
                    type="number"
                    placeholder="2015"
                    value={filters.yearMin || ''}
                    onChange={(e) => updateFilter('yearMin', parseInt(e.target.value) || undefined)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Til år
                  </label>
                  <Input
                    type="number"
                    placeholder="2024"
                    value={filters.yearMax || ''}
                    onChange={(e) => updateFilter('yearMax', parseInt(e.target.value) || undefined)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Maks km</label>
                  <Input
                    type="number"
                    placeholder="150000"
                    value={filters.mileageMax || ''}
                    onChange={(e) => updateFilter('mileageMax', parseInt(e.target.value) || undefined)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Aktive filtre */}
          {activeFiltersCount > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Aktive filtre:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value) return null
                  
                  let displayValue = value.toString()
                  if (key === 'priceMin') displayValue = `Fra ${value.toLocaleString('no-NO')} kr`
                  if (key === 'priceMax') displayValue = `Til ${value.toLocaleString('no-NO')} kr`
                  if (key === 'mileageMax') displayValue = `Maks ${value.toLocaleString('no-NO')} km`
                  
                  return (
                    <Badge key={key} variant="secondary" className="gap-1">
                      {displayValue}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-500" 
                        onClick={() => updateFilter(key as keyof CarSearchFilters, undefined)}
                      />
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
