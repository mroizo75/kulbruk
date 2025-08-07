import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { CheckCircle, XCircle, Eye, Clock, User, MapPin, Calendar, Euro } from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PrismaClient } from '@prisma/client'
import ApprovalActions from '@/components/approval-actions'
import AdminAnnonserClient from '@/components/admin-annonser-client'

const prisma = new PrismaClient()

export default async function AdminListingsPage() {
  const clerkUser = await currentUser()
  
  if (!clerkUser) {
    redirect('/sign-in?redirectUrl=/dashboard/admin/annonser')
  }

  // Hent alle ventende annonser
  const pendingListings = await prisma.listing.findMany({
    where: { status: 'PENDING' },
    include: {
      user: { 
        select: { 
          id: true,
          firstName: true, 
          lastName: true, 
          email: true,
          role: true
        } 
      },
      category: { select: { name: true } },
      images: { 
        orderBy: { sortOrder: 'asc' },
        take: 1 
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  function getTimeAgo(date: Date) {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / 60000)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min siden`
    } else if (diffInHours < 24) {
      return `${diffInHours} timer siden`
    } else {
      return `${diffInDays} dager siden`
    }
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        {/* Overskrift */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Godkjenn annonser</h1>
          <p className="text-gray-600">
            {pendingListings.length} annonser venter på godkjenning
          </p>
        </div>

        {/* Live oppdatering status */}
        <AdminAnnonserClient pendingCount={pendingListings.length} />

        {/* Statistikk */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ventende</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingListings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Godkjent i dag</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avslått i dag</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Annonser liste */}
        {pendingListings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {pendingListings.map((listing) => (
              <Card key={listing.id} className="border border-yellow-200 bg-yellow-50">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Bilde placeholder */}
                    <div className="flex-shrink-0">
                      <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        {listing.images.length > 0 ? (
                          <img 
                            src={listing.images[0].url} 
                            alt={listing.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-gray-500 text-sm">Ingen bilde</span>
                        )}
                      </div>
                    </div>

                    {/* Annonse info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {listing.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {listing.description}
                          </p>
                          
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Euro className="h-4 w-4" />
                              <span className="font-medium text-green-600">
                                {Number(listing.price).toLocaleString('no-NO')} kr
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {listing.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {getTimeAgo(listing.createdAt)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="outline">{listing.category.name}</Badge>
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                              Venter godkjenning
                            </Badge>
                          </div>
                        </div>

                        {/* Handlinger */}
                        <div className="flex flex-col gap-2 ml-4">
                          <Link href={`/annonser/detaljer/${listing.id}`}>
                            <Button variant="outline" size="sm" className="w-full">
                              <Eye className="h-4 w-4 mr-2" />
                              Se annonse
                            </Button>
                          </Link>
                          <ApprovalActions listingId={listing.id} />
                        </div>
                      </div>

                      {/* Bruker info */}
                      <div className="mt-4 pt-4 border-t border-yellow-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>
                            {listing.user.firstName} {listing.user.lastName}
                          </span>
                          <span>•</span>
                          <span>{listing.user.email}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {listing.user.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Alle annonser er godkjent!
              </h3>
              <p className="text-gray-600">
                Det er ingen annonser som venter på godkjenning akkurat nå.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}