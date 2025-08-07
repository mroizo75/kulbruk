import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle, Clock, Eye, Shield, X } from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'

// Mock data for rapporter - i fremtiden skal dette komme fra database
const mockReports = [
  {
    id: '1',
    listingId: 'listing-1',
    listingTitle: '2018 BMW X5 - Perfekt stand',
    reportedBy: 'Lars Andersen',
    reporterEmail: 'lars@example.com',
    reason: 'spam',
    description: 'Denne annonsen ser ut som spam. Samme annonse er postet flere ganger.',
    status: 'pending',
    createdAt: new Date('2024-01-15T10:30:00'),
    listingOwner: 'Erik Nordahl'
  },
  {
    id: '2',
    listingId: 'listing-2',
    listingTitle: 'iPhone 15 Pro - Ny i eske',
    reportedBy: 'Maria Hansen',
    reporterEmail: 'maria@example.com',
    reason: 'inappropriate',
    description: 'Bildene ser ikke autentiske ut, mistenker svindel.',
    status: 'pending',
    createdAt: new Date('2024-01-15T09:15:00'),
    listingOwner: 'Ola Svendsen'
  },
  {
    id: '3',
    listingId: 'listing-3',
    listingTitle: 'Leilighet til salgs - Sentrum',
    reportedBy: 'Tom Wilson',
    reporterEmail: 'tom@example.com',
    reason: 'wrong_category',
    description: 'Dette er en utleieannonse, ikke salg.',
    status: 'resolved',
    createdAt: new Date('2024-01-14T16:45:00'),
    listingOwner: 'Anne Kristiansen',
    resolvedAt: new Date('2024-01-15T08:30:00'),
    action: 'removed'
  }
]

function getReasonText(reason: string) {
  switch (reason) {
    case 'spam': return 'Spam'
    case 'inappropriate': return 'Upassende innhold'
    case 'wrong_category': return 'Feil kategori'
    case 'fraud': return 'Svindel'
    case 'duplicate': return 'Duplikat'
    default: return 'Annet'
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="text-orange-600 border-orange-200">Venter</Badge>
    case 'resolved':
      return <Badge className="bg-green-600">Løst</Badge>
    case 'dismissed':
      return <Badge variant="secondary">Avvist</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

export default async function ModeratorReportsPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in?redirectUrl=/dashboard/moderator/rapporter')
  }

  // Sjekk moderator tilgang - denne sjekken ville normalt være mot database
  // For nå aksepterer vi at brukeren har tilgang

  const pendingReports = mockReports.filter(r => r.status === 'pending')
  const resolvedReports = mockReports.filter(r => r.status !== 'pending')

  return (
    <DashboardLayout userRole="moderator">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapport-behandling</h1>
          <p className="text-gray-600">Håndter rapporterte annonser og innhold</p>
        </div>

        {/* Status oversikt */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2 text-orange-500" />
                Ventende rapporter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingReports.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Løst i dag
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {resolvedReports.filter(r => 
                  r.resolvedAt && 
                  new Date(r.resolvedAt).toDateString() === new Date().toDateString()
                ).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Shield className="h-4 w-4 mr-2 text-blue-500" />
                Totalt behandlet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{resolvedReports.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Ventende rapporter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Rapporter som venter på behandling ({pendingReports.length})
            </CardTitle>
            <CardDescription>
              Disse rapportene trenger moderatorbehandling
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingReports.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen ventende rapporter!</h3>
                <p className="text-gray-500">Alle rapporter er behandlet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{report.listingTitle}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Rapportert av {report.reportedBy} ({report.reporterEmail})
                        </p>
                        <p className="text-sm text-gray-500">
                          Eier: {report.listingOwner}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(report.status)}
                        <Badge variant="outline" className="text-red-600 border-red-200">
                          {getReasonText(report.reason)}
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="font-medium text-sm">Beskrivelse av problem:</span>
                      <p className="text-gray-600 text-sm mt-1">{report.description}</p>
                    </div>

                    <div className="mb-4 text-sm text-gray-500">
                      Rapportert: {report.createdAt.toLocaleDateString('no-NO')} kl. {report.createdAt.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <a href={`/annonser/${report.listingId}`} target="_blank">
                          <Eye className="h-4 w-4 mr-2" />
                          Se annonse
                        </a>
                      </Button>

                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Fjern annonse
                      </Button>

                      <Button
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Advar bruker
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Avvis rapport
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Behandlede rapporter */}
        <Card>
          <CardHeader>
            <CardTitle>Behandlede rapporter</CardTitle>
            <CardDescription>
              Oversikt over nylig behandlede rapporter
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resolvedReports.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Ingen behandlede rapporter ennå
              </p>
            ) : (
              <div className="space-y-3">
                {resolvedReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <h4 className="font-medium">{report.listingTitle}</h4>
                      <p className="text-sm text-gray-500">
                        {getReasonText(report.reason)} • Rapportert av {report.reportedBy} •
                        {report.resolvedAt && ` Løst ${new Date(report.resolvedAt).toLocaleDateString('no-NO')}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(report.status)}
                      {report.action && (
                        <Badge variant="outline" className="text-xs">
                          {report.action === 'removed' ? 'Fjernet' : 
                           report.action === 'warned' ? 'Advart' : 'Annet'}
                        </Badge>
                      )}
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
