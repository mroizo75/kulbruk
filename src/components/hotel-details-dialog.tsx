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
import { MapPin, Star, Loader2, Utensils, Users, Calendar, X, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import HotelBookingDialog from './hotel-booking-dialog'
import Image from 'next/image'

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
  image?: string
  images?: string[]
  star_rating: number
  amenity_groups?: any[]
  description?: any
  check_in_time?: string
  check_out_time?: string
  reviews?: any[]
  review_count?: number
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[98vh] h-[98vh] p-0 overflow-hidden">
        <DialogHeader className="px-8 pt-6 pb-4 border-b">
          <DialogTitle className="text-3xl font-bold">
            {hotel?.name || hotelName || 'Laster...'}
          </DialogTitle>
          <DialogTitle className="text-2xl">
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
          <div className="px-8 py-6">
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

                {/* Tabs for Rooms, Amenities, Description */}
                <Tabs defaultValue="rooms" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="rooms">Rom ({hotel.total_rooms})</TabsTrigger>
                    <TabsTrigger value="amenities">
                      Fasiliteter {hotel.amenity_groups && `(${hotel.amenity_groups.length})`}
                    </TabsTrigger>
                    <TabsTrigger value="reviews">
                      Anmeldelser {hotel.review_count ? `(${hotel.review_count})` : ''}
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
                    {hotel.reviews && hotel.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {hotel.reviews.map((review, idx) => (
                          <Card key={idx}>
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className="font-semibold">{review.author}</p>
                                  {review.date && (
                                    <p className="text-xs text-gray-500">
                                      {new Date(review.date).toLocaleDateString('nb-NO', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                  <span className="ml-1 text-sm font-medium">{review.rating}/5</span>
                                </div>
                              </div>

                              {review.title && (
                                <h4 className="font-semibold mb-2">{review.title}</h4>
                              )}

                              <p className="text-sm text-gray-700 mb-3">{review.text}</p>

                              {(review.pros || review.cons) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t">
                                  {review.pros && (
                                    <div>
                                      <p className="text-xs font-semibold text-green-600 mb-1">👍 Fordeler</p>
                                      <p className="text-sm text-gray-600">{review.pros}</p>
                                    </div>
                                  )}
                                  {review.cons && (
                                    <div>
                                      <p className="text-xs font-semibold text-orange-600 mb-1">👎 Ulemper</p>
                                      <p className="text-sm text-gray-600">{review.cons}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="py-12 text-center">
                          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Ingen anmeldelser tilgjengelig for dette hotellet</p>
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

