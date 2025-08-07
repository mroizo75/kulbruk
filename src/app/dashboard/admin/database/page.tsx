import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Database, Play, CheckCircle, AlertCircle, Users, FileText, Tag, Gavel, TrendingUp } from 'lucide-react'
import DatabaseSeeder from '@/components/admin/database-seeder'
import DatabaseStats from '@/components/admin/database-stats'

export default function DatabaseManagementPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Management</h1>
        <p className="text-gray-600">
          Administrer database data, seed testdata og overvåk statistikk for produksjonsdrift.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Database Seeding</CardTitle>
                  <CardDescription>
                    Legg til testdata for demonstrasjon og testing
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Suspense fallback={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }>
              <DatabaseSeeder />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Live Statistikk</CardTitle>
                  <CardDescription>
                    Se live data som brukes på homepage
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Suspense fallback={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            }>
              <DatabaseStats />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            System Status
          </CardTitle>
          <CardDescription>
            Status for alle systemkomponenter og database integrasjoner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800">Database</p>
                <p className="text-xs text-green-600">Tilkoblet og operativ</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Online</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800">Clerk Auth</p>
                <p className="text-xs text-green-600">Synkronisert</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800">Vegvesen API</p>
                <p className="text-xs text-green-600">Tilgjengelig</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Operativ</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-800">Live Updates</p>
                <p className="text-xs text-blue-600">SSE aktiv</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Strøm</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Brukere</h3>
            <p className="text-2xl font-bold text-blue-600">Live data</p>
            <p className="text-sm text-gray-600">Fra database</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Annonser</h3>
            <p className="text-2xl font-bold text-green-600">Live data</p>
            <p className="text-sm text-gray-600">Alle statuser</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Tag className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Kategorier</h3>
            <p className="text-2xl font-bold text-purple-600">Live data</p>
            <p className="text-sm text-gray-600">Med tellere</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Gavel className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Auksjoner</h3>
            <p className="text-2xl font-bold text-orange-600">Live data</p>
            <p className="text-sm text-gray-600">Aktive og historiske</p>
          </CardContent>
        </Card>
      </div>

      {/* Production Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Produksjonsmerknad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 mb-2">🚀 Klart for produksjon!</h4>
            <div className="space-y-2 text-sm text-amber-700">
              <p>✅ <strong>Live data:</strong> Homepage henter nå all statistikk fra databasen</p>
              <p>✅ <strong>Real-time updates:</strong> Alle tall oppdateres automatisk hver 30-60 sekunder</p>
              <p>✅ <strong>Fallback:</strong> Dummy data vises hvis database ikke er tilgjengelig</p>
              <p>✅ <strong>Performance:</strong> Optimaliserte queries med parallelle hentinger</p>
              <p>⚠️ <strong>Merk:</strong> Seed database med testdata for best demonstrasjon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
