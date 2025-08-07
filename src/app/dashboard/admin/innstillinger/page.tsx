import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Settings, Tag, Globe, Mail, Shield, Database, Bell } from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PrismaClient } from '@prisma/client'
import CategoryManager from '@/components/category-manager'
import SystemSettings from '@/components/system-settings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const prisma = new PrismaClient()

export default async function AdminSettingsPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/sign-in?redirectUrl=/dashboard/admin/innstillinger')
  }

  // Sjekk at brukeren er admin
  const currentDbUser = await prisma.user.findUnique({
    where: { id: session.user?.id }
  })

  if (!currentDbUser || currentDbUser.role !== 'admin') {
    redirect('/dashboard')
  }

  // Hent kategorier og systeminfo
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          listings: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  const systemStats = {
    totalUsers: await prisma.user.count(),
    totalListings: await prisma.listing.count(),
    categoriesCount: categories.length,
    pendingListings: await prisma.listing.count({ where: { status: 'PENDING' } })
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        {/* Overskrift */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Systeminnstillinger</h1>
          <p className="text-gray-600">
            Konfigurer og administrer systemet
          </p>
        </div>

        {/* System oversikt */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Totale brukere</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Tag className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Totale annonser</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.totalListings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Kategorier</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.categoriesCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bell className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ventende</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.pendingListings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Innstillinger tabs */}
        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Kategorier
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifikasjoner
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sikkerhet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Kategori administrasjon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryManager categories={categories} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Systemkonfigurasjon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SystemSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifikasjonsinnstillinger
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">E-post ved nye annonser</h3>
                      <p className="text-sm text-gray-600">Få e-post når nye annonser krever godkjenning</p>
                    </div>
                    <Button variant="outline">
                      Aktiver
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">E-post ved rapporter</h3>
                      <p className="text-sm text-gray-600">Få e-post når annonser rapporteres</p>
                    </div>
                    <Button variant="outline">
                      Aktiver
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Daglig rapport</h3>
                      <p className="text-sm text-gray-600">Få daglig sammendrag av aktivitet</p>
                    </div>
                    <Button variant="outline">
                      Aktiver
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Sikkerhetsinnstillinger
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">To-faktor autentisering</h3>
                      <p className="text-sm text-gray-600">Ekstra sikkerhet for admin-kontoer</p>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Aktivert via Clerk
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">API nøkler</h3>
                      <p className="text-sm text-gray-600">Administrer API tilgang for tredjepartstjenester</p>
                    </div>
                    <Button variant="outline">
                      Administrer
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Session timeout</h3>
                      <p className="text-sm text-gray-600">Automatisk utlogging etter inaktivitet</p>
                    </div>
                    <Button variant="outline">
                      Konfigurer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}