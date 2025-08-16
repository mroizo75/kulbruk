'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter, useParams } from 'next/navigation'
import { notFound } from 'next/navigation'
import { Search, Car, MapPin, Home, ShoppingBag, Calendar, Gauge, Fuel, Settings, Users, Ruler, X, Filter, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import ListingCard from '@/components/listing-card'

interface Listing {
  id: string
  title: string
  description: string
  price: number
  location: string
  createdAt: string
  images: { url: string }[]
  category: { name: string, slug: string }
  user: { firstName?: string, lastName?: string }
  views: number
}

const VALID_CATEGORIES = ['bil', 'eiendom', 'torget'] as const
type ValidCategory = typeof VALID_CATEGORIES[number]

const CATEGORY_NAMES = {
  bil: 'Biler',
  eiendom: 'Eiendom', 
  torget: 'Torget'
} as const

function CategoryListingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const categorySlug = params.category as string
  
  // Handle redirects for invalid categories
  useEffect(() => {
    if (categorySlug === 'biler') {
      router.replace('/annonser/bil')
      return
    }
    if (categorySlug === 'eiendommer') {
      router.replace('/annonser/eiendom')
      return
    }
  }, [categorySlug, router])

  // Valider kategori
  if (!VALID_CATEGORIES.includes(categorySlug as ValidCategory)) {
    notFound()
  }
  
  const validCategory = categorySlug as ValidCategory
  
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  
  // Felles filtre
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  
  // Bil-spesifikke filtre
  const [make, setMake] = useState(searchParams.get('make') || 'alle-merker')
  const [fuelType, setFuelType] = useState(searchParams.get('fuelType') || 'alle-drivstoff')
  const [transmission, setTransmission] = useState(searchParams.get('transmission') || 'alle-girkasser')
  const [yearFrom, setYearFrom] = useState(searchParams.get('yearFrom') || '')
  const [yearTo, setYearTo] = useState(searchParams.get('yearTo') || '')
  const [mileageFrom, setMileageFrom] = useState(searchParams.get('mileageFrom') || '')
  const [mileageTo, setMileageTo] = useState(searchParams.get('mileageTo') || '')
  const [color, setColor] = useState(searchParams.get('color') || 'alle-farger')
  const [wheelDrive, setWheelDrive] = useState(searchParams.get('wheelDrive') || 'alle-hjuldrift')

  // Eiendom-spesifikke filtre
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || 'alle-typer')
  const [rooms, setRooms] = useState(searchParams.get('rooms') || '')
  const [area, setArea] = useState(searchParams.get('area') || '')
  const [plotSize, setPlotSize] = useState(searchParams.get('plotSize') || '')
  const [buildYear, setBuildYear] = useState(searchParams.get('buildYear') || '')

  // Torget-spesifikke filtre
  const [condition, setCondition] = useState(searchParams.get('condition') || 'alle-tilstander')
  const [brand, setBrand] = useState(searchParams.get('brand') || '')

  // Fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('page', String(currentPage))
        params.set('limit', '12')
        params.set('category', validCategory)
        
        if (search) params.set('search', search)
        if (location) params.set('location', location)
        if (minPrice) params.set('minPrice', minPrice)
        if (maxPrice) params.set('maxPrice', maxPrice)
        
        // Bil-spesifikke parametre
        if (validCategory === 'bil') {
          if (make && !make.startsWith('alle-')) params.set('make', make)
          if (fuelType && !fuelType.startsWith('alle-')) params.set('fuelType', fuelType)
          if (transmission && !transmission.startsWith('alle-')) params.set('transmission', transmission)
          if (yearFrom) params.set('yearFrom', yearFrom)
          if (yearTo) params.set('yearTo', yearTo)
          if (mileageFrom) params.set('mileageFrom', mileageFrom)
          if (mileageTo) params.set('mileageTo', mileageTo)
          if (color && !color.startsWith('alle-')) params.set('color', color)
          if (wheelDrive && !wheelDrive.startsWith('alle-')) params.set('wheelDrive', wheelDrive)
        }

        // Eiendom-spesifikke parametre
        if (validCategory === 'eiendom') {
          if (propertyType && !propertyType.startsWith('alle-')) params.set('propertyType', propertyType)
          if (rooms) params.set('rooms', rooms)
          if (area) params.set('area', area)
          if (plotSize) params.set('plotSize', plotSize)
          if (buildYear) params.set('buildYear', buildYear)
        }

        // Torget-spesifikke parametre
        if (validCategory === 'torget') {
          if (condition && !condition.startsWith('alle-')) params.set('condition', condition)
          if (brand) params.set('brand', brand)
        }

        const res = await fetch(`/api/annonser/list?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setListings(data.listings)
          setTotalPages(data.pagination.pages)
        }
      } catch (error) {
        console.error('Feil ved henting av annonser:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [currentPage, search, location, minPrice, maxPrice, make, fuelType, transmission, yearFrom, yearTo, mileageFrom, mileageTo, color, wheelDrive, propertyType, rooms, area, plotSize, buildYear, condition, brand, validCategory])

  // Update URL params
  const updateUrlParams = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (location) params.set('location', location)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    
    // Bil-spesifikke parametre
    if (validCategory === 'bil') {
      if (make && !make.startsWith('alle-')) params.set('make', make)
      if (fuelType && !fuelType.startsWith('alle-')) params.set('fuelType', fuelType)
      if (transmission && !transmission.startsWith('alle-')) params.set('transmission', transmission)
      if (yearFrom) params.set('yearFrom', yearFrom)
      if (yearTo) params.set('yearTo', yearTo)
      if (mileageFrom) params.set('mileageFrom', mileageFrom)
      if (mileageTo) params.set('mileageTo', mileageTo)
      if (color && !color.startsWith('alle-')) params.set('color', color)
      if (wheelDrive && !wheelDrive.startsWith('alle-')) params.set('wheelDrive', wheelDrive)
    }

    // Eiendom-spesifikke parametre
    if (validCategory === 'eiendom') {
      if (propertyType && !propertyType.startsWith('alle-')) params.set('propertyType', propertyType)
      if (rooms) params.set('rooms', rooms)
      if (area) params.set('area', area)
      if (plotSize) params.set('plotSize', plotSize)
      if (buildYear) params.set('buildYear', buildYear)
    }

    // Torget-spesifikke parametre
    if (validCategory === 'torget') {
      if (condition && !condition.startsWith('alle-')) params.set('condition', condition)
      if (brand) params.set('brand', brand)
    }
    
    const newUrl = `/annonser/${validCategory}${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl, { scroll: false })
    setCurrentPage(1)
    // Lukk mobil-filter etter søk
    setShowMobileFilters(false)
  }

  // Clear all filters
  const clearFilters = () => {
    setSearch('')
    setLocation('')
    setMinPrice('')
    setMaxPrice('')
    
    // Bil-spesifikke filtre
    if (validCategory === 'bil') {
      setMake('alle-merker')
      setFuelType('alle-drivstoff')
      setTransmission('alle-girkasser')
      setYearFrom('')
      setYearTo('')
      setMileageFrom('')
      setMileageTo('')
      setColor('alle-farger')
      setWheelDrive('alle-hjuldrift')
    }

    // Eiendom-spesifikke filtre
    if (validCategory === 'eiendom') {
      setPropertyType('alle-typer')
      setRooms('')
      setArea('')
      setPlotSize('')
      setBuildYear('')
    }

    // Torget-spesifikke filtre
    if (validCategory === 'torget') {
      setCondition('alle-tilstander')
      setBrand('')
    }

    router.push(`/annonser/${validCategory}`, { scroll: false })
    setCurrentPage(1)
    // Lukk mobil-filter etter nullstilling
    setShowMobileFilters(false)
  }

  // Count active filters
  const getActiveFiltersCount = () => {
    const baseFilters = [search, location, minPrice, maxPrice]
    
    if (validCategory === 'bil') {
      return [...baseFilters,
        make && !make.startsWith('alle-') ? make : null,
        fuelType && !fuelType.startsWith('alle-') ? fuelType : null,
        transmission && !transmission.startsWith('alle-') ? transmission : null,
        yearFrom, yearTo, mileageFrom, mileageTo,
        color && !color.startsWith('alle-') ? color : null,
        wheelDrive && !wheelDrive.startsWith('alle-') ? wheelDrive : null
      ].filter(Boolean).length
    }

    if (validCategory === 'eiendom') {
      return [...baseFilters,
        propertyType && !propertyType.startsWith('alle-') ? propertyType : null,
        rooms, area, plotSize, buildYear
      ].filter(Boolean).length
    }

    if (validCategory === 'torget') {
      return [...baseFilters,
        condition && !condition.startsWith('alle-') ? condition : null,
        brand
      ].filter(Boolean).length
    }

    return baseFilters.filter(Boolean).length
  }

  const activeFiltersCount = getActiveFiltersCount()

  // Render bil-spesifikke filtre
  const renderCarFilters = () => (
    <div className="bg-white rounded-lg border shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Car className="h-5 w-5" />
        Bil-spesifikasjoner
      </h3>
      <div className="space-y-4">
        {/* Merke */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2">Merke</label>
          <Select value={make} onValueChange={setMake}>
            <SelectTrigger>
              <SelectValue placeholder="Alle merker" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle-merker">Alle merker</SelectItem>
              <SelectItem value="BMW">BMW</SelectItem>
              <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
              <SelectItem value="Audi">Audi</SelectItem>
              <SelectItem value="Volkswagen">Volkswagen</SelectItem>
              <SelectItem value="Toyota">Toyota</SelectItem>
              <SelectItem value="Ford">Ford</SelectItem>
              <SelectItem value="Volvo">Volvo</SelectItem>
              <SelectItem value="Tesla">Tesla</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Drivstoff */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Fuel className="h-4 w-4" />
            Drivstoff
          </label>
          <Select value={fuelType} onValueChange={setFuelType}>
            <SelectTrigger>
              <SelectValue placeholder="Alle drivstoff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle-drivstoff">Alle drivstoff</SelectItem>
              <SelectItem value="Bensin">Bensin</SelectItem>
              <SelectItem value="Diesel">Diesel</SelectItem>
              <SelectItem value="Elektrisk">Elektrisk</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Girkasse */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Girkasse
          </label>
          <Select value={transmission} onValueChange={setTransmission}>
            <SelectTrigger>
              <SelectValue placeholder="Alle girkasser" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle-girkasser">Alle girkasser</SelectItem>
              <SelectItem value="Manuell">Manuell</SelectItem>
              <SelectItem value="Automat">Automat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hjuldrift */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2">Hjuldrift</label>
          <Select value={wheelDrive} onValueChange={setWheelDrive}>
            <SelectTrigger>
              <SelectValue placeholder="Alle hjuldrift" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle-hjuldrift">Alle hjuldrift</SelectItem>
              <SelectItem value="Forhjulsdrift">Forhjulsdrift</SelectItem>
              <SelectItem value="Bakhjulsdrift">Bakhjulsdrift</SelectItem>
              <SelectItem value="Firehjulsdrift">Firehjulsdrift</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Årsmodell fra */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Årsmodell fra
          </label>
          <Input
            type="number"
            placeholder="2000"
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
            min="1900"
            max="2025"
          />
        </div>

        {/* Årsmodell til */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Årsmodell til
          </label>
          <Input
            type="number"
            placeholder="2025"
            value={yearTo}
            onChange={(e) => setYearTo(e.target.value)}
            min="1900"
            max="2025"
          />
        </div>

        {/* Kilometer fra */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Gauge className="h-4 w-4" />
            Kilometer fra
          </label>
          <Input
            type="number"
            placeholder="0"
            value={mileageFrom}
            onChange={(e) => setMileageFrom(e.target.value)}
          />
        </div>

        {/* Kilometer til */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Gauge className="h-4 w-4" />
            Kilometer til
          </label>
          <Input
            type="number"
            placeholder="500000"
            value={mileageTo}
            onChange={(e) => setMileageTo(e.target.value)}
          />
        </div>

        {/* Farge */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2">Farge</label>
          <Select value={color} onValueChange={setColor}>
            <SelectTrigger>
              <SelectValue placeholder="Alle farger" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle-farger">Alle farger</SelectItem>
              <SelectItem value="Hvit">Hvit</SelectItem>
              <SelectItem value="Svart">Svart</SelectItem>
              <SelectItem value="Grå">Grå</SelectItem>
              <SelectItem value="Sølv">Sølv</SelectItem>
              <SelectItem value="Blå">Blå</SelectItem>
              <SelectItem value="Rød">Rød</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  // Render eiendom-spesifikke filtre
  const renderRealEstateFilters = () => (
    <div className="bg-white rounded-lg border shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Home className="h-5 w-5" />
        Eiendom-spesifikasjoner
      </h3>
      <div className="space-y-4">
        {/* Eiendomstype */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2">Eiendomstype</label>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger>
              <SelectValue placeholder="Alle typer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle-typer">Alle typer</SelectItem>
              <SelectItem value="Leilighet">Leilighet</SelectItem>
              <SelectItem value="Enebolig">Enebolig</SelectItem>
              <SelectItem value="Rekkehus">Rekkehus</SelectItem>
              <SelectItem value="Tomannsbolig">Tomannsbolig</SelectItem>
              <SelectItem value="Hytte">Hytte</SelectItem>
              <SelectItem value="Tomt">Tomt</SelectItem>
              <SelectItem value="Næring">Næring</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Antall rom */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Users className="h-4 w-4" />
            Antall rom
          </label>
          <Input
            type="number"
            placeholder="f.eks. 3"
            value={rooms}
            onChange={(e) => setRooms(e.target.value)}
            min="1"
            max="20"
          />
        </div>

        {/* Boligareal */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Ruler className="h-4 w-4" />
            Boligareal (m²)
          </label>
          <Input
            type="number"
            placeholder="f.eks. 80"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />
        </div>

        {/* Tomtestørrelse */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2">Tomtestørrelse (m²)</label>
          <Input
            type="number"
            placeholder="f.eks. 500"
            value={plotSize}
            onChange={(e) => setPlotSize(e.target.value)}
          />
        </div>

        {/* Byggeår */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Byggeår
          </label>
          <Input
            type="number"
            placeholder="f.eks. 1990"
            value={buildYear}
            onChange={(e) => setBuildYear(e.target.value)}
            min="1800"
            max="2025"
          />
        </div>
      </div>
    </div>
  )

  // Render torget-spesifikke filtre
  const renderMarketplaceFilters = () => (
    <div className="bg-white rounded-lg border shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <ShoppingBag className="h-5 w-5" />
        Produkt-spesifikasjoner
      </h3>
      <div className="space-y-4">
        {/* Tilstand */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2">Tilstand</label>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger>
              <SelectValue placeholder="Alle tilstander" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle-tilstander">Alle tilstander</SelectItem>
              <SelectItem value="Ny">Ny</SelectItem>
              <SelectItem value="Som ny">Som ny</SelectItem>
              <SelectItem value="Meget god">Meget god</SelectItem>
              <SelectItem value="God">God</SelectItem>
              <SelectItem value="Middels">Middels</SelectItem>
              <SelectItem value="Defekt">Defekt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Merke/Produsent */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2">Merke/Produsent</label>
          <Input
            placeholder="f.eks. Apple, Samsung..."
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{CATEGORY_NAMES[validCategory]}</h1>
          <p className="text-gray-600">Finn det du leter etter i kategorien {CATEGORY_NAMES[validCategory].toLowerCase()}</p>
        </div>

        {/* Mobile filter toggle button */}
        <div className="lg:hidden mb-4">
          <Button 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            variant="outline" 
            className="w-full justify-between"
          >
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filtrer søk</span>
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        <div className="lg:flex lg:gap-8">
          {/* Left sidebar with filters */}
          <div className={`lg:w-80 space-y-6 ${showMobileFilters ? 'block mb-6' : 'hidden'} lg:block`}>
            {/* Search */}
            <div className="bg-white rounded-lg border shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Søk</h3>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Søk i annonser..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) => e.key === 'Enter' && updateUrlParams()}
                  />
                </div>
                <Button onClick={updateUrlParams} className="w-full">
                  Søk
                </Button>
              </div>
            </div>

            {/* Grunnleggende filtre */}
            <div className="bg-white rounded-lg border shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Grunnleggende</h3>
              <div className="space-y-4">
                {/* Location */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Lokasjon
                  </label>
                  <Input
                    placeholder="f.eks. Oslo, Bergen..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                {/* Min price */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2">
                    Pris fra (kr)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>

                {/* Max price */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2">
                    Pris til (kr)
                  </label>
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Kategori-spesifikke filtre */}
            {validCategory === 'bil' && renderCarFilters()}
            {validCategory === 'eiendom' && renderRealEstateFilters()}
            {validCategory === 'torget' && renderMarketplaceFilters()}

            {/* Filter actions */}
            <div className="bg-white rounded-lg border shadow-sm p-4">
              <div className="space-y-3">
                <Button onClick={updateUrlParams} className="w-full">
                  Oppdater søk
                </Button>
                {activeFiltersCount > 0 && (
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    <X className="h-4 w-4 mr-2" />
                    Nullstill alle filtre ({activeFiltersCount})
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:flex-1">
            {/* Results */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Søker...</p>
              </div>
            ) : listings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen annonser funnet</h3>
                  <p className="text-gray-600 mb-4">
                    Prøv å endre søkekriteriene eller fjerne noen filtre
                  </p>
                  {activeFiltersCount > 0 && (
                    <Button variant="outline" onClick={clearFilters}>
                      Nullstill alle filtre
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-600">
                    Viser {listings.length} annonser
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {listings.map((listing) => (
                    <ListingCard 
                      key={listing.id} 
                      id={listing.id}
                      title={listing.title}
                      price={listing.price}
                      location={listing.location}
                      category={listing.category.name}
                      status="APPROVED"
                      images={listing.images}
                      views={listing.views}
                      createdAt={listing.createdAt}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Forrige
                    </Button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                    
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Neste
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CategoryListingsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Laster annonser...</p>
        </div>
      </div>
    }>
      <CategoryListingsContent />
    </Suspense>
  )
}