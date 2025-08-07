import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, CheckCircle, Eye, FileCheck, Users, X, Shield } from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function AdminModerationPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/sign-in?redirectUrl=/dashboard/admin/moderering')
  }

  // Sjekk admin tilgang
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user?.id },
    select: { role: true }
  })

  if (!dbUser || dbUser.role !== 'admin') {
    redirect('/dashboard/customer')
  }

  // Hent moderering-relatert data
  const [
    pendingListings,
    recentModerations,
    pendingReports,
    activeModerators
  ] = await Promise.all([
    // Ventende annonser
    prisma.listing.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    
    // Nylig modererte annonser
    prisma.listing.findMany({
      where: { 
        status: { in: ['APPROVED', 'REJECTED'] }
      },
      include: {
        user: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 8
    }),
    
    // Mock rapporter (implementer Report model senere)
    Promise.resolve([
      {
        id: '1',
        listingTitle: 'BMW X5 2020 - Perfekt stand',
        reportedBy: 'Lars Hansen',
        reason: 'Spam',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2', 
        listingTitle: 'iPhone 15 Pro Max',
        reportedBy: 'Maria Olsen',
        reason: 'Feil kategori',
        status: 'pending', 
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      }
    ]),
    
    // Aktive moderatorer
    prisma.user.findMany({
      where: { role: 'moderator' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    })
  ])

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moderering Oversikt</h1>
          <p className="text-gray-600">Sentralisert moderering av innhold og aktivitet</p>
        </div>

        {/* Kritiske varsler */}
        {(pendingListings.length > 0 || pendingReports.length > 0) && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-800">Krever umiddelbar oppmerksomhet</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingListings.length > 0 && (
                <p className="text-red-700">
                  • {pendingListings.length} annonse{pendingListings.length !== 1 ? 'r' : ''} venter på godkjenning
                </p>
              )}
              {pendingReports.length > 0 && (
                <p className="text-red-700">
                  • {pendingReports.length} rapport{pendingReports.length !== 1 ? 'er' : ''} venter på behandling
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Statistikk kort */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventende annonser</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingListings.length}</div>
              <p className="text-xs text-muted-foreground">Krever godkjenning</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventende rapporter</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{pendingReports.length}</div>
              <p className="text-xs text-muted-foreground">Trenger behandling</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Moderert i dag</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {recentModerations.filter(m => 
                  m.status === 'APPROVED' && 
                  new Date(m.updatedAt).toDateString() === new Date().toDateString()
                ).length}
              </div>
              <p className="text-xs text-muted-foreground">Behandlede saker</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive moderatorer</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeModerators.length}</div>
              <p className="text-xs text-muted-foreground">Tilgjengelige</p>
            </CardContent>
          </Card>
        </div>

        {/* Hurtig handlinger */}
        <Card>
          <CardHeader>
            <CardTitle>Moderering handlinger</CardTitle>
            <CardDescription>
              Hurtigtilgang til moderering funksjoner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/dashboard/admin/annonser">
                <Card className="hover:shadow-md transition-shadow cursor-pointer bg-orange-50 border-orange-200">
                  <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                    <FileCheck className="h-8 w-8 text-orange-600" />
                    <div>
                      <h3 className="font-medium text-orange-800">Godkjenn annonser</h3>
                      <p className="text-xs text-orange-600">{pendingListings.length} ventende</p>
                    </div>
                    {pendingListings.length > 0 && (
                      <Badge className="bg-orange-600">{pendingListings.length}</Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/admin/rapporter">
                <Card className="hover:shadow-md transition-shadow cursor-pointer bg-red-50 border-red-200">
                  <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <div>
                      <h3 className="font-medium text-red-800">Behandle rapporter</h3>
                      <p className="text-xs text-red-600">{pendingReports.length} ventende</p>
                    </div>
                    {pendingReports.length > 0 && (
                      <Badge variant="destructive">{pendingReports.length}</Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/admin/brukere">
                <Card className="hover:shadow-md transition-shadow cursor-pointer bg-blue-50 border-blue-200">
                  <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-blue-800">Administrer brukere</h3>
                      <p className="text-xs text-blue-600">Rolle-endringer</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/admin/innstillinger">
                <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gray-50 border-gray-200">
                  <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                    <Shield className="h-8 w-8 text-gray-600" />
                    <div>
                      <h3 className="font-medium text-gray-800">Systeminnstillinger</h3>
                      <p className="text-xs text-gray-600">Konfigurasjoner</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Siste ventende annonser */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Siste ventende annonser</CardTitle>
                <CardDescription>
                  Annonser som venter på moderatorgodkjenning
                </CardDescription>
              </div>
              <Link href="/dashboard/admin/annonser">
                <Button variant="outline" size="sm">Se alle</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingListings.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen ventende annonser!</h3>
                <p className="text-gray-500">Alle annonser er behandlet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingListings.slice(0, 5).map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{listing.title}</h4>
                      <p className="text-sm text-gray-500">
                        av {listing.user.firstName} {listing.user.lastName} • 
                        {new Date(listing.createdAt).toLocaleDateString('no-NO')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        Venter
                      </Badge>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/annonser/detaljer/${listing.id}`} target="_blank">
                          <Eye className="h-4 w-4 mr-1" />
                          Se
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Aktive moderatorer */}
        <Card>
          <CardHeader>
            <CardTitle>Aktive moderatorer</CardTitle>
            <CardDescription>
              Oversikt over moderatorer som kan behandle innhold
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeModerators.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Ingen moderatorer registrert ennå
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeModerators.map((moderator) => (
                  <div key={moderator.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{moderator.firstName} {moderator.lastName}</h4>
                      <p className="text-sm text-gray-500">{moderator.email}</p>
                      <p className="text-xs text-gray-400">
                        Sist aktiv: {new Date(moderator.updatedAt).toLocaleDateString('no-NO')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        Moderator
                      </Badge>
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Aktiv"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
