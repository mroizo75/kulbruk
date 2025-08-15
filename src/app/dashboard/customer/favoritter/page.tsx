import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Heart, Eye, MapPin, Calendar, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import DashboardLayout from '@/components/dashboard-layout'

export default async function FavoritesPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/sign-in?redirectUrl=/dashboard/customer/favoritter')
  }
  const userId = (session.user as any).id as string
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: { listing: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <DashboardLayout userRole="customer">
      <div className="space-y-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">Mine favoritter</h1>
          </div>
          <p className="text-gray-600">Annonser du har lagret for senere.</p>
        </div>

        {/* Favoritter liste */}
        <div className="space-y-4">
          {favorites.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Heart className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen favoritter ennå</h3>
                <p className="text-gray-600 mb-4">
                  Start med å utforske annonser og lagre dem du er interessert i.
                </p>
                <Button asChild>
                  <Link href="/annonser">
                    Utforsk annonser
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((f) => {
                const l = f.listing
                const isActive = l.status === 'APPROVED' && l.isActive
                return (
                <Card 
                  key={f.id} 
                  className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${
                    !isActive ? 'opacity-75 bg-gray-50' : 'hover:scale-[1.02]'
                  }`}
                >
                  {/* Bilde */}
                  <div className="relative aspect-video bg-gray-200">
                    {l.images.length > 0 ? (
                      <img src={l.images[0].url} alt={l.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <span className="text-sm">Ingen bilde</span>
                      </div>
                    )}
                    
                    {/* Status badge */}
                    <div className="absolute top-2 right-2">
                      {isActive ? (
                        <Badge className="bg-green-500 text-white">
                          Aktiv
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          Ikke aktiv
                        </Badge>
                      )}
                    </div>

                    {/* Favoritt hjerte */}
                    <div className="absolute top-2 left-2">
                      <form action={`/api/favorites?listingId=${encodeURIComponent(l.id)}`} method="post" onSubmit={(e) => { e.preventDefault(); fetch(`/api/favorites?listingId=${encodeURIComponent(l.id)}`, { method: 'DELETE' }).then(() => location.reload()) }}>
                        <button className="p-1 bg-white/80 rounded-full hover:bg-white transition-colors" title="Fjern favoritt">
                          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                        </button>
                      </form>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    {/* Kategori og lagret dato */}
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {l.categoryId}
                      </Badge>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Lagret {new Date(f.createdAt).toLocaleDateString('no-NO', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    {/* Tittel */}
                    <h3 className="font-semibold text-lg leading-tight mb-2 max-h-[3.5rem] overflow-hidden">
                      {l.title}
                    </h3>

                    {/* Pris */}
                    <p className="text-2xl font-bold text-blue-600 mb-2">
                      {Number(l.price).toLocaleString('no-NO')} kr
                    </p>

                    {/* Lokasjon og visninger */}
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{l.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{l.views} visninger</span>
                      </div>
                    </div>

                    {/* Handlinger */}
                    <div className="flex gap-2">
                      {isActive ? (
                        <Button size="sm" asChild className="flex-1">
                          <Link href={`/annonser/detaljer/${l.id}`}>
                            Se annonse
                          </Link>
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled className="flex-1">
                          Ikke tilgjengelig
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => fetch(`/api/favorites?listingId=${encodeURIComponent(l.id)}`, { method: 'DELETE' }).then(() => location.reload())}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )})}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}