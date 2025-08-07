import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Users, FileCheck, AlertTriangle, TrendingUp, Package, Shield, CheckCircle, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function AdminDashboard() {
  const clerkUser = await currentUser()
  
  if (!clerkUser) {
    redirect('/sign-in?redirectUrl=/dashboard/admin')
  }
  
  // Hent ekte data fra database
  const [
    pendingListings,
    totalListings,
    totalUsers,
    recentListings,
    approvedToday,
    rejectedToday,
    reportsCount
  ] = await Promise.all([
    prisma.listing.count({ where: { status: 'PENDING' } }),
    prisma.listing.count(),
    prisma.user.count(),
    prisma.listing.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        category: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    0, // TODO: Implementer PUBLISHED status i Prisma schema
    0, // TODO: Implementer REJECTED status i Prisma schema
    3 // Mock antall rapporter - implementer Report model senere
  ])

  const stats = [
    { title: 'Ventende annonser', value: pendingListings.toString(), icon: FileCheck, color: 'bg-yellow-500', urgent: pendingListings > 0 },
    { title: 'Totale annonser', value: totalListings.toLocaleString('no-NO'), icon: Package, color: 'bg-blue-500', urgent: false },
    { title: 'Aktive brukere', value: totalUsers.toString(), icon: Users, color: 'bg-green-500', urgent: false },
    { title: 'Åpne rapporter', value: reportsCount.toString(), icon: AlertTriangle, color: 'bg-red-500', urgent: reportsCount > 0 }
  ]

  const adminActions = [
    {
      title: 'Godkjenn annonser',
      description: 'Se og godkjenn ventende annonser',
      href: '/dashboard/admin/annonser',
      icon: FileCheck,
      color: 'bg-yellow-600',
      badge: pendingListings > 0 ? pendingListings.toString() : undefined
    },
    {
      title: 'Brukeradministrasjon',
      description: 'Administrer brukere og roller',
      href: '/dashboard/admin/brukere',
      icon: Users,
      color: 'bg-blue-600'
    },
    {
      title: 'Rapporter',
      description: 'Se rapporterte annonser',
      href: '/dashboard/admin/rapporter',
      icon: AlertTriangle,
      color: 'bg-red-600',
      badge: reportsCount > 0 ? reportsCount.toString() : undefined
    },
    {
      title: 'Systeminnstillinger',
      description: 'Konfigurer systemet',
      href: '/dashboard/admin/innstillinger',
      icon: Shield,
      color: 'bg-gray-600'
    }
  ]

  // Bygg recent activity fra ekte data
  const recentActivity = recentListings.map(listing => ({
    type: 'Ny annonse',
    item: listing.title,
    time: getTimeAgo(listing.createdAt),
    status: 'PENDING' as const,
    user: `${listing.user.firstName} ${listing.user.lastName}`,
    category: listing.categoryId || 'Ukjent'
  }))

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
        {/* Velkomst */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Administrer annonser, brukere og systeminnstillinger.</p>
        </div>

        {/* Kritiske varsler */}
        {pendingListings > 0 && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Krever oppmerksomhet</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Du har {pendingListings} annonser som venter på godkjenning.</p>
                </div>
                <div className="mt-3">
                  <Link href="/dashboard/admin/annonser">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                      Godkjenn annonser
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistikk */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div 
              key={stat.title} 
              className={`bg-white p-6 rounded-lg shadow ${stat.urgent ? 'ring-2 ring-red-200' : ''}`}
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              {stat.urgent && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Krever handling
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin-handlinger */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Admin-handlinger</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminActions.map((action) => (
                <Link 
                  key={action.title} 
                  href={action.href}
                  className="group bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow relative"
                >
                  {action.badge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {action.badge}
                    </span>
                  )}
                  <div className={`${action.color} p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Nylig aktivitet */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nylig aktivitet</h2>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full bg-yellow-500`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                        <p className="text-sm text-gray-500 truncate">{activity.item}</p>
                        <p className="text-xs text-gray-400">
                          {activity.user} • {activity.category}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">{activity.time}</div>
                    </div>
                  )) : (
                    <div className="text-center text-gray-500 py-4">
                      <p className="text-sm">Ingen nylige annonser</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}