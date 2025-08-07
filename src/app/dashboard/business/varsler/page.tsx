import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Bell, 
  Car, 
  Settings,
  CheckCircle,
  Clock,
  TrendingUp,
  Smartphone,
  Mail,
  Volume2
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import BusinessNotificationSettings from '@/components/business-notification-settings'

const prisma = new PrismaClient()

export default async function BusinessNotificationsPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in?redirectUrl=/dashboard/business/varsler')
  }

  // Sjekk business tilgang
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { 
      role: true, 
      companyName: true,
      id: true 
    }
  })

  if (!dbUser || dbUser.role !== 'business') {
    redirect('/registrer-bedrift')
  }

  // Mock notification settings data
  const notificationSettings = {
    enabled: true,
    channels: ['email', 'sms'],
    preferences: {
      newAuctions: true,
      bidUpdates: true,
      auctionEnding: true,
      marketReports: false,
      systemUpdates: true
    },
    brandFilters: {
      enabled: true,
      selectedBrands: ['BMW', 'Audi', 'Mercedes-Benz', 'Volkswagen'],
      priceRange: {
        min: 100000,
        max: 1000000
      },
      yearRange: {
        min: 2018,
        max: 2024
      }
    }
  }

  // Mock statistics
  const notificationStats = {
    thisWeek: {
      sent: 23,
      clicked: 15,
      newAuctions: 8,
      bidAlerts: 12,
      endingAlerts: 3
    },
    lastMonth: {
      totalNotifications: 89,
      clickRate: 68,
      savedTime: '4.2 timer',
      auctionsFound: 31
    }
  }

  // Populære bilmerker
  const popularBrands = [
    { name: 'BMW', count: 45, trend: '+12%' },
    { name: 'Audi', count: 38, trend: '+8%' },
    { name: 'Mercedes-Benz', count: 34, trend: '+15%' },
    { name: 'Volkswagen', count: 42, trend: '+5%' },
    { name: 'Toyota', count: 31, trend: '+22%' },
    { name: 'Volvo', count: 28, trend: '-3%' },
    { name: 'Tesla', count: 19, trend: '+35%' },
    { name: 'Porsche', count: 12, trend: '+18%' }
  ]

  return (
    <DashboardLayout userRole="business">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Varslingsinnstillinger
          </h1>
          <p className="text-gray-600">
            Tilpass varsler for nye auksjoner og velg hvilke bilmerker du vil følge
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Hovedinnstillinger */}
          <div className="lg:col-span-2 space-y-6">
            <BusinessNotificationSettings 
              settings={notificationSettings} 
              popularBrands={popularBrands}
            />
          </div>

          {/* Sidebar - Statistikk og tips */}
          <div className="space-y-6">
            
            {/* Varslingsstatistikk */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Denne uken
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{notificationStats.thisWeek.sent}</div>
                    <div className="text-gray-600">Sendt</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{notificationStats.thisWeek.clicked}</div>
                    <div className="text-gray-600">Åpnet</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Car className="h-3 w-3 text-blue-500" />
                      Nye auksjoner
                    </span>
                    <span className="font-semibold">{notificationStats.thisWeek.newAuctions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Bell className="h-3 w-3 text-orange-500" />
                      Bud-varsler
                    </span>
                    <span className="font-semibold">{notificationStats.thisWeek.bidAlerts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-red-500" />
                      Avslutter snart
                    </span>
                    <span className="font-semibold">{notificationStats.thisWeek.endingAlerts}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Månedlig sammendrag */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Forrige måned</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Totale varsler:</span>
                    <span className="font-semibold">{notificationStats.lastMonth.totalNotifications}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Åpningsrate:</span>
                    <span className="font-semibold text-green-600">{notificationStats.lastMonth.clickRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tid spart:</span>
                    <span className="font-semibold text-blue-600">{notificationStats.lastMonth.savedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Auksjoner funnet:</span>
                    <span className="font-semibold">{notificationStats.lastMonth.auctionsFound}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Varslingskanal status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kanaler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">E-post</span>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Aktiv
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">SMS</span>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Aktiv
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Push (app)</span>
                    </div>
                    <Badge variant="outline" className="text-gray-600 border-gray-200">
                      Ikke tilgjengelig
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Varslings-tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• <strong>Vær spesifikk:</strong> Velg kun merker du faktisk kjøper</p>
                <p>• <strong>Sett prisgrenser:</strong> Unngå irrelevante varsler</p>
                <p>• <strong>Test kanaler:</strong> Sjekk at du mottar varsler</p>
                <p>• <strong>Juster ofte:</strong> Oppdater preferanser etter behov</p>
                <p>• <strong>Rask respons:</strong> Varsler kommer øyeblikkelig</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
