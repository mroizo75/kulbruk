'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function SyncAdminPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSync = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/sync-user-role', {
        method: 'POST',
        credentials: 'include'
      })
      
      const data = await response.json()
      setResult(data)
      
      if (response.ok) {
        toast.success('Rolle synkronisert! Refresh siden for å se endringer.')
      } else {
        toast.error(data.error || 'Noe gikk galt')
      }
    } catch (error) {
      console.error('Sync feil:', error)
      toast.error('Kunne ikke synkronisere rolle')
      setResult({ error: 'Network error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Crown className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <CardTitle className="text-2xl">Admin Rolle Sync</CardTitle>
          <p className="text-gray-600">
            Synkroniser admin rolle mellom Clerk og database
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleSync} 
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Synkroniserer...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Synkroniser Rolle
              </>
            )}
          </Button>

          {result && (
            <div className="mt-6 p-4 rounded-lg border">
              {result.success ? (
                <div className="text-green-700">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Synkronisering vellykket!</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong>Email:</strong> {result.data?.email}</p>
                    <p><strong>Database rolle:</strong> {result.data?.databaseRole}</p>
                    <p><strong>Ny Clerk rolle:</strong> {result.data?.newClerkRole}</p>
                  </div>
                </div>
              ) : (
                <div className="text-red-700">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Feil ved synkronisering</span>
                  </div>
                  <p className="text-sm">{result.error}</p>
                </div>
              )}
            </div>
          )}

          {result?.success && (
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="w-full"
            >
              Gå til Dashboard
            </Button>
          )}

          <div className="text-xs text-gray-500 text-center mt-4">
            <p>Hvis du har satt role=&quot;admin&quot; i database men kommer til customer dashboard,</p>
            <p>bruk denne knappen for å synkronisere.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}