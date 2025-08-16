import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PlusCircle, Package, Heart, Settings, TrendingUp, Eye, Clock, Plus, AlertCircle, Edit } from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'



export default async function CustomerDashboard() {
  const session = await auth()
  
  if (!session) {
    redirect('/sign-in?redirectUrl=/dashboard/customer')
  }
  
  // Sjekk om bruker eksisterer i database - hvis ikke, redirect til error
  let dbUser = null
  
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: session.user?.id }
    })
    
    if (!dbUser) {
      // Dette bør ikke skje hvis webhook fungerer
      // Bruker ikke funnet - kan ikke vise dashboard
      redirect('/dashboard/setup-error')
    }
  } catch (error) {
    // Database feil
    redirect('/dashboard/setup-error')
  }
  
  // Bruker-info fra database
  const user = {
    id: dbUser.id,
    firstName: dbUser.firstName || session.user?.name || 'Bruker',
    email: dbUser.email || session.user?.email || 'bruker@kulbruk.no',
    role: dbUser.role
  }

  // Hent statistikk og siste annonser
  const [totalListings, activeListings, favoritesCount, viewsAgg, recentListings] = await Promise.all([
    prisma.listing.count({ where: { userId: user.id } }),
    prisma.listing.count({ where: { userId: user.id, status: 'APPROVED', isActive: true } }),
    prisma.favorite.count({ where: { userId: user.id } }),
    prisma.listing.aggregate({ _sum: { views: true }, where: { userId: user.id } }),
    prisma.listing.findMany({
      where: { userId: user.id },
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
      take: 3,
    })
  ])

  const stats = [
    { title: 'Mine annonser', value: String(totalListings), icon: Package, color: 'bg-blue-500' },
    { title: 'Aktive annonser', value: String(activeListings), icon: TrendingUp, color: 'bg-green-500' },
    { title: 'Favoritter', value: String(favoritesCount), icon: Heart, color: 'bg-red-500' },
    { title: 'Visninger totalt', value: String(viewsAgg._sum.views || 0), icon: Eye, color: 'bg-purple-500' },
  ]

  const recentActivity = [
    {
      type: 'view',
      title: 'BMW X5 2019 fikk 3 nye visninger',
      time: '2 timer siden',
      color: 'text-blue-600'
    },
    {
      type: 'favorite',
      title: 'iPhone 15 Pro ble lagt til i favoritter',
      time: '4 timer siden',
      color: 'text-red-600'
    },
    {
      type: 'listing',
      title: 'MacBook Pro annonse godkjent',
      time: '6 timer siden',
      color: 'text-green-600'
    }
  ]

  return (
    <DashboardLayout userRole="customer">
      <div className="space-y-8">
        {/* Velkomst */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Velkommen tilbake, {user.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">Her er en oversikt over din aktivitet på Kulbruk.no</p>
        </div>

        {/* Statistikk */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center">
                  <div className={`${stat.color} p-2 lg:p-3 rounded-lg`}>
                    <stat.icon className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <div className="ml-3 lg:ml-4">
                    <p className="text-xs lg:text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* To-kolonner layout på desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hurtighandlinger */}
          <Card>
            <CardHeader>
              <CardTitle>Hurtighandlinger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link 
                href="/opprett"
                className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors group"
              >
                <div className="bg-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-blue-900">Legg ut annonse</h3>
                  <p className="text-sm text-blue-700">Selg noe du ikke trenger</p>
                </div>
              </Link>
              
              <Link 
                href="/dashboard/customer/annonser"
                className="flex items-center p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors group"
              >
                <div className="bg-gray-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">Administrer annonser</h3>
                  <p className="text-sm text-gray-600">Se og rediger dine annonser</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Nylig aktivitet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Nylig aktivitet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link 
                  href="/dashboard/customer/annonser" 
                  className="text-sm text-blue-600 hover:underline"
                >
                  Se all aktivitet →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nylige annonser */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Dine annonser</CardTitle>
          </CardHeader>
          <CardContent>
            {recentListings.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen annonser ennå</h3>
                <p className="text-gray-600 mb-4">
                  Kom i gang med å selge ved å legge ut din første annonse
                </p>
                <Link 
                  href="/opprett"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Legg ut annonse
                </Link>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentListings.map((l) => (
                    <div key={l.id} className="border rounded-lg overflow-hidden">
                      <div className="h-36 bg-gray-100">
                        {l.images.length > 0 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={(l.images[0] as any).url || ''} alt={l.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">Ingen bilde</div>
                        )}
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">{l.title}</h3>
                          {l.shortCode && (
                            <span className="text-xs bg-blue-600 text-white rounded px-2 py-0.5">#{l.shortCode}</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold text-blue-600">{Number(l.price).toLocaleString('no-NO')} kr</span>
                          <span className="ml-2">• {l.status === 'APPROVED' ? 'Aktiv' : l.status === 'PENDING' ? 'Venter' : l.status === 'REJECTED' ? 'Avvist' : l.status === 'SOLD' ? 'Solgt' : l.status}</span>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Link href={`/dashboard/customer/annonser/${l.id}/rediger`} className="inline-flex items-center text-sm px-2 py-1 border rounded hover:bg-gray-50">
                            <Edit className="h-3 w-3 mr-1" /> Rediger
                          </Link>
                          <Link href={`/annonser/detaljer/${l.id}`} className="inline-flex items-center text-sm px-2 py-1 border rounded hover:bg-gray-50">
                            Se
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-right mt-4">
                  <Link href="/dashboard/customer/annonser" className="text-sm text-blue-600 hover:underline">Se alle mine annonser →</Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}