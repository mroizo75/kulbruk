'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bed, Star, MapPin, Wifi, Car, Utensils, Loader2 } from 'lucide-react'
import { RateHawkHotel } from '@/lib/types'
import HotelDetailsDialog from './hotel-details-dialog'

interface HotelSearchFormData {
  destination: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
  rooms: number
}

interface HotelResultsProps {
  hotels: RateHawkHotel[]
  searchParams: HotelSearchFormData | null
  isLoading: boolean
}

export default function HotelResults({ hotels, searchParams, isLoading }: HotelResultsProps) {
  const [selectedHotel, setSelectedHotel] = useState<{ id: string; name: string } | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleViewDetails = (hotel: RateHawkHotel) => {
    setSelectedHotel({ id: hotel.id, name: hotel.name })
    setDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Søker etter hoteller...</h3>
          <p className="text-gray-600">Vi finner de beste tilbudene for deg</p>
        </div>
      </div>
    )
  }

  if (!hotels || hotels.length === 0) {
    return (
      <>
        <div className="text-center py-16">
          <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ingen hoteller funnet</h3>
          <p className="text-gray-600 mb-4">
            Vi fant dessverre ingen hoteller som matcher søket ditt.
          </p>
          <p className="text-sm text-gray-500">
            Dette kan skyldes API begrensninger eller at destinasjonen ikke støttes.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Prøv test hotel: <strong>8473727</strong>
          </p>
        </div>

        {/* Hotel Details Dialog */}
        {selectedHotel && searchParams && (
          <HotelDetailsDialog
            hotelId={selectedHotel.id}
            hotelName={selectedHotel.name}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            searchParams={{
              checkIn: searchParams.checkIn,
              checkOut: searchParams.checkOut,
              adults: searchParams.adults,
              children: searchParams.children,
              rooms: searchParams.rooms
            }}
          />
        )}
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Hotellresultater
            </h2>
            <p className="text-gray-600">
              {hotels.length} hoteller funnet
              {searchParams && (
                <span className="ml-2">
                  • {new Date(searchParams.checkIn).toLocaleDateString('nb-NO')} - {new Date(searchParams.checkOut).toLocaleDateString('nb-NO')}
                  • {searchParams.adults + searchParams.children} gjester
                </span>
              )}
            </p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            {hotels.length} resultater
          </Badge>
        </div>
      </div>

      {/* Hotel Cards */}
      <div className="space-y-4">
        {hotels.map((hotel) => (
          <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row">
              {/* Hotel Image */}
              <div className="md:w-80 h-48 md:h-auto bg-gray-200 flex-shrink-0">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = 'https://via.placeholder.com/320x200?text=No+Image'
                  }}
                />
              </div>

              {/* Hotel Details */}
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {hotel.name}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{hotel.address}</span>
                    </div>
                    <div className="flex items-center mb-3">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm font-medium text-gray-900 mr-2">
                        {hotel.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({hotel.distance})
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {hotel.price.amount} {hotel.price.currency}
                    </div>
                    <div className="text-sm text-gray-600">
                      per natt
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {hotel.amenities.slice(0, 4).map((amenity, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {hotel.amenities.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{hotel.amenities.length - 4} flere
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetails(hotel)}
                  >
                    Se detaljer
                  </Button>

                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleViewDetails(hotel)}
                  >
                    Velg rom
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Load More / Pagination could go here */}
      {hotels.length >= 10 && (
        <div className="text-center py-8">
          <Button variant="outline">
            Last flere resultater
          </Button>
        </div>
      )}

      {/* Hotel Details Dialog */}
      {selectedHotel && searchParams && (
        <HotelDetailsDialog
          hotelId={selectedHotel.id}
          hotelName={selectedHotel.name}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          searchParams={{
            checkIn: searchParams.checkIn,
            checkOut: searchParams.checkOut,
            adults: searchParams.adults,
            children: searchParams.children,
            rooms: searchParams.rooms
          }}
        />
      )}
    </div>
  )
}
