'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  MapPin, 
  Tag, 
  Calendar,
  Gauge,
  Filter,
  RotateCcw
} from 'lucide-react'
import {
  norskeFylker,
  storeByer,
  bilMerker,
  drivstoffTyper,
  girkasseTyper,
  prisRangerBil,
  bilAlder,
  kilometerStand,
  boligTyper,
  prisRangerEiendom,
  antallRom,
  arealer,
  tomtestorrelser,
  byggeAr,
  torgetKategorier,
  prisRangerTorget,
  tilstand,
  sorteringsAlternativer,
  sokeForslag,
  hurtigfiltre
} from '@/lib/norway-data'

interface FilterState {
  search?: string
  location?: string
  priceRange?: string
  category?: string
  // Bil-spesifikke
  make?: string
  fuel?: string
  transmission?: string
  ageRange?: string
  kmRange?: string
  // Eiendom-spesifikke
  propertyType?: string
  rooms?: string
  area?: string
  plotSize?: string
  buildYear?: string
  // Torget-spesifikke
  condition?: string
  subcategory?: string
}

interface AdvancedFiltersProps {
  category: 'bil' | 'eiendom' | 'torget'
  onFiltersChange: (filters: FilterState) => void
  onSearch: () => void
}

export default function AdvancedFilters({ category, onFiltersChange, onSearch }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({})
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const config = {
    bil: {
      searchPlaceholder: 'Søk etter bilmerke, modell, registreringsnummer...',
      quickFilters: hurtigfiltre.bil,
      suggestions: sokeForslag.bil
    },
    eiendom: {
      searchPlaceholder: 'Søk etter leilighet, hus, område, postnummer...',
      quickFilters: hurtigfiltre.eiendom,
      suggestions: sokeForslag.eiendom
    },
    torget: {
      searchPlaceholder: 'Søk etter produktnavn, merke, modell...',
      quickFilters: hurtigfiltre.torget,
      suggestions: sokeForslag.torget
    }
  }

  // Oppdater aktive filtre
  useEffect(() => {
    const active = Object.entries(filters)
      .filter(([key, value]) => value && value !== '')
      .map(([key]) => key)
    setActiveFilters(active)
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilter = (key: keyof FilterState, value: string) => {
    const alleVerdier = [
      'Alle', 'Alle priser', 'Alle merker', 'Alle typer', 'Alle kategorier', 
      'Alle fylker', 'Alle byer', 'Alle tilstander', 'Alle årganger', 
      'Alle størrelser', 'Alle tomtestørrelser', 'Alle byggeår', 'Alle områder'
    ]
    
    setFilters(prev => ({
      ...prev,
      [key]: alleVerdier.includes(value) ? undefined : value
    }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const applyQuickFilter = (quickFilter: any) => {
    setFilters(prev => ({ ...prev, ...quickFilter.filter }))
    onSearch()
  }

  const removeFilter = (key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key as keyof FilterState]
      return newFilters
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch()
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Søk og filtrer
          <Badge variant="outline" className="ml-auto">
            {activeFilters.length} aktive filtre
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hovedsøk */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={config[category].searchPlaceholder}
              className="pl-10"
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>
          <Button type="submit">
            <Filter className="h-4 w-4 mr-2" />
            Søk
          </Button>
        </form>

        {/* Søkeforslag */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Populært:</span>
          {config[category].suggestions.slice(0, 4).map((suggestion) => (
            <Badge 
              key={suggestion}
              variant="secondary" 
              className="cursor-pointer hover:bg-gray-200"
              onClick={() => updateFilter('search', suggestion)}
            >
              {suggestion}
            </Badge>
          ))}
        </div>

        {/* Hurtigfiltre */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Hurtigfiltre:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {config[category].quickFilters.map((filter) => (
              <Button
                key={filter.navn}
                variant="outline"
                size="sm"
                onClick={() => applyQuickFilter(filter)}
                className="h-8"
              >
                {filter.navn}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Grunnleggende filtre */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Lokasjon */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Lokasjon
            </label>
            <Select value={filters.location || ''} onValueChange={(value) => updateFilter('location', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Velg område" />
              </SelectTrigger>
              <SelectContent>
                {norskeFylker.map((fylke) => (
                  <SelectItem key={fylke} value={fylke}>
                    {fylke}
                  </SelectItem>
                ))}
                <Separator />
                {storeByer.slice(1).map((by) => (
                  <SelectItem key={by} value={by}>
                    📍 {by}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prisklasse */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Prisklasse</label>
            <Select value={filters.priceRange || ''} onValueChange={(value) => updateFilter('priceRange', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Velg prisklasse" />
              </SelectTrigger>
              <SelectContent>
                {(category === 'bil' ? prisRangerBil : 
                  category === 'eiendom' ? prisRangerEiendom : 
                  prisRangerTorget).map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Kategori-spesifikke hovedfiltre */}
          {category === 'bil' && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Merke</label>
                <Select value={filters.make || ''} onValueChange={(value) => updateFilter('make', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg merke" />
                  </SelectTrigger>
                  <SelectContent>
                    {bilMerker.map((merke) => (
                      <SelectItem key={merke} value={merke}>
                        {merke}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Drivstoff</label>
                <Select value={filters.fuel || ''} onValueChange={(value) => updateFilter('fuel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg drivstoff" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivstoffTyper.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {category === 'eiendom' && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Boligtype</label>
                <Select value={filters.propertyType || ''} onValueChange={(value) => updateFilter('propertyType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg type" />
                  </SelectTrigger>
                  <SelectContent>
                    {boligTyper.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Antall rom</label>
                <Select value={filters.rooms || ''} onValueChange={(value) => updateFilter('rooms', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg rom" />
                  </SelectTrigger>
                  <SelectContent>
                    {antallRom.map((rom) => (
                      <SelectItem key={rom} value={rom}>
                        {rom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {category === 'torget' && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Kategori</label>
                <Select value={filters.subcategory || ''} onValueChange={(value) => updateFilter('subcategory', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {torgetKategorier.map((kat) => (
                      <SelectItem key={kat} value={kat}>
                        {kat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Tilstand</label>
                <Select value={filters.condition || ''} onValueChange={(value) => updateFilter('condition', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg tilstand" />
                  </SelectTrigger>
                  <SelectContent>
                    {tilstand.map((tilstand) => (
                      <SelectItem key={tilstand} value={tilstand}>
                        {tilstand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        {/* Avanserte filtre toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-gray-600"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Skjul' : 'Vis'} avanserte filtre
          </Button>
          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Nullstill alle filtre
            </Button>
          )}
        </div>

        {/* Avanserte filtre */}
        {showAdvanced && (
          <div className="border-t pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category === 'bil' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Girkasse</label>
                    <Select value={filters.transmission || ''} onValueChange={(value) => updateFilter('transmission', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg girkasse" />
                      </SelectTrigger>
                      <SelectContent>
                        {girkasseTyper.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Årsmodell
                    </label>
                    <Select value={filters.ageRange || ''} onValueChange={(value) => updateFilter('ageRange', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg årgang" />
                      </SelectTrigger>
                      <SelectContent>
                        {bilAlder.map((alder) => (
                          <SelectItem key={alder} value={alder}>
                            {alder}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
                      <Gauge className="h-3 w-3" />
                      Kilometerstand
                    </label>
                    <Select value={filters.kmRange || ''} onValueChange={(value) => updateFilter('kmRange', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg km-stand" />
                      </SelectTrigger>
                      <SelectContent>
                        {kilometerStand.map((km) => (
                          <SelectItem key={km} value={km}>
                            {km}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {category === 'eiendom' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Areal</label>
                    <Select value={filters.area || ''} onValueChange={(value) => updateFilter('area', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg areal" />
                      </SelectTrigger>
                      <SelectContent>
                        {arealer.map((areal) => (
                          <SelectItem key={areal} value={areal}>
                            {areal}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Tomtestørrelse</label>
                    <Select value={filters.plotSize || ''} onValueChange={(value) => updateFilter('plotSize', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg tomtestørrelse" />
                      </SelectTrigger>
                      <SelectContent>
                        {tomtestorrelser.map((storrelse) => (
                          <SelectItem key={storrelse} value={storrelse}>
                            {storrelse}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Byggeår
                    </label>
                    <Select value={filters.buildYear || ''} onValueChange={(value) => updateFilter('buildYear', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg byggeår" />
                      </SelectTrigger>
                      <SelectContent>
                        {byggeAr.map((ar) => (
                          <SelectItem key={ar} value={ar}>
                            {ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Aktive filtre */}
        {activeFilters.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-700">Aktive filtre:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filterKey) => {
                const value = filters[filterKey as keyof FilterState]
                if (!value) return null
                
                return (
                  <Badge key={filterKey} variant="secondary" className="gap-1">
                    {filterKey}: {value}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeFilter(filterKey)}
                    />
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
