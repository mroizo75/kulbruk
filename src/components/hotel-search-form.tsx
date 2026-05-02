'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Users, Calendar, Minus, Plus, Search, X, Globe, Building2, BedDouble, Landmark, TrendingUp } from 'lucide-react'
import { RateHawkDestination } from '@/lib/types'

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

interface HotelSearchFormProps {
  onSearch: (data: HotelSearchFormData) => void
  isLoading?: boolean
}

const MAX_ADULTS_PER_ROOM = 6
const MAX_CHILDREN_PER_ROOM = 4
const MAX_GUESTS_PER_ROOM = 10

const COUNTRY_NAMES: Record<string, string> = {
  NO: 'Norge', SE: 'Sverige', DK: 'Danmark', FI: 'Finland',
  GB: 'Storbritannia', US: 'USA', DE: 'Tyskland', FR: 'Frankrike',
  NL: 'Nederland', ES: 'Spania', IT: 'Italia', PL: 'Polen',
  RU: 'Russland', CN: 'Kina', JP: 'Japan', AU: 'Australia',
  CA: 'Canada', AT: 'Østerrike', CH: 'Sveits', BE: 'Belgia',
  PT: 'Portugal', GR: 'Hellas', CZ: 'Tsjekkia', HU: 'Ungarn',
  TH: 'Thailand', AE: 'UAE', TR: 'Tyrkia', MX: 'Mexico',
  BR: 'Brasil', ZA: 'Sør-Afrika', IN: 'India', SG: 'Singapore',
  ID: 'Indonesia', MY: 'Malaysia', PH: 'Filippinene', VN: 'Vietnam',
}

const POPULAR_DESTINATIONS: RateHawkDestination[] = [
  { id: '2563', name: 'Oslo', type: 'city', country: 'NO' },
  { id: '1953', name: 'København', type: 'city', country: 'DK' },
  { id: '1775', name: 'Paris', type: 'city', country: 'FR' },
  { id: '1869', name: 'London', type: 'city', country: 'GB' },
  { id: '1382', name: 'Berlin', type: 'city', country: 'DE' },
  { id: '1783', name: 'Amsterdam', type: 'city', country: 'NL' },
]

function DestinationIcon({ type, className }: { type: string; className?: string }) {
  if (type === 'hotel') return <BedDouble className={className} />
  if (type === 'landmark') return <Landmark className={className} />
  return <Building2 className={className} />
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return <span>{text}</span>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <span>{text}</span>
  return (
    <span>
      {text.slice(0, idx)}
      <strong className="text-blue-700">{text.slice(idx, idx + query.length)}</strong>
      {text.slice(idx + query.length)}
    </span>
  )
}

function countryLabel(country?: string) {
  if (!country) return null
  return COUNTRY_NAMES[country.toUpperCase()] ?? country
}

const RESIDENCY_OPTIONS = [
  { value: 'no', label: 'Norge' },
  { value: 'se', label: 'Sverige' },
  { value: 'dk', label: 'Danmark' },
  { value: 'fi', label: 'Finland' },
  { value: 'gb', label: 'Storbritannia' },
  { value: 'us', label: 'USA' },
  { value: 'de', label: 'Tyskland' },
  { value: 'fr', label: 'Frankrike' },
  { value: 'nl', label: 'Nederland' },
  { value: 'es', label: 'Spania' },
  { value: 'it', label: 'Italia' },
  { value: 'pl', label: 'Polen' },
  { value: 'ru', label: 'Russland' },
  { value: 'cn', label: 'Kina' },
  { value: 'jp', label: 'Japan' },
  { value: 'au', label: 'Australia' },
  { value: 'ca', label: 'Canada' },
]

