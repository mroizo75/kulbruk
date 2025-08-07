import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, AlertTriangle, CheckCircle, Users, ListIcon } from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'

const prisma = new PrismaClient()

export default async function ModeratorDashboard() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in?redirectUrl=/dashboard/moderator')
  }

  // Sjekk at brukeren er moderator
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { role: true }
  })

  if (!dbUser || (dbUser.role !== 'moderator' && dbUser.role !== 'admin')) {
    redirect('/dashboard/customer')
  }

  // Hent statistikk for moderator dashboard
  const [
    pendingListings,
    totalListings,
    totalUsers,
    recentListings
  ] = await Promise.all([
    // Ventende annonser
    prisma.listing.count({
      where: { status: 'PENDING' }
    }),
    
    // Totale annonser
    prisma.listing.count(),
    
    // Totale brukere
    prisma.user.count(),
    
    // Nylige ventende annonser
    prisma.listing.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ])

  return (
    <DashboardLayout userRole="moderator">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moderator Dashboard</h1>
          <p className="text-gray-600">Håndter annonser og moderer innhold</p>
        </div>

        {/* Kritiske varsler */}
        {pendingListings > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-800">Oppmerksomhet påkrevd</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-orange-700">
                {pendingListings} annonse{pendingListings !== 1 ? 'r' : ''} venter på godkjenning
              </p>
              <Button className="mt-3 bg-orange-600 hover:bg-orange-700" asChild>
                <a href="/dashboard/moderator/annonser">Gå til annonse-godkjenning</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Statistikk kort */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventende annonser</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingListings}</div>
              <p className="text-xs text-muted-foreground">Krever godkjenning</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale annonser</CardTitle>
              <ListIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalListings}</div>
              <p className="text-xs text-muted-foreground">Alle kategorier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale brukere</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registrerte brukere</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Aktiv</div>
              <p className="text-xs text-muted-foreground">Moderering</p>
            </CardContent>
          </Card>
        </div>

        {/* Nylige ventende annonser */}
        <Card>
          <CardHeader>
            <CardTitle>Nylige ventende annonser</CardTitle>
            <CardDescription>
              Annonser som venter på godkjenning
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentListings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Ingen ventende annonser for øyeblikket
              </p>
            ) : (
              <div className="space-y-4">
                {recentListings.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{listing.title}</h3>
                      <p className="text-sm text-gray-500">
                        av {listing.user.firstName} {listing.user.lastName}
                      </p>
                      <p className="text-sm text-gray-400">
                        {listing.categoryId} • {new Date(listing.createdAt).toLocaleDateString('no-NO')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        {listing.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        asChild
                      >
                        <a href={`/dashboard/moderator/annonser/${listing.id}`}>
                          Behandle
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hurtig tilgang */}
        <Card>
          <CardHeader>
            <CardTitle>Hurtig tilgang</CardTitle>
            <CardDescription>
              Vanlige moderatoroppgaver
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                asChild
              >
                <a href="/dashboard/moderator/annonser">
                  <Clock className="h-6 w-6" />
                  <span>Godkjenn annonser</span>
                  {pendingListings > 0 && (
                    <Badge className="bg-orange-600">{pendingListings}</Badge>
                  )}
                </a>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                asChild
              >
                <a href="/dashboard/moderator/rapporter">
                  <AlertTriangle className="h-6 w-6" />
                  <span>Behandle rapporter</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
