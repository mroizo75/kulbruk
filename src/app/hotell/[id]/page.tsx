'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Star, Wifi, Coffee, Car, Utensils, Check, X, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Room {
  match_hash: string
  room_name: string
  room_description: any
  meal: string
  meal_data: any
  daily_prices: any[]
  payment_options: any
  cancellation_policies: any
  amenities: string[]
  allotment: number
}

interface HotelDetails {
  id: string
  hid: number
  name: string
  address: string
  star_rating: number
  rooms: Room[]
  total_rooms: number
}

export default function HotelDetailsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [hotel, setHotel] = useState<HotelDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hotelId = params.id as string
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const adults = parseInt(searchParams.get('adults') || '2')
  const children = parseInt(searchParams.get('children') || '0')
  const rooms = parseInt(searchParams.get('rooms') || '1')

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log('🏨 Fetching hotel details:', { hotelId, checkIn, checkOut, adults, children, rooms })

        // Parse hotelId - sjekk om det er test hotellet (8473727) eller en slug
        const isNumericId = /^\d+$/.test(hotelId)
        const requestBody = isNumericId
          ? { hid: parseInt(hotelId), checkIn, checkOut, adults, children, rooms }
          : { hotelId, checkIn, checkOut, adults, children, rooms }

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

    if (hotelId && checkIn && checkOut) {
      fetchHotelDetails()
    } else {
      setError('Mangler søkeparametere')
      setIsLoading(false)
    }
  }, [hotelId, checkIn, checkOut, adults, children, rooms])

  // Formater pris
  const formatPrice = (dailyPrices: any[]) => {
    if (!dailyPrices || dailyPrices.length === 0) return 'Pris ikke tilgjengelig'
    const total = dailyPrices.reduce((sum: number, day: any) => sum + parseFloat(day || 0), 0)
    return `${total.toFixed(0)} NOK`
  }

  // Få måltids-type tekst
  const getMealText = (meal: string) => {
    const mealMap: Record<string, string> = {
      'room_only': 'Kun rom',
      'breakfast': 'Frokost inkludert',
      'half_board': 'Halvpensjon',
      'full_board': 'Helpensjon',
      'all_inclusive': 'All inclusive'
    }
    return mealMap[meal] || meal
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Henter hotelldetaljer...</h3>
              <p className="text-gray-600">Dette kan ta noen sekunder</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Link href="/hotell">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tilbake til søk
            </Button>
          </Link>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Kunne ikke laste hotell
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link href="/hotell">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake til søk
          </Button>
        </Link>

        {/* Hotel Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{hotel.name}</CardTitle>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center">
                    {Array.from({ length: hotel.star_rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {hotel.address || 'Adresse ikke tilgjengelig'}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Search Details */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Innsjekk</p>
                <p className="font-semibold">{checkIn}</p>
              </div>
              <div>
                <p className="text-gray-600">Utsjekk</p>
                <p className="font-semibold">{checkOut}</p>
              </div>
              <div>
                <p className="text-gray-600">Voksne</p>
                <p className="font-semibold">{adults}</p>
              </div>
              <div>
                <p className="text-gray-600">Barn</p>
                <p className="font-semibold">{children}</p>
              </div>
              <div>
                <p className="text-gray-600">Rom</p>
                <p className="font-semibold">{rooms}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Rooms */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Tilgjengelige rom ({hotel.total_rooms})</h2>

          {hotel.rooms.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">Ingen ledige rom for de valgte datoene</p>
              </CardContent>
            </Card>
          )}

          {hotel.rooms.map((room, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Room Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{room.room_name}</h3>
                    
                    {/* Meal */}
                    <div className="flex items-center mb-3">
                      <Utensils className="h-4 w-4 mr-2 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {getMealText(room.meal)}
                      </span>
                    </div>

                    {/* Amenities */}
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {room.amenities.slice(0, 5).map((amenity, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {room.amenities.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{room.amenities.length - 5} flere
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Availability */}
                    {room.allotment > 0 && (
                      <p className="text-sm text-gray-600">
                        Kun {room.allotment} rom igjen!
                      </p>
                    )}
                  </div>

                  {/* Price & Action */}
                  <div className="md:text-right">
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Total pris</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatPrice(room.daily_prices)}
                      </p>
                    </div>

                    <Button 
                      className="bg-green-600 hover:bg-green-700 w-full md:w-auto"
                      onClick={() => {
                        // TODO: Implementer prebook/booking flow
                        console.log('Booking room:', room.match_hash)
                        alert('Booking-funksjonalitet kommer snart!')
                      }}
                    >
                      Velg dette rommet
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

