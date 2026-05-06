'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { MapPin, Star, Loader2, Utensils, Users, Calendar, X, Check, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import HotelBookingDialog from './hotel-booking-dialog'
import Image from 'next/image'

interface Room {
  book_hash: string
  room_name: string
  rg_ext: {
    class?: number
    bedding?: number
    bathroom?: number
    capacity?: number
    club?: number
    quality?: number
    bedrooms?: number
    balcony?: number
    floor?: number
    view?: number
    family?: number
  }
  meal_data: any
  daily_prices: any[]
  payment_options: any
  cancellation_penalties: any
  tax_data: any
  amenities: string[]
  facilities_trans: string[]
  allotment: number
  capacity: number
  size_sqm: number | null
  view: string | null
  bathroom_desc: string | null
  bedding_desc: string | null
  images?: string[]
}

interface HotelDetails {
  id: string
  hid: number
  name: string
  address: string
  image?: string
  images?: string[]
  star_rating: number
  amenity_groups?: any[]
  description?: any
  check_in_time?: string
  check_out_time?: string
  reviews?: any[]
  review_count?: number
  metapolicy_struct?: any
  metapolicy_extra_info?: string
  rooms: Room[]
  total_rooms: number
}

interface HotelDetailsDialogProps {
  hotelId: string
  hotelName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  searchParams: {
    checkIn: string
    checkOut: string
    adults: number
    children: number[]
    rooms: number
    roomConfigs?: { adults: number; childAges: number[] }[]
    residency?: string
  }
}

