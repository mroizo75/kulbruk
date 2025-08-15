import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CheckCircle, XCircle, Eye, Clock, User, MapPin, Calendar, Euro, Trash2, Search } from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PrismaClient } from '@prisma/client'
import ApprovalActions from '@/components/approval-actions'
import AdminAnnonserClient from '@/components/admin-annonser-client'
import AdminShortcodeSearch from '@/components/admin/admin-shortcode-search'
import AdminDeleteListingButton from '@/components/admin/admin-delete-listing-button'
import AdminListingsTable from '@/components/admin/admin-listings-table'
import AdminListingsFilters from '@/components/admin/admin-listings-filters'

const prisma = new PrismaClient()

export default async function AdminListingsPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const session = await auth()
  
  if (!session) {
    redirect('/sign-in?redirectUrl=/dashboard/admin/annonser')
  }

  // Les query
  const q = typeof searchParams?.q === 'string' ? searchParams?.q : ''
  const status = typeof searchParams?.status === 'string' ? searchParams?.status : 'ALL'
  const categoryId = typeof searchParams?.categoryId === 'string' ? searchParams?.categoryId : ''
  const page = Math.max(1, parseInt((searchParams?.page as string) || '1'))
  const pageSize = Math.min(100, Math.max(10, parseInt((searchParams?.pageSize as string) || '20')))

  // Hent kategorier + lister for moderering og administrasjon
  const [categories, pendingListings, totalCount, allListings] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
    prisma.listing.findMany({
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
    }),
    prisma.listing.count({
      where: {
        ...(status !== 'ALL' ? { status: status as any } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(q ? { OR: [
          { title: { contains: q } },
          { shortCode: { contains: q } }
        ] } : {}),
      }
    }),
    prisma.listing.findMany({
      where: {
        ...(status !== 'ALL' ? { status: status as any } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(q ? { OR: [
          { title: { contains: q } },
          { shortCode: { contains: q } }
        ] } : {}),
      },
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
        images: { orderBy: { sortOrder: 'asc' }, take: 1 }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })
  ])

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

        {/* Søk etter kortkode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" /> Søk etter annonsenummer</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminShortcodeSearch />
          </CardContent>
        </Card>

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

        {/* Ventende annonser */}
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

        {/* Alle annonser (admin kan slette) */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Alle annonser</h2>
          <div className="mb-4">
            <AdminListingsFilters
              initialStatus={status}
              initialQuery={q}
              initialCategoryId={categoryId}
              initialPageSize={pageSize}
              categories={categories}
            />
          </div>
          <AdminListingsTable rows={allListings.map(l => ({
            id: l.id,
            title: l.title,
            price: Number(l.price),
            location: l.location,
            createdAt: l.createdAt.toISOString(),
            categoryName: l.category.name,
            status: l.status,
            shortCode: l.shortCode || null,
            imageUrl: l.images[0]?.url || null,
          }))} />
          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <div>Totalt: {totalCount}</div>
            <div className="flex items-center gap-2">
              <span>Side {page} av {Math.max(1, Math.ceil(totalCount / pageSize))}</span>
              <div className="flex gap-1">
                {page > 1 && (
                  <Link href={`/dashboard/admin/annonser?${new URLSearchParams({ ...((q && { q }) || {}), ...((status !== 'ALL' && { status }) || {}), ...((categoryId && { categoryId }) || {}), page: String(page - 1), pageSize: String(pageSize) }).toString()}`}>
                    <Button size="sm" variant="outline">Forrige</Button>
                  </Link>
                )}
                {(page * pageSize) < totalCount && (
                  <Link href={`/dashboard/admin/annonser?${new URLSearchParams({ ...((q && { q }) || {}), ...((status !== 'ALL' && { status }) || {}), ...((categoryId && { categoryId }) || {}), page: String(page + 1), pageSize: String(pageSize) }).toString()}`}>
                    <Button size="sm" variant="outline">Neste</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}