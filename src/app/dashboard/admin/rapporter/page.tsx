import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AlertTriangle, Eye, CheckCircle, XCircle, Clock, Flag, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PrismaClient } from '@prisma/client'
import ReportActions from '@/components/report-actions'

const prisma = new PrismaClient()

export default async function AdminReportsPage() {
  const clerkUser = await currentUser()
  
  if (!clerkUser) {
    redirect('/sign-in?redirectUrl=/dashboard/admin/rapporter')
  }

  // Sjekk at brukeren er admin
  const currentDbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id }
  })

  if (!currentDbUser || currentDbUser.role !== 'admin') {
    redirect('/dashboard')
  }

  // Hent alle rapporter (mock data for nå siden vi ikke har Report model ennå)
  const mockReports = [
    {
      id: '1',
      listingId: 'listing_1',
      listingTitle: '2020 Tesla Model 3 - Perfekt stand',
      reportReason: 'Feil pris',
      reportDescription: 'Denne bilen er priset alt for lavt. Mistenker svindel.',
      reporterName: 'Ole Hansen',
      reporterEmail: 'ole@example.com',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 timer siden
      severity: 'HIGH'
    },
    {
      id: '2', 
      listingId: 'listing_2',
      listingTitle: 'Moderne leilighet i Oslo sentrum',
      reportReason: 'Støtende innhold',
      reportDescription: 'Innholdet i annonsen er støtende og upassende.',
      reporterName: 'Kari Nordmann',
      reporterEmail: 'kari@example.com',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 timer siden
      severity: 'MEDIUM'
    },
    {
      id: '3',
      listingId: 'listing_3', 
      listingTitle: 'Brukt iPhone 14 Pro',
      reportReason: 'Spam/dubletter',
      reportDescription: 'Samme annonse er lagt ut flere ganger.',
      reporterName: 'Per Petersen',
      reporterEmail: 'per@example.com',
      status: 'RESOLVED',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dag siden
      severity: 'LOW'
    }
  ]

  const pendingReports = mockReports.filter(r => r.status === 'PENDING')
  const resolvedToday = mockReports.filter(r => 
    r.status === 'RESOLVED' && 
    new Date(r.createdAt).toDateString() === new Date().toDateString()
  )

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

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'RESOLVED': return 'bg-green-100 text-green-800'
      case 'DISMISSED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        {/* Overskrift */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rapportsystem</h1>
          <p className="text-gray-600">
            Behandle rapporterte annonser fra brukere
          </p>
        </div>

        {/* Statistikk */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ventende rapporter</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingReports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Løst i dag</p>
                  <p className="text-2xl font-bold text-gray-900">{resolvedToday.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Flag className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Høy prioritet</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockReports.filter(r => r.severity === 'HIGH' && r.status === 'PENDING').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Totale rapporter</p>
                  <p className="text-2xl font-bold text-gray-900">{mockReports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ventende rapporter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Ventende rapporter
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingReports.length > 0 ? (
              <div className="space-y-4">
                {pendingReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {report.listingTitle}
                          </h3>
                          <Badge variant="outline" className={getSeverityColor(report.severity)}>
                            {report.severity}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Rapportert for:</strong> {report.reportReason}
                          </p>
                          <p className="text-sm text-gray-700">{report.reportDescription}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Rapportert av: {report.reporterName}</span>
                          <span>•</span>
                          <span>{getTimeAgo(report.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Link href={`/annonser/${report.listingId}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Se annonse
                          </Button>
                        </Link>
                        <ReportActions 
                          reportId={report.id}
                          listingId={report.listingId}
                          severity={report.severity}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ingen ventende rapporter
                </h3>
                <p className="text-gray-600">
                  Alle rapporter er behandlet. Bra jobbet!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nylige løste rapporter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Nylig løste rapporter
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resolvedToday.length > 0 ? (
              <div className="space-y-3">
                {resolvedToday.map((report) => (
                  <div key={report.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{report.listingTitle}</p>
                      <p className="text-sm text-gray-600">{report.reportReason}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getStatusColor(report.status)}>
                        Løst
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{getTimeAgo(report.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">
                Ingen rapporter løst i dag ennå
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}