export default function HotelDetailsDialog({
  hotelId,
  hotelName,
  open,
  onOpenChange,
  searchParams
}: HotelDetailsDialogProps) {
  const [hotel, setHotel] = useState<HotelDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [roomImageIndexes, setRoomImageIndexes] = useState<Record<number, number>>({})
  const [expandedCancellation, setExpandedCancellation] = useState<Record<number, boolean>>({})
  const [expandedTax, setExpandedTax] = useState<Record<number, boolean>>({})
  const [reviewsFetched, setReviewsFetched] = useState(false)
  const [googleReviews, setGoogleReviews] = useState<{
    rating: number
    totalRatings: number
    reviews: { author: string; rating: number; text: string; time: number; relativeTime: string; authorPhotoUrl?: string }[]
  } | null>(null)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  // ECB exchange rates — fetched once when dialog opens, used for ~kr estimates on non-NOK taxes
  const [fxRates, setFxRates] = useState<Record<string, number> | null>(null)

  const getRoomImageIndex = (roomIdx: number) => roomImageIndexes[roomIdx] ?? 0
  const setRoomImageIndex = (roomIdx: number, idx: number) =>
    setRoomImageIndexes(prev => ({ ...prev, [roomIdx]: idx }))

  useEffect(() => {
    const fetchHotelDetails = async () => {
      if (!open || !hotelId) return

      try {
        setIsLoading(true)
        setError(null)
        setGoogleReviews(null)
        setReviewsFetched(false)

        console.log('🏨 Fetching hotel details:', { hotelId, ...searchParams })

        // Parse hotelId - sjekk om det er test hotellet (8473727) eller en slug
        const isNumericId = /^\d+$/.test(hotelId)
        const requestBody = isNumericId
          ? { hid: parseInt(hotelId), ...searchParams }
          : { hotelId, ...searchParams }

        const response = await fetch('/api/hotels/details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })

        const data = await response.json()
        console.log('🏨 Hotel details response:', data)

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch hotel details')
        }

        setHotel(data.hotel)
      } catch (err: any) {
        console.error('❌ Failed to fetch hotel details:', err)
        setError(err.message || 'Kunne ikke hente hotelldetaljer')
      } finally {
        setIsLoading(false)
      }
    }

    fetchHotelDetails()
  }, [open, hotelId, searchParams])

  // Hent ECB valutakurser én gang når dialogen åpnes
  useEffect(() => {
    if (!open || fxRates) return
    fetch('/api/utils/exchange-rates')
      .then(r => r.json())
      .then(d => { if (d.rates) setFxRates(d.rates) })
      .catch(() => { /* valgfritt — vi viser bare ikke ~kr dersom henting feiler */ })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const fetchGoogleReviews = async () => {
    if (!hotel || reviewsFetched) return
    setReviewsLoading(true)
    setReviewsFetched(true)
    try {
      const params = new URLSearchParams({
        hotelId: hotel.id,
        name: hotel.name,
        address: hotel.address,
      })
      const res = await fetch(`/api/hotels/reviews?${params}`)
      if (res.ok) {
        const data = await res.json()
        setGoogleReviews(data)
      }
    } catch (err) {
      console.warn('Reviews fetch failed:', err)
    } finally {
      setReviewsLoading(false)
    }
  }

  // Formater pris med valuta fra betalingsalternativer
  const formatPrice = (dailyPrices: any[], paymentOptions?: any) => {
    if (!dailyPrices || dailyPrices.length === 0) return 'Pris ikke tilgjengelig'
    const total = dailyPrices.reduce((sum: number, day: any) => sum + parseFloat(day || 0), 0)
    const currency = paymentOptions?.payment_types?.[0]?.show_currency_code
      || paymentOptions?.payment_types?.[0]?.currency_code
      || 'NOK'
    return new Intl.NumberFormat('nb-NO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(total)
  }

  // Norsk navn på skatter
  const TAX_NAME_MAP: Record<string, string> = {
    city_tax: 'Turistskatt',
    tourist_tax: 'Turistskatt',
    resort_fee: 'Stedstillegg',
    vat: 'MVA',
    service_charge: 'Servicegebyr',
    local_tax: 'Lokal avgift',
    environmental_levy: 'Miljøavgift',
    municipal_tax: 'Kommuneskatt',
    accommodation_tax: 'Overnattingsavgift',
  }

  const getTaxName = (name: string) =>
    TAX_NAME_MAP[name?.toLowerCase()] ?? name?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  // Format tax amount with its original currency_code (required by RateHawk).
  // When fxRates are available and the currency differs from NOK, also show a ~kr estimate.
  const formatTaxAmount = (amount: string, currency: string): string => {
    const parsed = parseFloat(amount || '0')
    const cur = currency?.toUpperCase() || ''

    let original: string
    try {
      original = new Intl.NumberFormat('nb-NO', {
        style: 'currency', currency: cur, maximumFractionDigits: 2,
      }).format(parsed)
    } catch {
      original = `${parsed.toFixed(2)} ${cur}`
    }

    if (!fxRates || cur === 'NOK' || !cur) return original

    const fromRate = fxRates[cur]
    const nokRate = fxRates['NOK']
    if (!fromRate || !nokRate) return original

    const nok = (parsed / fromRate) * nokRate
    const approx = new Intl.NumberFormat('nb-NO', {
      style: 'currency', currency: 'NOK', maximumFractionDigits: 0,
    }).format(nok)

    return `${original} (≈ ${approx})`
  }

  // Norsk oversettelse av ETG måltidstyper (basert på offisiell mapping)
  const MEAL_MAP: Record<string, string> = {
    'all-inclusive': 'Alt inklusiv',
    'breakfast': 'Frokost inkludert',
    'breakfast-buffet': 'Frokostbuffet',
    'continental-breakfast': 'Kontinental frokost',
    'dinner': 'Middag inkludert',
    'full-board': 'Helpensjon',
    'half-board': 'Halvpensjon',
    'lunch': 'Lunsj inkludert',
    'nomeal': 'Kun rom',
    'room_only': 'Kun rom',
    'some-meal': 'Some meal',
    'english-breakfast': 'Engelsk frokost',
    'american-breakfast': 'Amerikansk frokost',
    'asian-breakfast': 'Asiatisk frokost',
    'chinese-breakfast': 'Kinesisk frokost',
    'israeli-breakfast': 'Israelsk frokost',
    'japanese-breakfast': 'Japansk frokost',
    'scandinavian-breakfast': 'Skandinavisk frokost',
    'scottish-breakfast': 'Skotsk frokost',
    'breakfast-for-1': 'Frokost for 1',
    'breakfast-for-2': 'Frokost for 2',
    'super-all-inclusive': 'Super alt inklusiv',
    'soft-all-inclusive': 'Myk alt inklusiv',
    'ultra-all-inclusive': 'Ultra alt inklusiv',
    'half-board-lunch': 'Halvpensjon (lunsj)',
    'half-board-dinner': 'Halvpensjon (middag)',
  }

  const getMealText = (mealData: any): string => {
    const value = mealData?.value
    if (!value) return 'Kun rom'
    return MEAL_MAP[value] || value
  }

  const RG_BEDDING: Record<number, string> = {
    1: '1 enkeltsseng',
    2: '2 enkeltsenger',
    3: '1 dobbeltseng',
    4: '2 dobbeltsenger',
    5: '1 king size-seng',
    6: '1 queen size-seng',
    7: 'Køyesenger',
    8: 'Blandede senger',
    9: 'Sofaseng',
  }

  const BEDDING_DESC_MAP: Record<string, string> = {
    'full double bed': 'dobbeltseng',
    'double bed': 'dobbeltseng',
    'king size bed': 'king size-seng',
    'king-size bed': 'king size-seng',
    'queen size bed': 'queen size-seng',
    'queen-size bed': 'queen size-seng',
    'single bed': 'enkeltseng',
    '1 single bed': '1 enkeltseng',
    '2 single beds': '2 enkeltsenger',
    '3 single beds': '3 enkeltsenger',
    '4 single beds': '4 enkeltsenger',
    'twin beds': '2 enkeltsenger',
    'twin bed': '2 enkeltsenger',
    'bunk beds': 'køyesenger',
    'bunk bed': 'køyeseng',
    'sofa bed': 'sofaseng',
    'futon': 'futon',
    '1 king size bed': '1 king size-seng',
    '2 king size beds': '2 king size-senger',
    '1 queen size bed': '1 queen size-seng',
    '2 queen size beds': '2 queen size-senger',
    '1 full double bed': '1 dobbeltseng',
    '2 full double beds': '2 dobbeltsenger',
  }

  const BATHROOM_DESC_MAP: Record<string, string> = {
    'with bathtub': 'med badekar',
    'with shower': 'med dusj',
    'with shower and bathtub': 'med dusj og badekar',
    'with sauna': 'med badstu',
    'with jacuzzi': 'med jacuzzi',
    'with hot tub': 'med boblebad',
    'with steam room': 'med dampbad',
    'shared bathroom': 'delt bad',
    'private bathroom': 'eget bad',
    'en suite bathroom': 'eget bad',
    'en-suite bathroom': 'eget bad',
    'outdoor shower': 'utendørs dusj',
  }

  const translateBeddingDesc = (raw: string): string =>
    BEDDING_DESC_MAP[raw.toLowerCase().trim()] ?? raw

  const translateBathroomDesc = (raw: string): string =>
    BATHROOM_DESC_MAP[raw.toLowerCase().trim()] ?? raw

  const RG_CLASS: Record<number, string> = {
    0: 'Standard',
    1: 'Superior',
    2: 'Deluxe',
    3: 'Luksus',
    4: 'Suite',
    5: 'Leilighet',
    6: 'Villa',
    7: 'Executive',
  }

  const RG_BATHROOM: Record<number, string> = {
    0: 'Eget bad',
    1: 'Delt bad',
    2: 'Eget bad',
  }

  const getRoomClass = (rg_ext: Room['rg_ext']): string | null =>
    rg_ext.class !== undefined ? (RG_CLASS[rg_ext.class] ?? null) : null

  const getBedding = (rg_ext: Room['rg_ext']): string | null =>
    rg_ext.bedding !== undefined ? (RG_BEDDING[rg_ext.bedding] ?? null) : null

  const getBathroom = (rg_ext: Room['rg_ext']): string | null =>
    rg_ext.bathroom !== undefined ? (RG_BATHROOM[rg_ext.bathroom] ?? null) : null

  // Oversett vanlige engelske ord i romnavn til norsk
  const translateRoomName = (name: string): string =>
    name
      .replace(/\b(\d+)\s+bedrooms?\b/gi, (_, n) => `${n} soverom`)
      .replace(/\bbed in dorm\b/gi, 'Seng i sovesal')
      .replace(/\bshared bathroom\b/gi, 'delt bad')
      .replace(/\bapartment\b/gi, 'Leilighet')
      .replace(/\bstandard room\b/gi, 'Standard rom')
      .replace(/\bdeluxe room\b/gi, 'Deluxe rom')
      .replace(/\bsuperior room\b/gi, 'Superior rom')
      .replace(/\bsingle room\b/gi, 'Enkeltrom')
      .replace(/\bdouble room\b/gi, 'Dobbeltrom')
      .replace(/\btwins? room\b/gi, 'Rom med to senger')
      .replace(/\bfamily room\b/gi, 'Familierom')
      .replace(/\bbeds?\b/gi, (m) => m === 'bed' ? 'seng' : 'senger')
      .replace(/\bfloor\b/gi, 'etasje')
      .replace(/\bview\b/gi, 'utsikt')
      .replace(/\bsea view\b/gi, 'havutsikt')
      .replace(/\bcity view\b/gi, 'byutsikt')
      .replace(/\bgarden view\b/gi, 'hageutsikt')
      .replace(/\bpool view\b/gi, 'bassengutsikt')
  // Hent ikke-inkluderte skatter fra room tax_data
  const getNonIncludedTaxes = (room: Room): any[] => {
    const taxes = room.tax_data?.taxes || room.payment_options?.payment_types?.[0]?.tax_data?.taxes || []
    return taxes.filter((t: any) => t.included_by_supplier === false)
  }

  // Parse kanselleringspolicyer
  const parseCancellationInfo = (room: Room) => {
    const penalties = room.cancellation_penalties
    if (!penalties) return null

    const policies = Array.isArray(penalties.policies) ? penalties.policies : []
    const isNonRefundable = penalties.is_non_refundable || (policies.length === 1 && policies[0]?.penalty_percent === 100)

    // Prefer the explicit field; fall back to computing from the policies array.
    // The last policy with penalty_percent === 0 indicates the free-cancellation window end.
    let freeCancellation: string | null =
      penalties.free_cancellation_before || penalties.cancellation_deadline || null

    if (!freeCancellation && !isNonRefundable && policies.length > 0) {
      const freePolicies = policies.filter((p: any) =>
        p.penalty_percent === 0 || parseFloat(p.amount_charge || p.amount_show || '1') === 0
      )
      if (freePolicies.length > 0) {
        const last = freePolicies[freePolicies.length - 1]
        freeCancellation = last.end_at || null
      }
    }

    return { freeCancellation, policies, isNonRefundable }
  }

  // Nøkkelnavn → norsk
  const METAPOLICY_KEY_MAP: Record<string, string> = {
    add_fee: 'Tilleggsgebyr',
    check_in_check_out: 'Innsjekk-/utsjekkgebyr',
    children: 'Barn',
    children_meal: 'Barnemåltid',
    cot: 'Vugge/barneseng',
    deposit: 'Depositum',
    extra_bed: 'Ekstraseng',
    internet: 'Internett',
    meal: 'Måltid',
    no_show: 'No-show',
    parking: 'Parkering',
    pets: 'Kjæledyr',
    shuttle: 'Shuttlebuss',
    visa: 'Visum',
    credit_cards: 'Betalingskort',
    children_and_beds: 'Barn og senger',
    smoking: 'Røyking',
  }

  const INCLUSION_MAP: Record<string, string> = {
    included: 'Inkludert',
    not_included: 'Ikke inkludert',
    partially_included: 'Delvis inkludert',
  }

  const PRICE_UNIT_MAP: Record<string, string> = {
    per_guest_per_night: 'per gjest/natt',
    per_room_per_night: 'per rom/natt',
    per_guest: 'per gjest',
    per_room: 'per rom',
    per_stay: 'per opphold',
    per_hour: 'per time',
  }

  const TERRITORY_MAP: Record<string, string> = {
    on_side: 'På hotellet',
    off_side: 'Utenfor hotellet',
    nearby: 'Nærliggende',
  }

  const INTERNET_MAP: Record<string, string> = {
    wifi: 'Wi-Fi',
    wired: 'Kablet internett',
    both: 'Wi-Fi og kablet',
  }

  const MEAL_TYPE_MAP: Record<string, string> = {
    breakfast: 'Frokost',
    lunch: 'Lunsj',
    dinner: 'Middag',
    all_meals: 'Alle måltider',
  }

  const formatCurrency = (price: string, currency: string) =>
    new Intl.NumberFormat('nb-NO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(price))

  // Formater én policy-post til lesbare linjer
  const formatPolicyItem = (item: Record<string, any>): string => {
    const parts: string[] = []
    if (item.inclusion && item.inclusion !== 'unspecified') parts.push(INCLUSION_MAP[item.inclusion] ?? item.inclusion)
    if (item.price && item.currency) parts.push(formatCurrency(item.price, item.currency))
    if (item.price_unit && item.price_unit !== 'unspecified') parts.push(PRICE_UNIT_MAP[item.price_unit] ?? item.price_unit)
    if (item.amount && item.amount > 0) parts.unshift(`${item.amount} stk`)
    if (item.territory_type && item.territory_type !== 'unspecified') parts.push(TERRITORY_MAP[item.territory_type] ?? item.territory_type)
    if (item.internet_type && item.internet_type !== 'unspecified') parts.push(INTERNET_MAP[item.internet_type] ?? item.internet_type)
    if (item.meal_type && item.meal_type !== 'unspecified') parts.push(MEAL_TYPE_MAP[item.meal_type] ?? item.meal_type)
    if (item.check_in_check_out_type && item.check_in_check_out_type !== 'unspecified') parts.push(item.check_in_check_out_type)
    if (item.age_start !== undefined && item.age_end !== undefined) parts.push(`alder ${item.age_start}–${item.age_end} år`)
    return parts.join(' · ')
  }

  // Er en policy-verdi verdt å vise?
  const isMetapolicyEmpty = (value: unknown): boolean => {
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === 'object' && value !== null) {
      return Object.values(value as Record<string, unknown>).every(v => v === 'unspecified' || v === '' || v === null)
    }
    return !value
  }

  // Render én metapolicy-rad som JSX
  const renderMetapolicyEntry = (key: string, value: unknown) => {
    if (isMetapolicyEmpty(value)) return null
    const label = METAPOLICY_KEY_MAP[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    const items = Array.isArray(value) ? (value as Record<string, any>[]) : [value as Record<string, any>]
    const lines = items.map(formatPolicyItem).filter(Boolean)
    if (!lines.length) return null
    return (
      <div key={key} className="flex gap-3 py-2 border-b last:border-0">
        <span className="text-sm font-medium text-gray-700 w-40 shrink-0">{label}</span>
        <span className="text-sm text-gray-600">{lines.join(' | ')}</span>
      </div>
    )
  }

  // Formater datoer
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // Bildegalleri navigasjon
  const nextImage = () => {
    if (hotel?.images && hotel.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % hotel.images!.length)
    }
  }

  const prevImage = () => {
    if (hotel?.images && hotel.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + hotel.images!.length) % hotel.images!.length)
    }
  }

  const hasImages = hotel?.images && hotel.images.length > 0
  const currentImage = hasImages ? hotel!.images![currentImageIndex] : hotel?.image

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] w-[98vw] lg:max-w-[1200px] lg:w-[1200px] max-h-[98vh] h-[98vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 lg:px-10 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl lg:text-3xl font-bold">
            {hotel?.name || hotelName || 'Laster...'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Hotelldetaljer og bestillingsinformasjon
          </DialogDescription>
          {hotel && (
            <div className="flex flex-col gap-2 pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  {Array.from({ length: hotel.star_rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {hotel.address || 'Adresse ikke tilgjengelig'}
                </div>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 lg:px-10 py-6">
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-green-600" />
                  <p className="text-gray-600">Henter hotelldetaljer...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {hotel && !isLoading && !error && (
              <>
                {/* Image Gallery */}
                {currentImage && (
                  <div className="relative w-full h-[500px] lg:h-[600px] rounded-lg overflow-hidden mb-6 bg-gray-100 shadow-lg">
                    <Image
                      src={currentImage}
                      alt={hotel.name}
                      fill
                      className="object-cover"
                      sizes="95vw"
                      priority
                    />
                    
                    {/* Navigation Arrows */}
                    {hasImages && hotel.images!.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white h-12 w-12 rounded-full shadow-lg"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-8 w-8" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white h-12 w-12 rounded-full shadow-lg"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-8 w-8" />
                        </Button>
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-6 right-6 bg-black/70 text-white px-4 py-2 rounded-full text-base font-medium">
                          {currentImageIndex + 1} / {hotel.images!.length}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Thumbnail Strip */}
                {hasImages && hotel.images!.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto mb-6 pb-2">
                    {hotel.images!.slice(0, 10).map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-3 transition-all ${
                          currentImageIndex === idx
                            ? 'border-green-600 scale-110 shadow-lg'
                            : 'border-transparent hover:border-gray-400 hover:scale-105'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${hotel.name} - bilde ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </button>
                    ))}
                    {hotel.images!.length > 10 && (
                      <div className="flex-shrink-0 w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center text-base font-semibold text-gray-600">
                        +{hotel.images!.length - 10}
                      </div>
                    )}
                  </div>
                )}

                {/* Search Info */}
                <Card className="mb-6">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-gray-600">Innsjekk</p>
                          <p className="font-semibold">{formatDate(searchParams.checkIn)}</p>
                          {hotel.check_in_time && (
                            <p className="text-xs text-gray-500">Fra {hotel.check_in_time}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-gray-600">Utsjekk</p>
                          <p className="font-semibold">{formatDate(searchParams.checkOut)}</p>
                          {hotel.check_out_time && (
                            <p className="text-xs text-gray-500">Innen {hotel.check_out_time}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-gray-600">Gjester</p>
                          <p className="font-semibold">
                          {searchParams.adults} voksne
                          {searchParams.children.length > 0 && `, ${searchParams.children.length} barn`}
                        </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-gray-600">Rom</p>
                          <p className="font-semibold">{searchParams.rooms}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs for Rooms, Amenities, Description */}
                <Tabs defaultValue="rooms" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="rooms">Rom ({hotel.total_rooms})</TabsTrigger>
                    <TabsTrigger value="amenities">
                      Fasiliteter {hotel.amenity_groups && `(${hotel.amenity_groups.length})`}
                    </TabsTrigger>
                    <TabsTrigger value="reviews">
                      Anmeldelser {googleReviews?.totalRatings ? `(${googleReviews.totalRatings.toLocaleString('nb-NO')})` : ''}
                    </TabsTrigger>
                    <TabsTrigger value="info">Info</TabsTrigger>
                  </TabsList>

                  {/* Rooms Tab */}
                  <TabsContent value="rooms">
                    <div>
                      {hotel.rooms.length === 0 && (
                        <Card>
                          <CardContent className="py-12 text-center">
                            <p className="text-gray-600">Ingen ledige rom for de valgte datoene</p>
                          </CardContent>
                        </Card>
                      )}

                      <div className="space-y-4">
                    {hotel.rooms.map((room, index) => {
                      const nonIncludedTaxes = getNonIncludedTaxes(room)
                      const cancellationInfo = parseCancellationInfo(room)
                      const nights = Math.ceil((new Date(searchParams.checkOut).getTime() - new Date(searchParams.checkIn).getTime()) / (1000 * 60 * 60 * 24))
                      const roomImgIdx = getRoomImageIndex(index)
                      const roomImgs = room.images || []
                      const showCancellation = expandedCancellation[index]


                      return (
                      <Card key={index} className="hover:shadow-md transition-shadow overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                        {/* Rombildekarusell – venstre kolonne på desktop */}
                        {roomImgs.length > 0 && (
                          <div className="relative md:w-56 lg:w-64 shrink-0 bg-gray-100">
                            {/* aspect-[4/3] matcher RateHawk sine 640×480 bilder eksakt */}
                            <div className="aspect-[4/3] md:aspect-auto md:h-full relative">
                            <img
                              src={roomImgs[roomImgIdx]}
                              alt={`${room.room_name} – bilde ${roomImgIdx + 1}`}
                              className="w-full h-full object-contain bg-gray-100"
                              onError={(e) => {
                                console.error('🚫 Image load FAILED:', roomImgs[roomImgIdx])
                                ;(e.target as HTMLImageElement).style.display = 'none'
                              }}
                              onLoad={() => console.log('✅ Image load OK:', roomImgs[roomImgIdx])}
                            />
                            {roomImgs.length > 1 && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setRoomImageIndex(index, (roomImgIdx - 1 + roomImgs.length) % roomImgs.length)}
                                  className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRoomImageIndex(index, (roomImgIdx + 1) % roomImgs.length)}
                                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                                  {roomImgIdx + 1}/{roomImgs.length}
                                </div>
                              </>
                            )}
                            </div>
                          </div>
                        )}

                        {/* Rom-info – høyre kolonne */}
                        <CardContent className="pt-4 pb-4 flex-1 min-w-0">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            {/* Rom-info – venstre del */}
                            <div className="flex-1 min-w-0">
                              {/* Romtittel + klasse */}
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h4 className="text-base font-semibold leading-tight">{translateRoomName(room.room_name)}</h4>
                                {getRoomClass(room.rg_ext) && (
                                  <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium shrink-0">
                                    {getRoomClass(room.rg_ext)}
                                  </Badge>
                                )}
                              </div>

                              {/* Nøkkeldetaljer – liten ikonrad */}
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 mb-3">
                                {/* Senger */}
                                {(room.rg_ext.bedrooms ?? 0) > 0 && (
                                  <span className="flex items-center gap-1.5">
                                    <span className="text-gray-400">🛏</span>
                                    {room.rg_ext.bedrooms} soverom
                                  </span>
                                )}
                                {/* Sengetype */}
                                {(room.bedding_desc || getBedding(room.rg_ext)) && (
                                  <span className="flex items-center gap-1.5">
                                    <span className="text-gray-400">🛏</span>
                                    {room.bedding_desc ? translateBeddingDesc(room.bedding_desc) : getBedding(room.rg_ext)}
                                  </span>
                                )}
                                {/* Kapasitet */}
                                {room.capacity > 0 && (
                                  <span className="flex items-center gap-1.5">
                                    <Users className="h-3 w-3 text-gray-400 shrink-0" />
                                    Maks {room.capacity} gjest{room.capacity !== 1 ? 'er' : ''}
                                  </span>
                                )}
                                {/* Bad */}
                                {getBathroom(room.rg_ext) && (
                                  <span className="flex items-center gap-1.5">
                                    <span className="text-gray-400">🛁</span>
                                    {getBathroom(room.rg_ext)}
                                    {room.bathroom_desc && (
                                      <span className="text-gray-400">({translateBathroomDesc(room.bathroom_desc)})</span>
                                    )}
                                  </span>
                                )}
                                {/* Størrelse */}
                                {room.size_sqm && (
                                  <span className="flex items-center gap-1.5">
                                    <span className="text-gray-400">📐</span>
                                    {room.size_sqm} m²
                                  </span>
                                )}
                                {/* Balkong */}
                                {(room.rg_ext.balcony ?? 0) > 0 && (
                                  <span className="flex items-center gap-1.5">
                                    <span className="text-gray-400">🌿</span>
                                    Balkong
                                  </span>
                                )}
                                {/* Etasje */}
                                {(room.rg_ext.floor ?? 0) > 0 && (
                                  <span className="flex items-center gap-1.5">
                                    <span className="text-gray-400">🏢</span>
                                    {room.rg_ext.floor}. etasje
                                  </span>
                                )}
                                {/* Familierom */}
                                {(room.rg_ext.family ?? 0) > 0 && (
                                  <span className="flex items-center gap-1.5">
                                    <span className="text-gray-400">👨‍👩‍👧</span>
                                    Familierom
                                  </span>
                                )}
                                {/* Utsikt */}
                                {room.view && (
                                  <span className="flex items-center gap-1.5 col-span-2">
                                    <span className="text-gray-400">🪟</span>
                                    {room.view}
                                  </span>
                                )}
                              </div>

                              {/* Måltid + kansellerings-status */}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mb-3">
                                <span className="flex items-center gap-1 text-green-700 font-medium">
                                  <Utensils className="h-3.5 w-3.5" />
                                  {getMealText(room.meal_data)}
                                  {room.meal_data?.no_child_meal && (
                                    <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-300 px-1 py-0">
                                      Ikke barn
                                    </Badge>
                                  )}
                                </span>
                                {cancellationInfo?.isNonRefundable ? (
                                  <span className="flex items-center gap-1 text-red-600 font-medium text-sm">
                                    <X className="h-3.5 w-3.5" /> Ikke refunderbar
                                  </span>
                                ) : cancellationInfo?.freeCancellation ? (
                                  <span className="flex items-center gap-1 text-green-700 font-medium text-sm">
                                    <Check className="h-3.5 w-3.5" />
                                    Gratis avbestilling til{' '}
                                    <strong>
                                      {new Date(cancellationInfo.freeCancellation).toLocaleString('nb-NO', {
                                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                      })} UTC+0
                                    </strong>
                                  </span>
                                ) : null}
                              </div>

                              {/* Avbestillingsregler – ekspanderbar; vises alltid når policyer finnes */}
                              {cancellationInfo && !cancellationInfo.isNonRefundable && cancellationInfo.policies.length > 0 && (
                                <div className="mb-3">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedCancellation(prev => ({ ...prev, [index]: !prev[index] }))}
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                                  >
                                    <Info className="h-3.5 w-3.5" />
                                    Avbestillingsregler {showCancellation ? '▲' : '▼'}
                                  </button>
                                  {showCancellation && cancellationInfo.policies && (
                                    <div className="mt-1.5 border border-blue-100 rounded overflow-hidden text-xs">
                                      <div className="bg-blue-50 px-2 py-1 font-semibold text-blue-800 grid grid-cols-2">
                                        <span>Periode</span>
                                        <span className="text-right">Gebyr</span>
                                      </div>
                                      {cancellationInfo.policies.map((p: any, pi: number) => {
                                        const fee = parseFloat(p.amount_show || p.amount_charge || '0')
                                        const isFree = fee === 0
                                        return (
                                          <div key={pi} className={`px-2 py-1.5 grid grid-cols-2 border-t border-blue-50 ${isFree ? 'text-green-700' : 'text-red-700'}`}>
                                            <span className="text-gray-700">
                                              {p.end_at && !p.start_at
                                                ? `Før ${new Date(p.end_at).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                                                : p.start_at && !p.end_at
                                                  ? `Etter ${new Date(p.start_at).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                                                  : p.start_at && p.end_at
                                                    ? `${new Date(p.start_at).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })} – ${new Date(p.end_at).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })}`
                                                    : 'Alltid'}
                                            </span>
                                            <span className={`text-right font-semibold ${isFree ? 'text-green-700' : 'text-red-600'}`}>
                                              {isFree
                                                ? 'Gratis'
                                                : new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(fee)}
                                            </span>
                                          </div>
                                        )
                                      })}
                                      <div className="px-2 py-1 bg-gray-50 text-[10px] text-gray-500 border-t border-blue-50">
                                        Alle tider er UTC+0. Romprisen betales fullt ved bestilling.
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Fasiliteter – viser alle i kompakt grid */}
                              {(() => {
                                const allFeatures = [
                                  ...room.amenities,
                                  ...room.facilities_trans.filter(f => f && !room.amenities.includes(f))
                                ]
                                return allFeatures.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {allFeatures.map((f, i) => (
                                      <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
                                        {f}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : null
                              })()}

                              {room.allotment > 0 && room.allotment <= 5 && (
                                <p className="text-xs text-orange-600 font-medium mt-2">
                                  Kun {room.allotment} rom igjen!
                                </p>
                              )}
                            </div>

                            {/* Pris & Handling */}
                            <div className="lg:min-w-[220px] shrink-0">
                              {(() => {
                                const pt = room.payment_options?.payment_types?.[0]
                                const currency = pt?.show_currency_code || pt?.currency_code || 'NOK'
                                const totalAmount = parseFloat(pt?.show_amount || pt?.amount || '0')
                                  || room.daily_prices.reduce((s: number, d: any) => s + parseFloat(d || 0), 0)
                                const perNight = nights > 0 ? totalAmount / nights : totalAmount
                                const fmt = (v: number, cur = currency) =>
                                  new Intl.NumberFormat('nb-NO', { style: 'currency', currency: cur, maximumFractionDigits: 2 }).format(v)

                                // Inkluderte skatter (allerede i prisen) – vis som info
                                const allTaxes: any[] = pt?.tax_data?.taxes || room.tax_data?.taxes || []
                                const includedTaxes = allTaxes.filter((t: any) => t.included_by_supplier === true && t.currency_code === currency)
                                const includedTaxTotal = includedTaxes.reduce((s: number, t: any) => s + parseFloat(t.amount || '0'), 0)

                                return (
                                  <div className="border border-gray-200 rounded-lg p-3 text-sm bg-white">
                                    <p className="font-semibold text-gray-800 mb-2 text-xs uppercase tracking-wide">Prisinformasjon</p>

                                    {/* Rompris per natt × netter */}
                                    <div className="flex justify-between gap-3 text-gray-700">
                                      <span>{nights} {nights === 1 ? 'natt' : 'netter'} × 1 rom × {fmt(perNight)}</span>
                                      <span className="font-medium whitespace-nowrap">{fmt(totalAmount)}</span>
                                    </div>

                                    {/* Inkluderte skatter */}
                                    {includedTaxTotal > 0 && (
                                      <div className="flex justify-between gap-3 text-gray-500 mt-1 text-xs">
                                        <span>
                                          {includedTaxes.map((t: any) => getTaxName(t.name)).join(', ')} (inkl.)
                                        </span>
                                        <span className="whitespace-nowrap">{fmt(includedTaxTotal)}</span>
                                      </div>
                                    )}

                                    {/* Separator + Total */}
                                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between gap-3 font-bold text-gray-900">
                                      <span>Totalt</span>
                                      <span className="text-green-600 text-lg whitespace-nowrap">{fmt(totalAmount)}</span>
                                    </div>

                                    {/* Ikke-inkluderte avgifter — betales ved innsjekk */}
                                    {nonIncludedTaxes.length > 0 && (
                                      <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                                        <p className="text-xs text-orange-700 font-medium mb-1">Betales ved innsjekk:</p>
                                        {nonIncludedTaxes.map((tax: any, i: number) => (
                                          <div key={i} className="flex justify-between gap-2 text-xs text-gray-600">
                                            <span>{getTaxName(tax.name)}</span>
                                            <span className="font-medium whitespace-nowrap">
                                              {formatTaxAmount(tax.amount, tax.currency_code)}
                                            </span>
                                          </div>
                                        ))}
                                        <p className="text-[10px] text-gray-400 mt-1">
                                          Kreves inn direkte av hotellet ved innsjekk.
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )
                              })()}

                              <Button
                                className="bg-green-600 hover:bg-green-700 w-full"
                                onClick={() => {
                                  setSelectedRoom(room)
                                  setBookingDialogOpen(true)
                                }}
                              >
                                Velg dette rommet
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                        </div>{/* end flex row */}
                      </Card>
                      )
                    })}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Amenities Tab */}
                  <TabsContent value="amenities">
                    {hotel.amenity_groups && hotel.amenity_groups.length > 0 ? (
                      <div className="space-y-6">
                        {hotel.amenity_groups.map((group, groupIdx) => (
                          <Card key={groupIdx}>
                            <CardHeader>
                              <CardTitle className="text-lg">{group.group_name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {group.amenities.map((amenity: any, amenityIdx: number) => (
                                  <div key={amenityIdx} className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                                    <span className="text-sm">{amenity.name}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="py-12 text-center">
                          <p className="text-gray-600">Ingen fasiliteter tilgjengelig</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Reviews Tab */}
                  <TabsContent value="reviews">
                    {reviewsLoading ? (
                      <Card>
                        <CardContent className="py-12 text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">Henter anmeldelser…</p>
                        </CardContent>
                      </Card>
                    ) : !reviewsFetched ? (
                      <Card>
                        <CardContent className="py-12 text-center">
                          <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">Hent anmeldelser fra Google for dette hotellet</p>
                          <Button variant="outline" onClick={fetchGoogleReviews}>
                            Vis Google-anmeldelser
                          </Button>
                        </CardContent>
                      </Card>
                    ) : googleReviews && googleReviews.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {/* Google-sammendrag */}
                        <Card className="bg-gray-50 border-gray-200">
                          <CardContent className="py-4 flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-3xl font-bold text-gray-900">{googleReviews.rating.toFixed(1)}</p>
                              <div className="flex items-center gap-0.5 my-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.round(googleReviews.rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-gray-500">{googleReviews.totalRatings.toLocaleString('nb-NO')} anmeldelser</p>
                            </div>
                            <div className="flex-1 text-sm text-gray-600">
                              <p className="font-medium text-gray-800 mb-0.5">Google-anmeldelser</p>
                              <p className="text-xs">Viser {googleReviews.reviews.length} av {googleReviews.totalRatings.toLocaleString('nb-NO')} anmeldelser</p>
                            </div>
                            <img src="https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg" alt="Google" className="h-5 opacity-70" />
                          </CardContent>
                        </Card>

                        {/* Individuelle anmeldelser */}
                        {googleReviews.reviews.map((review, idx) => (
                          <Card key={idx}>
                            <CardContent className="pt-5 pb-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  {review.authorPhotoUrl ? (
                                    <img
                                      src={review.authorPhotoUrl}
                                      alt={review.author}
                                      className="w-9 h-9 rounded-full object-cover"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-sm">
                                      {review.author.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-semibold text-sm">{review.author}</p>
                                    <p className="text-xs text-gray-400">{review.relativeTime}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3.5 w-3.5 ${
                                        i < review.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">{review.text}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="py-12 text-center">
                          <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-600">Ingen anmeldelser funnet for dette hotellet</p>
                          <p className="text-xs text-gray-400 mt-1">Anmeldelser hentes fra Google</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Info Tab */}
                  <TabsContent value="info">
                    <Card>
                      <CardHeader>
                        <CardTitle>Om hotellet</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {hotel.description ? (
                          <div className="prose prose-sm max-w-none">
                            {typeof hotel.description === 'string' ? (
                              <p>{hotel.description}</p>
                            ) : (
                              <div>
                                {hotel.description.title && (
                                  <h3 className="text-lg font-semibold mb-2">{hotel.description.title}</h3>
                                )}
                                {hotel.description.text && <p>{hotel.description.text}</p>}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-600">Ingen beskrivelse tilgjengelig</p>
                        )}

                        {(hotel.check_in_time || hotel.check_out_time) && (
                          <>
                            <Separator className="my-4" />
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">Inn- og utsjekkingstider</h4>
                              {hotel.check_in_time && (
                                <p className="text-sm text-gray-600">
                                  <strong>Innsjekking:</strong> Fra {hotel.check_in_time}
                                </p>
                              )}
                              {hotel.check_out_time && (
                                <p className="text-sm text-gray-600">
                                  <strong>Utsjekking:</strong> Innen {hotel.check_out_time}
                                </p>
                              )}
                            </div>
                          </>
                        )}

                        {/* metapolicy_struct */}
                        {hotel.metapolicy_struct && Object.keys(hotel.metapolicy_struct).length > 0 && (
                          <>
                            <Separator className="my-4" />
                            <div>
                              <h4 className="font-semibold text-sm mb-3">Hotellregler og tilleggsgebyrer</h4>
                              <div>
                                {Object.entries(hotel.metapolicy_struct).map(([key, value]) =>
                                  renderMetapolicyEntry(key, value)
                                )}
                              </div>
                            </div>
                          </>
                        )}

                        {/* metapolicy_extra_info */}
                        {hotel.metapolicy_extra_info && (
                          <>
                            <Separator className="my-4" />
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Viktig informasjon</h4>
                              <p className="text-sm text-gray-600 whitespace-pre-wrap">{hotel.metapolicy_extra_info}</p>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>

        {/* Booking Dialog */}
        {selectedRoom && (
          <HotelBookingDialog
            open={bookingDialogOpen}
            onOpenChange={setBookingDialogOpen}
            roomData={{
              book_hash: selectedRoom.book_hash,
              room_name: selectedRoom.room_name,
              hotel_name: hotel?.name || hotelName || '',
              checkIn: searchParams.checkIn,
              checkOut: searchParams.checkOut,
              adults: searchParams.adults,
              children: Array.isArray(searchParams.children) ? searchParams.children : [],
              rooms: searchParams.rooms,
              totalPrice: formatPrice(selectedRoom.daily_prices)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

