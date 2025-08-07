import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, CheckCircle, Clock, Eye, X } from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import { toast } from 'sonner'
import { notifyListingApproved, notifyListingRejected } from '@/lib/notification-manager'

const prisma = new PrismaClient()

async function approveListing(listingId: string) {
  'use server'
  
  try {
    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: { 
        status: 'APPROVED',
        publishedAt: new Date()
      },
      include: {
        user: {
          select: { firstName: true, lastName: true }
        }
      }
    })
    
    // Send real-time notification
    notifyListingApproved({
      id: listing.id,
      title: listing.title,
      user: listing.user
    })
    
    console.log(`Moderator: Annonse ${listingId} godkjent`)
    return { success: true }
  } catch (error) {
    console.error('Feil ved godkjenning:', error)
    return { success: false, error: 'Kunne ikke godkjenne annonse' }
  }
}

async function rejectListing(listingId: string) {
  'use server'
  
  try {
    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: { 
        status: 'REJECTED'
      },
      include: {
        user: {
          select: { firstName: true, lastName: true }
        }
      }
    })
    
    // Send real-time notification
    notifyListingRejected({
      id: listing.id,
      title: listing.title,
      user: listing.user
    }, 'Avvist av moderator')
    
    console.log(`Moderator: Annonse ${listingId} avvist`)
    return { success: true }
  } catch (error) {
    console.error('Feil ved avvisning:', error)
    return { success: false, error: 'Kunne ikke avvise annonse' }
  }
}

export default async function ModeratorListingsPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in?redirectUrl=/dashboard/moderator/annonser')
  }

  // Sjekk moderator tilgang
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { role: true }
  })

  if (!dbUser || (dbUser.role !== 'moderator' && dbUser.role !== 'admin')) {
    redirect('/dashboard/customer')
  }

  // Hent alle annonser gruppert etter status
  const [pendingListings, recentlyModerated] = await Promise.all([
    // Ventende annonser
    prisma.listing.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    
    // Nylig modererte annonser
    prisma.listing.findMany({
      where: { 
        status: { in: ['APPROVED', 'REJECTED'] }
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    })
  ])

  return (
    <DashboardLayout userRole="moderator">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Annonse-moderering</h1>
          <p className="text-gray-600">Godkjenn eller avvis annonser</p>
        </div>

        {/* Status oversikt */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2 text-orange-500" />
                Ventende
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingListings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Godkjent i dag
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {recentlyModerated.filter(l => 
                  l.status === 'APPROVED' && 
                  new Date(l.updatedAt).toDateString() === new Date().toDateString()
                ).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <X className="h-4 w-4 mr-2 text-red-500" />
                Avvist i dag
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {recentlyModerated.filter(l => 
                  l.status === 'REJECTED' && 
                  new Date(l.updatedAt).toDateString() === new Date().toDateString()
                ).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ventende annonser */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
              Annonser som venter på godkjenning ({pendingListings.length})
            </CardTitle>
            <CardDescription>
              Disse annonsene trenger moderatorgodkjenning før de publiseres
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingListings.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Alle annonser er behandlet!</h3>
                <p className="text-gray-500">Det er ingen ventende annonser for øyeblikket.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingListings.map((listing) => (
                  <div key={listing.id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{listing.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          av {listing.user.firstName} {listing.user.lastName} ({listing.user.email})
                        </p>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        {listing.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="font-medium">Kategori:</span>
                        <p className="text-gray-600">{listing.category}</p>
                      </div>
                      <div>
                        <span className="font-medium">Pris:</span>
                        <p className="text-gray-600">{listing.price.toLocaleString('no-NO')} kr</p>
                      </div>
                      <div>
                        <span className="font-medium">Lokasjon:</span>
                        <p className="text-gray-600">{listing.location}</p>
                      </div>
                      <div>
                        <span className="font-medium">Opprettet:</span>
                        <p className="text-gray-600">
                          {new Date(listing.createdAt).toLocaleDateString('no-NO')}
                        </p>
                      </div>
                    </div>

                    {listing.description && (
                      <div className="mb-4">
                        <span className="font-medium text-sm">Beskrivelse:</span>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-3">{listing.description}</p>
                      </div>
                    )}

                    <Separator className="my-4" />

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <a href={`/annonser/detaljer/${listing.id}`} target="_blank">
                          <Eye className="h-4 w-4 mr-2" />
                          Forhåndsvis
                        </a>
                      </Button>

                      <form action={approveListing.bind(null, listing.id)} className="inline">
                        <Button
                          type="submit"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Godkjenn
                        </Button>
                      </form>

                      <form action={rejectListing.bind(null, listing.id)} className="inline">
                        <Button
                          type="submit"
                          size="sm"
                          variant="destructive"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Avvis
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nylig modererte annonser */}
        <Card>
          <CardHeader>
            <CardTitle>Nylig modererte annonser</CardTitle>
            <CardDescription>
              Siste {recentlyModerated.length} annonser du har behandlet
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentlyModerated.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Ingen modererte annonser ennå
              </p>
            ) : (
              <div className="space-y-3">
                {recentlyModerated.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <h4 className="font-medium">{listing.title}</h4>
                      <p className="text-sm text-gray-500">
                        {listing.user.firstName} {listing.user.lastName} • 
                        {new Date(listing.updatedAt).toLocaleDateString('no-NO')}
                      </p>
                    </div>
                    <Badge 
                      variant={listing.status === 'APPROVED' ? 'default' : 'destructive'}
                      className={listing.status === 'APPROVED' ? 'bg-green-600' : ''}
                    >
                      {listing.status === 'APPROVED' ? 'Godkjent' : 'Avvist'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
