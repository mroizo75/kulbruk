'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Crown, 
  CheckCircle, 
  Calendar, 
  CreditCard, 
  TrendingUp,
  ArrowUpCircle,
  Settings
} from 'lucide-react'

interface Subscription {
  plan: string
  status: 'active' | 'cancelled' | 'past_due'
  nextBilling: Date
  price: number
  features: string[]
}

interface BusinessSubscriptionCardProps {
  subscription: Subscription
}

export default function BusinessSubscriptionCard({ subscription }: BusinessSubscriptionCardProps) {
  const getStatusBadge = () => {
    switch (subscription.status) {
      case 'active':
        return <Badge className="bg-green-600">Aktiv</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Kansellert</Badge>
      case 'past_due':
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Forfalt</Badge>
      default:
        return <Badge variant="outline">Ukjent</Badge>
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Nåværende abonnement */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                <CardTitle>Ditt abonnement</CardTitle>
              </div>
              {getStatusBadge()}
            </div>
            <CardDescription>
              Administrer ditt {subscription.plan} abonnement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Plan detaljer */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {subscription.plan}
                </h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {subscription.price.toLocaleString('no-NO')} kr
                  </div>
                  <div className="text-sm text-gray-600">per måned</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">
                    Neste faktura: {subscription.nextBilling.toLocaleDateString('no-NO')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Automatisk fornyelse</span>
                </div>
              </div>
            </div>

            {/* Inkluderte funksjoner */}
            <div>
              <h4 className="font-medium mb-3">Inkluderte funksjoner</h4>
              <div className="grid grid-cols-1 gap-2">
                {subscription.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1">
                <Settings className="h-4 w-4 mr-2" />
                Endre betalingsmetode
              </Button>
              <Button variant="outline" className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                Se fakturahistorikk
              </Button>
            </div>

            {subscription.status === 'active' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Settings className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-900">Vil du endre eller kansellere?</p>
                    <p className="text-orange-700 mt-1">
                      Du kan oppgradere, nedgradere eller kansellere abonnementet når som helst.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        Endre plan
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                        Kanseller
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Oppgraderinger og statistikk */}
      <div className="space-y-4">
        
        {/* Månedlig statistikk */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Denne måneden</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Auksjoner sett</span>
              <span className="font-semibold">156</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bud gitt</span>
              <span className="font-semibold">23</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Vunne auksjoner</span>
              <span className="font-semibold text-green-600">4</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Besparelser</span>
              <span className="font-semibold text-green-600">85.000 kr</span>
            </div>
          </CardContent>
        </Card>

        {/* Oppgrader kort */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-purple-600" />
              Enterprise Plan
            </CardTitle>
            <CardDescription>
              Få enda mer ut av plattformen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <span>AI-powered prisforutsigelser</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <span>Automatisk budgivning</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <span>Dedikert kundebehandler</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <span>API tilgang</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white rounded border">
              <div className="flex items-center justify-between">
                <span className="font-semibold">5.999 kr/mnd</span>
                <Badge variant="outline" className="text-purple-600 border-purple-200">
                  Populær
                </Badge>
              </div>
            </div>
            
            <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
              <TrendingUp className="h-4 w-4 mr-2" />
              Oppgrader nå
            </Button>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💡 Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>• Bruk profit-kalkulatoren før du byr</p>
            <p>• Sett opp varsler for nye auksjoner</p>
            <p>• Sjekk markedsrapporter ukentlig</p>
            <p>• Kontakt support ved spørsmål</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
