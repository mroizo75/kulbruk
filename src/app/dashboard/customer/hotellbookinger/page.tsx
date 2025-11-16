import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Hotel, Calendar, Users, MapPin, Phone, Mail } from 'lucide-react'
import CancelBookingButton from '@/components/cancel-booking-button'

export default async function HotelBookingsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/sign-in?callbackUrl=/dashboard/customer/hotellbookinger')
  }

  // Hent brukerens hotellbookinger
  const bookings = await prisma.hotelBooking.findMany({
    where: {
      userId: (session.user as any).id as string
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'confirmed': { label: 'Bekreftet', variant: 'default' },
      'pending': { label: 'Venter', variant: 'secondary' },
      'cancelled': { label: 'Kansellert', variant: 'destructive' },
      'failed': { label: 'Feilet', variant: 'destructive' },
      'timeout': { label: 'Timeout', variant: 'destructive' },
      '3ds_required': { label: '3D Secure påkrevd', variant: 'outline' }
    }

    const { label, variant } = statusMap[status] || { label: status, variant: 'secondary' as const }
    return <Badge variant={variant}>{label}</Badge>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mine Hotellbookinger</h1>
        <p className="text-gray-600">
          Oversikt over alle dine hotellbookinger
        </p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Hotel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ingen bookinger ennå
            </h3>
            <p className="text-gray-600 mb-4">
              Du har ikke gjort noen hotellbookinger ennå
            </p>
            <Button asChild>
              <a href="/hotell">Søk etter hotell</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Hotel className="h-5 w-5" />
                      Hotellbooking
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Booking ID: {booking.confirmationCode}
                      {booking.hcn && (
                        <span className="ml-2">• HCN: {booking.hcn}</span>
                      )}
                    </CardDescription>
                  </div>
                  <div>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gjesteinformasjon */}
                  <div>
                    <h4 className="font-semibold mb-3 text-sm text-gray-700">
                      Gjesteinformasjon
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{booking.guestFirstName} {booking.guestLastName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{booking.guestEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{booking.guestPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking detaljer */}
                  <div>
                    <h4 className="font-semibold mb-3 text-sm text-gray-700">
                      Booking detaljer
                    </h4>
                    <div className="space-y-2 text-sm">
                      {booking.checkIn && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>
                            Innsjekk: {new Date(booking.checkIn).toLocaleDateString('nb-NO')}
                          </span>
                        </div>
                      )}
                      {booking.checkOut && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>
                            Utsjekk: {new Date(booking.checkOut).toLocaleDateString('nb-NO')}
                          </span>
                        </div>
                      )}
                      {booking.totalPrice && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            Total: {booking.totalPrice} {booking.currency}
                          </span>
                        </div>
                      )}
                      {booking.hcn && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            HCN: {booking.hcn}
                          </Badge>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 pt-2">
                        Booket: {new Date(booking.createdAt).toLocaleDateString('nb-NO', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {booking.status === 'confirmed' && (
                  <div className="mt-6 pt-4 border-t flex gap-3">
                    <CancelBookingButton 
                      partnerOrderId={booking.confirmationCode}
                      bookingId={booking.id}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

