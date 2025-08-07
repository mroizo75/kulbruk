'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Webhook, Database, RefreshCw } from 'lucide-react'

export default function WebhookTestPage() {
  const [loading, setLoading] = useState(false)
  const [webhookTest, setWebhookTest] = useState<any>(null)
  const [userCount, setUserCount] = useState<any>(null)

  const testWebhookEndpoint = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/webhooks/clerk-simple')
      const data = await response.json()
      setWebhookTest({
        ...data,
        status: response.status,
        working: response.ok
      })
    } catch (error) {
      setWebhookTest({
        error: 'Webhook endpoint ikke tilgjengelig',
        working: false,
        details: error
      })
    }
    setLoading(false)
  }

  const checkUserCounts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/manual-user-sync')
      const data = await response.json()
      setUserCount(data)
    } catch (error) {
      setUserCount({
        error: 'Kunne ikke hente brukerstatistikk',
        details: error
      })
    }
    setLoading(false)
  }

  const simulateWebhook = async () => {
    setLoading(true)
    try {
      // Simuler en webhook-payload
      const mockPayload = {
        type: 'user.created',
        data: {
          id: 'test_user_' + Date.now(),
          email_addresses: [{ email_address: 'test@example.com' }],
          first_name: 'Test',
          last_name: 'Bruker',
          public_metadata: { role: 'customer' }
        }
      }

      const response = await fetch('/api/webhooks/clerk-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockPayload)
      })

      const result = await response.text()
      setWebhookTest({
        message: 'Webhook test sendt',
        status: response.status,
        response: result,
        working: response.ok,
        simulated: true
      })
    } catch (error) {
      setWebhookTest({
        error: 'Webhook simulering feilet',
        working: false,
        details: error
      })
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Webhook Test Center</h1>
          <p className="text-gray-600">Test og verifiser webhook-konfigurasjonen for automatisk brukersynkronisering</p>
        </div>

        <div className="grid gap-6">
          {/* Webhook Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhook Endpoint Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={testWebhookEndpoint} disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Test Endpoint
                </Button>
                <Button variant="outline" onClick={simulateWebhook} disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Simuler Webhook
                </Button>
              </div>

              {webhookTest && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {webhookTest.working ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-semibold">
                      Status: {webhookTest.status}
                    </span>
                    <Badge variant={webhookTest.working ? "default" : "destructive"}>
                      {webhookTest.working ? "Fungerer" : "Feil"}
                    </Badge>
                    {webhookTest.simulated && (
                      <Badge variant="secondary">Simulert</Badge>
                    )}
                  </div>
                  <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                    {JSON.stringify(webhookTest, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Count Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Bruker Synkronisering
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={checkUserCounts} disabled={loading}>
                {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                Sjekk Synkronisering
              </Button>

              {userCount && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-700">Clerk</h4>
                      <p className="text-2xl font-bold">{userCount.clerk?.total || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">Database</h4>
                      <p className="text-2xl font-bold">{userCount.database?.total || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {userCount.sync && (
                    <div className="flex items-center gap-2">
                      {userCount.sync.needed ? (
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      <span>{userCount.sync.message}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Setup Instruksjoner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🔧 For automatisk synkronisering:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Sett opp <code>.env.local</code> med <code>CLERK_WEBHOOK_SECRET</code></li>
                  <li>Gå til Clerk Dashboard → Webhooks</li>
                  <li>Legg til endpoint: <code>http://localhost:3000/api/webhooks/clerk-simple</code></li>
                  <li>Velg events: user.created, user.updated, user.deleted</li>
                  <li>Test ved å registrere ny bruker</li>
                </ol>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">✅ Webhook fungerer når:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Endpoint test returnerer 200 OK</li>
                  <li>Nye brukere automatisk havner i database</li>
                  <li>Terminal viser webhook-logging</li>
                  <li>Clerk og database brukerantal stemmer overens</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">⚠️ Vanlige problemer:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Manglende <code>CLERK_WEBHOOK_SECRET</code> i .env.local</li>
                  <li>Feil webhook URL i Clerk Dashboard</li>
                  <li>Server ikke tilgjengelig på webhook URL</li>
                  <li>Database connection problemer</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}