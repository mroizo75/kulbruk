import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { PlusCircle, Package, Heart, Settings, TrendingUp, Eye, Clock, Plus } from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function CustomerDashboard() {
  const clerkUser = await currentUser()
  
  if (!clerkUser) {
    redirect('/sign-in?redirectUrl=/dashboard/customer')
  }
  
  // Bruker-info fra Clerk
  const user = {
    id: clerkUser.id,
    firstName: clerkUser.firstName || 'Bruker',
    email: clerkUser.emailAddresses[0]?.emailAddress || 'bruker@kulbruk.no'
  }

  const stats = [
    { title: 'Mine annonser', value: '3', icon: Package, color: 'bg-blue-500' },
    { title: 'Aktive annonser', value: '2', icon: TrendingUp, color: 'bg-green-500' },
    { title: 'Favoritter', value: '8', icon: Heart, color: 'bg-red-500' },
    { title: 'Visninger i dag', value: '24', icon: Eye, color: 'bg-purple-500' },
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}