'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MapPin, Users, Calendar, Minus, Plus, Search, X, Globe } from 'lucide-react'
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

  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  const [rooms, setRooms] = useState<RoomConfig[]>([{ adults: 2, childAges: [] }])
  const [residency, setResidency] = useState('no')
  const [currency, setCurrency] = useState('NOK')

  const [showGuestDropdown, setShowGuestDropdown] = useState(false)
  const [formError, setFormError] = useState('')

  const destinationRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setIsSearchingDestination(true)
      const results = await searchDestinations(destinationQuery.trim())
      setDestinations(results.slice(0, 12))
      setIsSearchingDestination(false)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [destinationQuery, searchDestinations])

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
    setDestinationQuery(dest.name)
    setDestinationType(dest.type)
    setShowDestinationDropdown(false)
    setFormError('')
  }

  const handleDestinationClear = () => {
    setDestinationId('')
    setDestinationQuery('')
    setDestinationType('')
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
    if (!activeDestinationId && destinations.length > 0) {
      const first = destinations[0]
      activeDestinationId = first.id
      activeDestinationType = first.type === 'hotel' ? '' : first.type
      setDestinationId(first.id)
      setDestinationType(activeDestinationType)
      setDestinationQuery(first.name)
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
              <Input
                type="text"
                placeholder="Søk etter by eller hotell..."
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
                className="h-12 pr-8 border-2 border-gray-200 focus:border-blue-500"
                autoComplete="off"
              />
              {destinationId && (
                <button
                  type="button"
                  onClick={handleDestinationClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {isSearchingDestination && !destinationId && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {showDestinationDropdown && destinations.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto mt-1">
                  {destinations.map((dest) => (
                    <div
                      key={dest.id}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleDestinationSelect(dest)
                      }}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                    >
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs shrink-0">
                        {dest.type}
                      </Badge>
                      <span className="font-medium text-gray-900 text-sm">{dest.name}</span>
                    </div>
                  ))}
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
