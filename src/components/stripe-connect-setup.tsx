'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, CreditCard, ExternalLink, Loader2, HelpCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import StripeConnectGuide from '@/components/stripe-connect-guide'

interface StripeConnectStatus {
  hasAccount: boolean
  accountId?: string
  onboardingCompleted: boolean
  payoutsEnabled: boolean
  chargesEnabled: boolean
  status: string
  onboardingUrl?: string
  country?: string
  defaultCurrency?: string
  businessType?: string
  error?: string
}

export default function StripeConnectSetup() {
  const [status, setStatus] = useState<StripeConnectStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/stripe-connect/status')
      const data = await response.json()
      
      if (response.ok) {
        setStatus(data)
      } else {
        setError(data.error || 'Feil ved henting av status')
      }
    } catch (err) {
      setError('Nettverksfeil ved henting av status')
    } finally {
      setLoading(false)
    }
  }

  const createAccount = async () => {
    setCreating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/stripe-connect/create-account', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (response.ok && data.onboardingUrl) {
        // Redirect til Stripe onboarding
        window.location.href = data.onboardingUrl
      } else {
        setError(data.error || 'Feil ved opprettelse av konto')
      }
    } catch (err) {
      setError('Nettverksfeil ved opprettelse av konto')
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const getStatusBadge = () => {
    if (!status?.hasAccount) return null
    
    switch (status.status) {
      case 'enabled':
        return <Badge className="bg-green-100 text-green-800">Aktivert</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Venter</Badge>
      case 'incomplete':
        return <Badge className="bg-gray-100 text-gray-800">Ikke fullført</Badge>
      default:
        return <Badge variant="outline">{status.status}</Badge>
    }
  }

  const getStatusIcon = () => {
    if (!status?.hasAccount) return <CreditCard className="h-5 w-5 text-gray-400" />
    
    if (status.payoutsEnabled && status.chargesEnabled) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }
    
    return <AlertCircle className="h-5 w-5 text-yellow-600" />
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Henter Stripe Connect status...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Motta betalinger (Stripe Connect)
          {getStatusBadge()}
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-auto">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Guide: Sett opp Stripe Connect</DialogTitle>
              </DialogHeader>
              <StripeConnectGuide />
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!status?.hasAccount ? (
          <>
            <div className="space-y-3">
              <p className="text-gray-600">
                For å motta betaling gjennom Fort gjort, må du sette opp en Stripe Connect konto.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">✨ Hva får du?</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Sikker betaling direkte til din bankkonto</li>
                  <li>• Gratis Stripe mobilapp for å følge salg</li>
                  <li>• Automatiske skatterapporter</li>
                  <li>• Beskyttelse mot svindel</li>
                </ul>
              </div>
              
              <div className="text-sm text-gray-500">
                💡 <strong>Tips:</strong> Last ned Stripe appen etter registrering for best opplevelse
              </div>
            </div>
            
            <Button 
              onClick={createAccount} 
              disabled={creating}
              className="w-full"
              size="lg"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Oppretter konto...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Sett opp Stripe Connect (gratis)
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Onboarding fullført:</span>
                <span className={`text-sm ${status.onboardingCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
                  {status.onboardingCompleted ? 'Ja' : 'Nei'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Kan motta betaling:</span>
                <span className={`text-sm ${status.chargesEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {status.chargesEnabled ? 'Ja' : 'Nei'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Utbetalinger aktivert:</span>
                <span className={`text-sm ${status.payoutsEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {status.payoutsEnabled ? 'Ja' : 'Nei'}
                </span>
              </div>
              {status.country && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Land:</span>
                  <span className="text-sm">{status.country.toUpperCase()}</span>
                </div>
              )}
              {status.defaultCurrency && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Valuta:</span>
                  <span className="text-sm">{status.defaultCurrency.toUpperCase()}</span>
                </div>
              )}
            </div>

            {!status.onboardingCompleted && (
              <Button 
                onClick={status.onboardingUrl ? 
                  () => window.location.href = status.onboardingUrl! : 
                  () => fetchStatus() // Refresh to get new onboarding URL
                }
                className="w-full"
                variant="outline"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Oppdaterer...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {status.onboardingUrl ? 'Fullfør Stripe onboarding' : 'Fortsett med Stripe Connect'}
                  </>
                )}
              </Button>
            )}

            {status.onboardingCompleted && (!status.chargesEnabled || !status.payoutsEnabled) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Din konto er under gjennomgang av Stripe. Dette kan ta 1-2 virkedager.
                </AlertDescription>
              </Alert>
            )}

            {status.payoutsEnabled && status.chargesEnabled && (
              <>
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Din Stripe Connect konto er fullstendig aktivert. Du kan nå motta betalinger gjennom Fort gjort!
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <h4 className="font-medium">📱 Administrer salget ditt</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Button 
                      onClick={() => window.open('https://dashboard.stripe.com/express/accounts', '_blank')}
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Web Dashboard
                    </Button>
                    <Button 
                      onClick={() => window.open('https://apps.apple.com/app/stripe-dashboard/id978516833', '_blank')}
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      📱 iOS App
                    </Button>
                    <Button 
                      onClick={() => window.open('https://play.google.com/store/apps/details?id=com.stripe.android', '_blank')}
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      🤖 Android App
                    </Button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
