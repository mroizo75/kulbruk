import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Eye, Edit, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/dashboard-layout'

export default async function MyListingsPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/sign-in?redirectUrl=/dashboard/customer/annonser')
  }

  // Mock data - senere hentes fra database
  const listings = [
    {
      id: '1',
      title: 'BMW X5 2019 - Lav kilometerstand',
      price: 450000,
      location: 'Oslo',
      category: 'Biler',
      status: 'APPROVED',
      views: 127,
      createdAt: new Date('2024-01-15'),
      images: ['/api/placeholder/300x200']
    },
    {
      id: '2',
      title: 'MacBook Pro M3 14" - nesten ny i eske',
      price: 25000,
      location: 'Bergen',
      category: 'Elektronikk',
      status: 'PENDING',
      views: 0,
      createdAt: new Date('2024-01-20'),
      images: []
    },
    {
      id: '3',
      title: 'Design sofa fra HAG - perfekt stand',
      price: 8500,
      location: 'Trondheim',
      category: 'Møbler',
      status: 'REJECTED',
      views: 0,
      createdAt: new Date('2024-01-18'),
      images: ['/api/placeholder/300x200']
    }
  ]

  const statusConfig = {
    PENDING: { label: 'Venter godkjenning', icon: Clock, color: 'bg-yellow-500' },
    APPROVED: { label: 'Aktiv', icon: CheckCircle, color: 'bg-green-500' },
    REJECTED: { label: 'Avvist', icon: XCircle, color: 'bg-red-500' },
    SOLD: { label: 'Solgt', icon: CheckCircle, color: 'bg-blue-500' },
  }

  const stats = {
    total: listings.length,
    approved: listings.filter(l => l.status === 'APPROVED').length,
    pending: listings.filter(l => l.status === 'PENDING').length,
    rejected: listings.filter(l => l.status === 'REJECTED').length,
    totalViews: listings.reduce((sum, l) => sum + l.views, 0)
  }

  return (
    <DashboardLayout userRole="customer">
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mine annonser</h1>
          <p className="text-gray-600 mt-2">Administrer alle dine annonser på ett sted.</p>
        </div>

        {/* Statistikk */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Totalt</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Aktive</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Venter</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Avvist</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.totalViews}</div>
              <div className="text-sm text-gray-600">Visninger</div>
            </CardContent>
          </Card>
        </div>

        {/* Annonser liste */}
        <div className="space-y-4">
          {listings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Plus className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen annonser ennå</h3>
                <p className="text-gray-600 mb-4">Kom i gang ved å legge ut din første annonse.</p>
                <Button asChild>
                  <Link href="/opprett">
                    Legg ut annonse
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            listings.map((listing) => {
              const statusInfo = statusConfig[listing.status as keyof typeof statusConfig]
              const StatusIcon = statusInfo.icon
              
              return (
                <Card key={listing.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {/* Bilde */}
                      <div className="sm:w-48 h-32 sm:h-auto bg-gray-200 flex items-center justify-center">
                        {listing.images.length > 0 ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">Ingen bilde</span>
                        )}
                      </div>
                      
                      {/* Innhold */}
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {listing.category}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span className="font-bold text-xl text-blue-600">
                                {listing.price.toLocaleString('no-NO')} kr
                              </span>
                              <span>📍 {listing.location}</span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {listing.views} visninger
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                              <StatusIcon className={`h-4 w-4 text-white rounded-full p-0.5 ${statusInfo.color}`} />
                              <span className="text-sm font-medium">{statusInfo.label}</span>
                              <span className="text-xs text-gray-500">
                                • Opprettet {listing.createdAt.toLocaleDateString('no-NO')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Handlinger */}
                        <div className="flex gap-2">
                          {listing.status === 'APPROVED' && (
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/annonser/detaljer/${listing.id}`}>
                                <Eye className="mr-1 h-4 w-4" />
                                Se annonse
                              </Link>
                            </Button>
                          )}
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/customer/annonser/${listing.id}/rediger`}>
                              <Edit className="mr-1 h-4 w-4" />
                              Rediger
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="mr-1 h-4 w-4" />
                            Slett
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}