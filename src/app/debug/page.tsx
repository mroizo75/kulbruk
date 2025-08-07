"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle, XCircle, RefreshCw, User, Database, Settings } from 'lucide-react'

export default function DebugPage() {
  const { data: session, status } = useSession()
  const isLoaded = status !== 'loading'
  const isSignedIn = !!session
  const [authDebug, setAuthDebug] = useState<any>(null)
  const [syncTest, setSyncTest] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchAuthDebug = async () => {
    try {
      const response = await fetch('/api/debug-auth')
      const data = await response.json()
      setAuthDebug(data)
    } catch (error) {
      console.error('Feil ved debug:', error)
    }
  }

  const testSync = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-sync')
      const data = await response.json()
      setSyncTest({ ...data, status: response.status })
    } catch (error) {
      setSyncTest({ error: 'Nettverksfeil', details: error })
    }
    setLoading(false)
  }

  const manualSync = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-sync', { method: 'POST' })
      const data = await response.json()
      setSyncTest({ ...data, status: response.status, manual: true })
    } catch (error) {
      setSyncTest({ error: 'Nettverksfeil ved manuell sync', details: error })
    }
    setLoading(false)
  }

  const forceSync = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/force-sync', { method: 'POST' })
      const data = await response.json()
      setSyncTest({ ...data, status: response.status, forced: true })
      
      // Refresh auth debug etter force sync
      if (response.ok) {
        setTimeout(() => {
          fetchAuthDebug()
        }, 1000)
      }
    } catch (error) {
      setSyncTest({ error: 'Nettverksfeil ved force sync', details: error })
    }
    setLoading(false)
  }

  const manualUserSync = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/manual-user-sync', { method: 'POST' })
      const data = await response.json()
      setSyncTest({ ...data, status: response.status, manual_all: true })
      
      // Refresh auth debug etter manual sync
      if (response.ok) {
        setTimeout(() => {
          fetchAuthDebug()
        }, 1000)
      }
    } catch (error) {
      setSyncTest({ error: 'Nettverksfeil ved manuell brukersynk', details: error })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAuthDebug()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🔧 Debug Dashboard</h1>
          <p className="text-gray-600 mt-2">Test autentisering og synkronisering</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Clerk brukerinformasjon */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Clerk Autentisering
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {isSignedIn ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  {isSignedIn ? 'Logget inn' : 'Ikke logget inn'}
                </span>
              </div>

              {isSignedIn && session?.user && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Brukerinformasjon:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>ID:</strong> {session?.user.id}</p>
                    <p><strong>E-post:</strong> {session?.user.email}</p>
                    <p><strong>Navn:</strong> {session?.user.firstName} {session?.user.lastName}</p>
                    <p><strong>Rolle:</strong> {session?.user.role || 'Ikke satt'}</p>
                  </div>
                </div>
              )}

              {!isSignedIn && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-800 mb-3">Du må logge inn for å teste API-er</p>
                  <div className="flex gap-2">
                    <Button asChild size="sm">
                      <Link href="/sign-in">Logg inn</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/sign-up">Registrer deg</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Server-side auth debug */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Server-side Debug
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={fetchAuthDebug}
                  className="ml-auto"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {authDebug ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {authDebug.debug.isAuthenticated ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      Server auth: {authDebug.debug.isAuthenticated ? 'OK' : 'Feil'}
                    </span>
                  </div>

                  <div className="text-sm bg-gray-50 p-3 rounded">
                    <pre>{JSON.stringify(authDebug.debug, null, 2)}</pre>
                  </div>

                  <div className="bg-blue-50 p-3 rounded">
                    <p className="font-medium text-blue-800">{authDebug.instructions.message}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Laster debug info...</p>
              )}
            </CardContent>
          </Card>

          {/* Database synkronisering */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Synkronisering
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={testSync} 
                  disabled={loading || !isSignedIn}
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Test synkronisering
                </Button>
                <Button 
                  variant="outline" 
                  onClick={manualSync} 
                  disabled={loading || !isSignedIn}
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Manuell synkronisering
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={forceSync} 
                  disabled={loading || !isSignedIn}
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Force Sync (Fiks DB)
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={manualUserSync} 
                  disabled={loading}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Sync ALLE brukere (🚀 LØSER PROBLEMET)
                </Button>
              </div>

              {!isSignedIn && (
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <p className="text-yellow-800 text-sm">
                    Du må være logget inn for å teste synkronisering
                  </p>
                </div>
              )}

              {syncTest && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    Synkronisering resultat (Status: {syncTest.status})
                  </h4>
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(syncTest, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Navigasjon */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Hurtig navigasjon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild variant="outline">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/business">Bedrift Dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/admin">Admin Dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/opprett">Opprett annonse</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}