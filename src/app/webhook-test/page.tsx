'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Database, User, Webhook } from 'lucide-react'

interface DebugData {
  clerkUser: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    createdAt: number
  }
  dbUser: any | null
  isUserSynced: boolean
  allUsersCount: number
  recentUsers: any[]
  webhookStatus: string
  environment: string
  databaseError: string | null
}

export default function WebhookTestPage() {
  const [debugData, setDebugData] = useState<DebugData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDebugData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/webhook-debug')
      if (!response.ok) {
        throw new Error(`API feil: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      
      setDebugData(data.debug)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ukjent feil')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugData()
  }, [])

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Webhook Test & Debug</h1>
        <p className="text-gray-600">Test om Clerk webhook synkroniserer brukere korrekt</p>
      </div>

      <div className="mb-6">
        <Button 
          onClick={fetchDebugData} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Henter data...' : 'Oppdater data'}
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Feil: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {debugData && (
        <div className="space-y-6">
          {/* Status oversikt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhook Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  {debugData.isUserSynced ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">
                      {debugData.isUserSynced ? 'Synkronisert' : 'IKKE synkronisert'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Bruker i database: {debugData.isUserSynced ? 'Ja' : 'Nei'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{debugData.allUsersCount} brukere</p>
                    <p className="text-sm text-gray-600">I database totalt</p>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className={`p-4 rounded-lg ${debugData.databaseError ? 'bg-red-50' : 'bg-blue-50'}`}>
                <p className={`text-sm ${debugData.databaseError ? 'text-red-800' : 'text-blue-800'}`}>
                  <strong>Status:</strong> {debugData.webhookStatus}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Miljø: {debugData.environment}
                </p>
                {debugData.databaseError && (
                  <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded">
                    <p className="text-sm font-medium text-red-800">Database-tilkoblingsfeil:</p>
                    <p className="text-xs text-red-700 mt-1">{debugData.databaseError}</p>
                    {debugData.databaseError.includes('sha256_password') && (
                      <div className="mt-2 text-xs text-red-600">
                        <strong>Løsning:</strong> Legg til <code className="bg-red-200 px-1 rounded">?authPlugin=mysql_native_password</code> i DATABASE_URL
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Clerk bruker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Clerk Bruker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ID</p>
                    <p className="font-mono text-sm">{debugData.clerkUser.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">E-post</p>
                    <p>{debugData.clerkUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Navn</p>
                    <p>{debugData.clerkUser.firstName} {debugData.clerkUser.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Opprettet</p>
                    <p>{new Date(debugData.clerkUser.createdAt).toLocaleString('no-NO')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database bruker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Bruker
              </CardTitle>
            </CardHeader>
            <CardContent>
              {debugData.dbUser ? (
                <div className="space-y-4">
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Bruker eksisterer i database
                  </Badge>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Database ID</p>
                      <p className="font-mono text-sm">{debugData.dbUser.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Clerk ID</p>
                      <p className="font-mono text-sm">{debugData.dbUser.clerkId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">E-post</p>
                      <p>{debugData.dbUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rolle</p>
                      <Badge variant="secondary">{debugData.dbUser.role}</Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">Bruker ikke funnet</h3>
                  <p className="text-gray-600 text-sm">
                    Denne brukeren eksisterer ikke i databasen. Webhook fungerer ikke korrekt.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Webhook instruksjoner */}
          {!debugData.isUserSynced && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="h-5 w-5" />
                  Webhook Konfigurering Påkrevd
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Webhook er ikke konfigurert riktig. Følg disse stegene:
                  </p>
                  
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Gå til <a href="https://dashboard.clerk.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Clerk Dashboard</a></li>
                    <li>Velg ditt prosjekt → Webhooks</li>
                    <li>Legg til endpoint: <code className="bg-gray-100 px-2 py-1 rounded">https://kulbruk.no/api/webhooks/clerk</code></li>
                    <li>Velg events: <code className="bg-gray-100 px-2 py-1 rounded">user.created</code>, <code className="bg-gray-100 px-2 py-1 rounded">user.updated</code>, <code className="bg-gray-100 px-2 py-1 rounded">user.deleted</code></li>
                    <li>Sett webhook secret i <code className="bg-gray-100 px-2 py-1 rounded">CLERK_WEBHOOK_SECRET</code> miljøvariabel</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}