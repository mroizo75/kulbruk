'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Smartphone, 
  CreditCard, 
  Shield, 
  Download, 
  CheckCircle, 
  ExternalLink,
  Eye,
  TrendingUp,
  FileText,
  Bell
} from 'lucide-react'

export default function StripeConnectGuide() {
  return (
    <div className="space-y-6">
      {/* Introduksjon */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Slik mottar du betaling gjennom Fort gjort
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            For å motta betaling når noen kjøper med Fort gjort, må du sette opp en Stripe konto. 
            Dette er gratis og tar bare noen minutter.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Trygt og sikkert</h4>
                <p className="text-sm text-blue-700">
                  Stripe er en av verdens største betalingsleverandører og brukes av millioner av bedrifter. 
                  Dine bankopplysninger er kryptert og beskyttet.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steg-for-steg guide */}
      <Card>
        <CardHeader>
          <CardTitle>Kom i gang på 3 enkle steg</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 text-green-600 rounded-full p-2 text-sm font-bold min-w-[32px] h-8 flex items-center justify-center">
                1
              </div>
              <div>
                <h4 className="font-medium">Klikk "Sett opp Stripe Connect"</h4>
                <p className="text-sm text-gray-600">
                  Du blir sendt til Stripe sin sikre onboarding-side hvor du fyller inn bankopplysninger
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-green-100 text-green-600 rounded-full p-2 text-sm font-bold min-w-[32px] h-8 flex items-center justify-center">
                2
              </div>
              <div>
                <h4 className="font-medium">Fullfør registreringen</h4>
                <p className="text-sm text-gray-600">
                  Oppgi bankkontonummer, personnummer og bekreft identiteten din
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-green-100 text-green-600 rounded-full p-2 text-sm font-bold min-w-[32px] h-8 flex items-center justify-center">
                3
              </div>
              <div>
                <h4 className="font-medium">Start å selge!</h4>
                <p className="text-sm text-gray-600">
                  Aktiver Fort gjort på dine annonser og motta sikre betalinger
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stripe App info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-purple-600" />
            Last ned Stripe appen
            <Badge variant="outline" className="text-purple-600 border-purple-600">Anbefalt</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Med Stripe appen kan du administrere salget ditt direkte fra mobilen:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Se alle transaksjoner</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Følg salgsstatistikk</span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Få varsler om nye salg</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Last ned skatterapporter</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Administrer utbetalinger</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Sikkerhet og innstillinger</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={() => window.open('https://apps.apple.com/app/stripe-dashboard/id978516833', '_blank')}
              variant="outline" 
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Last ned for iOS
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
            <Button 
              onClick={() => window.open('https://play.google.com/store/apps/details?id=com.stripe.android', '_blank')}
              variant="outline" 
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Last ned for Android
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center pt-2">
            Du kan også bruke <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">dashboard.stripe.com</a> på datamaskinen
          </div>
        </CardContent>
      </Card>

      {/* Ofte stilte spørsmål */}
      <Card>
        <CardHeader>
          <CardTitle>Ofte stilte spørsmål</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">💰 Koster det noe å bruke Stripe?</h4>
              <p className="text-sm text-gray-600 mt-1">
                Stripe tar 1,4% + 2 kr per transaksjon. Dette trekkes automatisk fra utbetalingen din.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">⏰ Hvor raskt får jeg pengene?</h4>
              <p className="text-sm text-gray-600 mt-1">
                Etter at kjøper har godkjent kjøpet, blir pengene utbetalt til din konto innen 1-2 virkedager.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">🏦 Hvilke banker støttes?</h4>
              <p className="text-sm text-gray-600 mt-1">
                Alle norske banker støttes. Du trenger bare kontonummer og BankID for verifisering.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">📱 Må jeg ha Stripe appen?</h4>
              <p className="text-sm text-gray-600 mt-1">
                Nei, appen er valgfri. Du kan bruke Stripe dashboard på nett, men appen gir deg enkel tilgang på mobilen.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">🔒 Er det trygt?</h4>
              <p className="text-sm text-gray-600 mt-1">
                Ja, Stripe er PCI DSS Level 1 sertifisert og brukes av millioner av bedrifter verden over, inkludert Store norske bedrifter.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support info */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">Trenger du hjelp?</h4>
              <p className="text-sm text-green-700 mt-1">
                Kontakt oss på{' '}
                <a href="mailto:support@kulbruk.no" className="font-medium hover:underline">
                  support@kulbruk.no
                </a>{' '}
                hvis du har spørsmål om Stripe Connect eller Fort gjort.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
