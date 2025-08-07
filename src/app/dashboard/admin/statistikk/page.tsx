import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  Calendar,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  PieChart
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function AdminStatisticsPage() {
  const clerkUser = await currentUser()
  
  if (!clerkUser) {
    redirect('/sign-in?redirectUrl=/dashboard/admin/statistikk')
  }

  // Sjekk at brukeren er admin
  const currentDbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id }
  })

  if (!currentDbUser || currentDbUser.role !== 'admin') {
    redirect('/dashboard')
  }

  // Hent omfattende statistikk
  const [
    totalListings,
    totalUsers,
    pendingListings,
    categoriesWithCounts,
    usersWithListings,
    recentListings
  ] = await Promise.all([
    prisma.listing.count(),
    prisma.user.count(),
    prisma.listing.count({ where: { status: 'PENDING' } }),
    prisma.category.findMany({
      include: {
        _count: {
          select: {
            listings: true
          }
        }
      },
      orderBy: {
        listings: {
          _count: 'desc'
        }
      }
    }),
    prisma.user.findMany({
      include: {
        _count: {
          select: {
            listings: true
          }
        }
      },
      orderBy: {
        listings: {
          _count: 'desc'
        }
      },
      take: 10
    }),
    prisma.listing.findMany({
      include: {
        user: { select: { firstName: true, lastName: true } },
        category: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ])

  // Beregn statistikk
  const usersByRole = usersWithListings.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const averageListingsPerUser = totalUsers > 0 ? (totalListings / totalUsers).toFixed(1) : '0'
  const approvalRate = totalListings > 0 ? (((totalListings - pendingListings) / totalListings) * 100).toFixed(1) : '0'

  // Mock data for charts (kan implementeres med Chart.js senere)
  const weeklyStats = [
    { day: 'Man', listings: 12, users: 3 },
    { day: 'Tir', listings: 19, users: 5 },
    { day: 'Ons', listings: 8, users: 2 },
    { day: 'Tor', listings: 15, users: 7 },
    { day: 'Fre', listings: 22, users: 4 },
    { day: 'Lør', listings: 18, users: 6 },
    { day: 'Søn', listings: 9, users: 1 }
  ]

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
          <h1 className="text-3xl font-bold text-gray-900">Statistikk</h1>
          <p className="text-gray-600">
            Omfattende oversikt over systemets ytelse og bruk
          </p>
        </div>

        {/* Hovedstatistikk */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Totale annonser</p>
                  <p className="text-2xl font-bold text-gray-900">{totalListings.toLocaleString('no-NO')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Totale brukere</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers.toLocaleString('no-NO')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ventende annonser</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingListings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Godkjenningsrate</p>
                  <p className="text-2xl font-bold text-gray-900">{approvalRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Kategorier */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-600" />
                Annonser per kategori
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoriesWithCounts.map((category) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {category._count.listings} annonser
                      </Badge>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ 
                            width: `${totalListings > 0 ? (category._count.listings / totalListings) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top brukere */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Top brukere (mest aktive)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {usersWithListings.slice(0, 8).map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {user._count.listings} annonser
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ukentlig aktivitet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Ukentlig aktivitet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {weeklyStats.map((day) => (
                <div key={day.day} className="text-center">
                  <div className="text-xs font-medium text-gray-600 mb-2">{day.day}</div>
                  <div className="space-y-1">
                    <div 
                      className="bg-blue-100 rounded mx-auto" 
                      style={{ 
                        height: `${Math.max(20, (day.listings / 25) * 60)}px`,
                        width: '16px'
                      }}
                    ></div>
                    <div className="text-xs text-gray-500">{day.listings}</div>
                    <div className="text-xs text-gray-400">annonser</div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <div 
                      className="bg-green-100 rounded mx-auto" 
                      style={{ 
                        height: `${Math.max(10, (day.users / 8) * 40)}px`,
                        width: '16px'
                      }}
                    ></div>
                    <div className="text-xs text-gray-500">{day.users}</div>
                    <div className="text-xs text-gray-400">brukere</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nylige annonser */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Nylige annonser
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentListings.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{listing.title}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>av {listing.user.firstName} {listing.user.lastName}</span>
                      <span>•</span>
                      <span>{listing.category.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      className={
                        listing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }
                    >
                      {listing.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{getTimeAgo(listing.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nøkkeltall */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gjennomsnittlig annonser per bruker</h3>
              <p className="text-3xl font-bold text-blue-600">{averageListingsPerUser}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mest populære kategori</h3>
              <p className="text-3xl font-bold text-green-600">
                {categoriesWithCounts[0]?.name || 'Ingen'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mest aktive brukertype</h3>
              <p className="text-3xl font-bold text-purple-600">
                {Object.entries(usersByRole).sort(([,a], [,b]) => b - a)[0]?.[0] || 'customer'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}