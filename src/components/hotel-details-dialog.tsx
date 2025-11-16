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
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { MapPin, Star, Loader2, Utensils, Users, Calendar, X, Check } from 'lucide-react'
import HotelBookingDialog from './hotel-booking-dialog'

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

interface HotelDetailsDialogProps {
  hotelId: string
  hotelName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  searchParams: {
    checkIn: string
    checkOut: string
    adults: number
    children: number
    rooms: number
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

  useEffect(() => {
    const fetchHotelDetails = async () => {
      if (!open || !hotelId) return

      try {
        setIsLoading(true)
        setError(null)

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

  // Formater pris
  const formatPrice = (dailyPrices: any[]) => {
    if (!dailyPrices || dailyPrices.length === 0) return 'Pris ikke tilgjengelig'
    const total = dailyPrices.reduce((sum: number, day: any) => sum + parseFloat(day || 0), 0)
    return `${total.toFixed(0)} NOK`
  }

  // Parse tax breakdown fra payment_options
  const parseTaxBreakdown = (paymentOptions: any) => {
    if (!paymentOptions?.payment_types?.[0]?.tax_data?.taxes) {
      return null
    }

    const taxes = paymentOptions.payment_types[0].tax_data.taxes
    const includedTaxes: any[] = []
    const nonIncludedTaxes: any[] = []

    taxes.forEach((tax: any) => {
      if (tax.included_by_supplier) {
        includedTaxes.push(tax)
      } else {
        nonIncludedTaxes.push(tax)
      }
    })

    return {
      included: includedTaxes,
      nonIncluded: nonIncludedTaxes,
      hasTaxes: includedTaxes.length > 0 || nonIncludedTaxes.length > 0
    }
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

  // Formater datoer
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl">
            {hotel?.name || hotelName || 'Laster...'}
          </DialogTitle>
          {hotel && (
            <DialogDescription className="flex flex-col gap-2 pt-2">
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
            </DialogDescription>
          )}
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="px-6 pb-6">
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
                {/* Search Info */}
                <Card className="mb-6">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-gray-600">Innsjekk</p>
                          <p className="font-semibold">{formatDate(searchParams.checkIn)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-gray-600">Utsjekk</p>
                          <p className="font-semibold">{formatDate(searchParams.checkOut)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-gray-600">Gjester</p>
                          <p className="font-semibold">{searchParams.adults} voksne, {searchParams.children} barn</p>
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

                {/* Rooms */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Tilgjengelige rom ({hotel.total_rooms})
                  </h3>

                  {hotel.rooms.length === 0 && (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-gray-600">Ingen ledige rom for de valgte datoene</p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-4">
                    {hotel.rooms.map((room, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Room Info */}
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold mb-2">{room.room_name}</h4>
                              
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

                              {/* Cancellation Info */}
                              {room.cancellation_policies && (
                                <div className="text-sm text-gray-600">
                                  <Check className="h-4 w-4 inline mr-1 text-green-600" />
                                  Gratis kansellering tilgjengelig
                                </div>
                              )}

                              {/* Availability */}
                              {room.allotment > 0 && room.allotment <= 5 && (
                                <p className="text-sm text-orange-600 font-medium mt-2">
                                  Kun {room.allotment} rom igjen!
                                </p>
                              )}
                            </div>

                            {/* Price & Action */}
                            <div className="lg:text-right lg:min-w-[200px]">
                              <div className="mb-3">
                                <p className="text-sm text-gray-600 mb-1">Total pris</p>
                                <p className="text-2xl font-bold text-green-600">
                                  {formatPrice(room.daily_prices)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  For {searchParams.rooms} rom, {Math.ceil((new Date(searchParams.checkOut).getTime() - new Date(searchParams.checkIn).getTime()) / (1000 * 60 * 60 * 24))} netter
                                </p>
                                
                                {/* Tax Breakdown */}
                                {room.payment_options && (() => {
                                  const taxBreakdown = parseTaxBreakdown(room.payment_options)
                                  if (taxBreakdown?.hasTaxes) {
                                    return (
                                      <div className="mt-2 text-xs text-gray-600 text-left lg:text-right">
                                        {taxBreakdown.included.length > 0 && (
                                          <div className="mb-1">
                                            <span className="text-green-600">✓</span> Skatter inkludert
                                          </div>
                                        )}
                                        {taxBreakdown.nonIncluded.length > 0 && (
                                          <div className="text-orange-600">
                                            ⚠ Lokale skatter kan påløpe ved ankomst
                                          </div>
                                        )}
                                      </div>
                                    )
                                  }
                                  return null
                                })()}
                              </div>

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
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Booking Dialog */}
        {selectedRoom && (
          <HotelBookingDialog
            open={bookingDialogOpen}
            onOpenChange={setBookingDialogOpen}
            roomData={{
              match_hash: selectedRoom.match_hash,
              book_hash: (selectedRoom as any).book_hash || selectedRoom.match_hash,
              room_name: selectedRoom.room_name,
              hotel_name: hotel?.name || hotelName || '',
              checkIn: searchParams.checkIn,
              checkOut: searchParams.checkOut,
              adults: searchParams.adults,
              children: searchParams.children,
              rooms: searchParams.rooms,
              totalPrice: formatPrice(selectedRoom.daily_prices)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