export default function HotelSearchForm({ onSearch, isLoading = false }: HotelSearchFormProps) {
  const [destinationId, setDestinationId] = useState('')
  const [destinationQuery, setDestinationQuery] = useState('')
  const [destinationType, setDestinationType] = useState('')
  const [destinations, setDestinations] = useState<RateHawkDestination[]>([])
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false)
  const [isSearchingDestination, setIsSearchingDestination] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  const [rooms, setRooms] = useState<RoomConfig[]>([{ adults: 2, childAges: [] }])
  const [residency, setResidency] = useState('no')
  const [currency, setCurrency] = useState('NOK')

  const [showGuestDropdown, setShowGuestDropdown] = useState(false)
  const [formError, setFormError] = useState('')

  const destinationRef = useRef<HTMLDivElement>(null)
  const destinationInputRef = useRef<HTMLInputElement>(null)
  const guestRef = useRef<HTMLDivElement>(null)

  const searchDestinations = useCallback(async (query: string) => {
    try {
      const response = await fetch(`/api/hotels/destinations?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.destinations) return data.destinations as RateHawkDestination[]
      }
    } catch {
      // ignorer søkefeil
    }
    return []
  }, [])

  const visibleDestinations = destinationQuery.trim().length === 0
    ? POPULAR_DESTINATIONS
    : destinations

  useEffect(() => {
    if (!destinationQuery.trim()) {
      setDestinations([])
      setIsSearchingDestination(false)
      return
    }
    const timeoutId = setTimeout(async () => {
      setIsSearchingDestination(true)
      const results = await searchDestinations(destinationQuery.trim())
      setDestinations(results.slice(0, 10))
      setIsSearchingDestination(false)
    }, 250)
    return () => clearTimeout(timeoutId)
  }, [destinationQuery, searchDestinations])

  useEffect(() => {
    setActiveIndex(-1)
  }, [visibleDestinations.length])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationDropdown(false)
      }
      if (guestRef.current && !guestRef.current.contains(event.target as Node)) {
        setShowGuestDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDestinationSelect = (dest: RateHawkDestination) => {
    setDestinationId(dest.id)
    const label = dest.country
      ? `${dest.name}, ${countryLabel(dest.country) ?? dest.country}`
      : dest.name
    setDestinationQuery(label)
    setDestinationType(dest.type)
    setShowDestinationDropdown(false)
    setActiveIndex(-1)
    setFormError('')
  }

  const handleDestinationClear = () => {
    setDestinationId('')
    setDestinationQuery('')
    setDestinationType('')
    setActiveIndex(-1)
    destinationInputRef.current?.focus()
  }

  const handleDestinationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDestinationDropdown || visibleDestinations.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => Math.min(prev + 1, visibleDestinations.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleDestinationSelect(visibleDestinations[activeIndex])
    } else if (e.key === 'Escape') {
      setShowDestinationDropdown(false)
      setActiveIndex(-1)
    }
  }

  // Rom-hjelpere
  const updateRoom = (roomIdx: number, update: Partial<RoomConfig>) => {
    setRooms(prev => prev.map((r, i) => i === roomIdx ? { ...r, ...update } : r))
  }

  const addRoom = () => {
    if (rooms.length < 9) setRooms(prev => [...prev, { adults: 1, childAges: [] }])
  }

  const removeRoom = (roomIdx: number) => {
    if (rooms.length > 1) setRooms(prev => prev.filter((_, i) => i !== roomIdx))
  }

  const addAdult = (roomIdx: number) => {
    const r = rooms[roomIdx]
    if (r.adults + r.childAges.length < MAX_GUESTS_PER_ROOM && r.adults < MAX_ADULTS_PER_ROOM) {
      updateRoom(roomIdx, { adults: r.adults + 1 })
    }
  }

  const removeAdult = (roomIdx: number) => {
    const r = rooms[roomIdx]
    if (r.adults > 1) updateRoom(roomIdx, { adults: r.adults - 1 })
  }

  const addChild = (roomIdx: number) => {
    const r = rooms[roomIdx]
    if (r.childAges.length < MAX_CHILDREN_PER_ROOM && r.adults + r.childAges.length < MAX_GUESTS_PER_ROOM) {
      updateRoom(roomIdx, { childAges: [...r.childAges, 5] })
    }
  }

  const removeChild = (roomIdx: number) => {
    const r = rooms[roomIdx]
    if (r.childAges.length > 0) updateRoom(roomIdx, { childAges: r.childAges.slice(0, -1) })
  }

  const setChildAge = (roomIdx: number, childIdx: number, age: number) => {
    const newAges = [...rooms[roomIdx].childAges]
    newAges[childIdx] = age
    updateRoom(roomIdx, { childAges: newAges })
  }

  const totalGuests = rooms.reduce((s, r) => s + r.adults + r.childAges.length, 0)
  const guestSummary = `${totalGuests} gjest${totalGuests !== 1 ? 'er' : ''}, ${rooms.length} rom`

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    console.log('[FORM] handleSubmit trigget', {
      destinationId,
      destinationType,
      destinationQuery,
      destinationsCount: destinations.length,
      checkIn,
      checkOut,
    })

    // Auto-velg første treff hvis bruker ikke har klikket på liste-element.
    // Setter ALDRI destinationType='hotel' ved auto-velg – bruker må eksplisitt velge hotell
    // fra listen for at direktevisning skal trigges.
    let activeDestinationId = destinationId
    let activeDestinationType = destinationType
    const fallbackList = visibleDestinations
    if (!activeDestinationId && fallbackList.length > 0) {
      const first = fallbackList[0]
      activeDestinationId = first.id
      activeDestinationType = first.type === 'hotel' ? '' : first.type
      setDestinationId(first.id)
      setDestinationType(activeDestinationType)
      const label = first.country
        ? `${first.name}, ${countryLabel(first.country) ?? first.country}`
        : first.name
      setDestinationQuery(label)
      console.log('[FORM] Auto-valgte første destinasjon:', { id: first.id, type: first.type, activeDestinationType })
    }

    if (!activeDestinationId) {
      console.warn('[FORM] STOPP: destinationId mangler')
      setFormError('Skriv inn en destinasjon og velg fra listen')
      return
    }
    if (!checkIn) {
      console.warn('[FORM] STOPP: checkIn mangler')
      setFormError('Velg innsjekk-dato')
      return
    }
    if (!checkOut) {
      console.warn('[FORM] STOPP: checkOut mangler')
      setFormError('Velg utsjekk-dato')
      return
    }
    if (checkOut <= checkIn) {
      console.warn('[FORM] STOPP: checkOut <= checkIn', { checkIn, checkOut })
      setFormError('Utsjekk må være etter innsjekk')
      return
    }

    console.log('[FORM] Validering OK – kaller onSearch', {
      destination: activeDestinationId,
      destinationType: activeDestinationType,
      checkIn,
      checkOut,
      rooms,
    })
    setShowDestinationDropdown(false)
    onSearch({ destination: activeDestinationId, destinationLabel: destinationQuery, destinationType: activeDestinationType, checkIn, checkOut, rooms, residency, currency })
  }

  const today = new Date().toISOString().split('T')[0]
  const minCheckOut = checkIn
    ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0]
    : today

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-6 md:p-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Finn ditt drømmehotell</h2>
        <p className="text-gray-600">Søk og sammenlign hoteller fra hele verden</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {formError}
          </div>
        )}

        <div className="flex flex-col xl:flex-row xl:items-end gap-3">
          {/* Destinasjon */}
          <div className="flex-1 min-w-0" ref={destinationRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <MapPin className="h-4 w-4 text-blue-600" />
              Destinasjon
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                ref={destinationInputRef}
                type="text"
                placeholder="Hvor skal du reise?"
                value={destinationQuery}
                onChange={(e) => {
                  setDestinationQuery(e.target.value)
                  if (destinationId) {
                    setDestinationId('')
                    setDestinationType('')
                  }
                  setShowDestinationDropdown(true)
                }}
                onFocus={() => setShowDestinationDropdown(true)}
                onKeyDown={handleDestinationKeyDown}
                className="h-12 pl-9 pr-9 border-2 border-gray-200 focus:border-blue-500 text-sm"
                autoComplete="off"
                spellCheck={false}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isSearchingDestination && (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
                {destinationQuery && !isSearchingDestination && (
                  <button
                    type="button"
                    onClick={handleDestinationClear}
                    className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100"
                    tabIndex={-1}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {showDestinationDropdown && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden mt-1.5"
                  style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                >
                  {/* Overskrift */}
                  {!destinationQuery.trim() && (
                    <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Populære destinasjoner
                    </div>
                  )}
                  {destinationQuery.trim() && isSearchingDestination && destinations.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      Søker...
                    </div>
                  )}
                  {visibleDestinations.length > 0 && (
                    <ul role="listbox">
                      {visibleDestinations.map((dest, idx) => {
                        const country = countryLabel(dest.country)
                        const isHotel = dest.type === 'hotel'
                        const isActive = idx === activeIndex
                        return (
                          <li
                            key={dest.id}
                            role="option"
                            aria-selected={isActive}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              handleDestinationSelect(dest)
                            }}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${
                              isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                              isHotel
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-blue-50 text-blue-600'
                            }`}>
                              <DestinationIcon type={dest.type} className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {highlightMatch(dest.name, destinationQuery)}
                              </div>
                              {country && (
                                <div className="text-xs text-gray-500 mt-0.5">{country}</div>
                              )}
                              {isHotel && !country && (
                                <div className="text-xs text-gray-500 mt-0.5">Hotell</div>
                              )}
                            </div>
                            {!isHotel && (
                              <span className="text-xs text-gray-400 shrink-0 bg-gray-100 px-2 py-0.5 rounded-full">
                                By
                              </span>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                  {destinationQuery.trim() && !isSearchingDestination && visibleDestinations.length === 0 && (
                    <div className="px-4 py-4 text-sm text-gray-500 text-center">
                      Ingen resultater for &quot;{destinationQuery}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Innsjekk */}
          <div className="w-full xl:w-40 shrink-0">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Calendar className="h-4 w-4 text-blue-600" />
              Innsjekk
            </label>
            <Input
              type="date"
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value)
                if (checkOut && e.target.value >= checkOut) setCheckOut('')
              }}
              min={today}
              className="h-12 border-2 border-gray-200 focus:border-blue-500"
            />
          </div>

          {/* Utsjekk */}
          <div className="w-full xl:w-40 shrink-0">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Calendar className="h-4 w-4 text-blue-600" />
              Utsjekk
            </label>
            <Input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={minCheckOut}
              className="h-12 border-2 border-gray-200 focus:border-blue-500"
            />
          </div>

          {/* Gjester / Rom */}
          <div className="w-full xl:w-52 shrink-0" ref={guestRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Users className="h-4 w-4 text-blue-600" />
              Gjester
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                className="w-full h-12 flex items-center text-left pl-3 pr-3 text-sm border-2 border-gray-200 rounded-md focus:border-blue-500 hover:border-gray-300 bg-white"
              >
                {guestSummary}
              </button>

              {showGuestDropdown && (
                <div className="absolute top-full left-0 z-50 bg-white border-2 border-gray-200 rounded-xl shadow-2xl p-4 mt-1 min-w-[320px]">
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {rooms.map((room, roomIdx) => (
                      <div key={roomIdx} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-sm text-gray-800">Rom {roomIdx + 1}</span>
                          {rooms.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRoom(roomIdx)}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              Fjern
                            </button>
                          )}
                        </div>

                        {/* Voksne */}
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="text-sm font-medium text-gray-700">Voksne</div>
                            <div className="text-xs text-gray-400">18+ år</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => removeAdult(roomIdx)}
                              disabled={room.adults <= 1}
                              className="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-blue-500 flex items-center justify-center disabled:opacity-30"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="font-semibold w-5 text-center">{room.adults}</span>
                            <button
                              type="button"
                              onClick={() => addAdult(roomIdx)}
                              disabled={room.adults >= MAX_ADULTS_PER_ROOM || room.adults + room.childAges.length >= MAX_GUESTS_PER_ROOM}
                              className="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-blue-500 flex items-center justify-center disabled:opacity-30"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Barn */}
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="text-sm font-medium text-gray-700">Barn</div>
                            <div className="text-xs text-gray-400">0–17 år</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => removeChild(roomIdx)}
                              disabled={room.childAges.length <= 0}
                              className="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-blue-500 flex items-center justify-center disabled:opacity-30"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="font-semibold w-5 text-center">{room.childAges.length}</span>
                            <button
                              type="button"
                              onClick={() => addChild(roomIdx)}
                              disabled={room.childAges.length >= MAX_CHILDREN_PER_ROOM || room.adults + room.childAges.length >= MAX_GUESTS_PER_ROOM}
                              className="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-blue-500 flex items-center justify-center disabled:opacity-30"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Aldersvalg per barn */}
                        {room.childAges.length > 0 && (
                          <div className="mt-2 space-y-1.5 border-t pt-2">
                            {room.childAges.map((age, childIdx) => (
                              <div key={childIdx} className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-14 shrink-0">Barn {childIdx + 1}:</span>
                                <select
                                  value={age}
                                  onChange={(e) => setChildAge(roomIdx, childIdx, parseInt(e.target.value))}
                                  className="flex-1 h-7 text-xs border border-gray-300 rounded px-2"
                                >
                                  {Array.from({ length: 18 }, (_, i) => (
                                    <option key={i} value={i}>{i === 0 ? 'Under 1 år' : `${i} år`}</option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-1.5 text-xs text-gray-400 text-right">
                          {room.adults + room.childAges.length}/{MAX_GUESTS_PER_ROOM} gjester per rom
                        </div>
                      </div>
                    ))}

                    {rooms.length < 9 && (
                      <button
                        type="button"
                        onClick={addRoom}
                        className="w-full py-2 text-sm text-blue-600 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50"
                      >
                        + Legg til rom
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statsborgerskap */}
          <div className="w-full xl:w-36 shrink-0">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Globe className="h-4 w-4 text-blue-600" />
              Statsborgerskap
            </label>
            <select
              value={residency}
              onChange={(e) => setResidency(e.target.value)}
              className="w-full h-12 text-sm border-2 border-gray-200 rounded-md focus:border-blue-500 px-2 bg-white"
            >
              {RESIDENCY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Valuta */}
          <div className="w-full xl:w-24 shrink-0">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Valuta</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full h-12 text-sm border-2 border-gray-200 rounded-md focus:border-blue-500 px-2 bg-white"
            >
              <option value="NOK">NOK</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="SEK">SEK</option>
              <option value="DKK">DKK</option>
            </select>
          </div>

          {/* Søk-knapp */}
          <div className="w-full xl:w-28 shrink-0">
            <div className="hidden xl:block h-[28px]" />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Søker...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
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
