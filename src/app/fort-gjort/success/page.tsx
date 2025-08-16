'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Shield, Package, Clock, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [orderData, setOrderData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const orderId = searchParams.get('orderId')

  useEffect(() => {
    if (!orderId) {
      setError('Mangler ordre ID')
      setLoading(false)
      return
    }

    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/fort-gjort/order/${orderId}`)
      if (!response.ok) {
        throw new Error('Kunne ikke hente ordre detaljer')
      }
      
      const data = await response.json()
      setOrderData(data)
    } catch (err) {
      setError('Feil ved henting av ordre detaljer')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Henter ordre informasjon...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button asChild>
              <Link href="/annonser">Tilbake til annonser</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Betaling vellykket!
          </h1>
          <p className="text-lg text-gray-600">
            Din Fort gjort ordre er bekreftet og pengene holdes trygt
          </p>
        </div>

        {/* Ordre detaljer */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Ordre #{orderId?.slice(-8)}
              <Badge className="bg-green-100 text-green-800">Betalt</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {orderData?.listing && (
              <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                {orderData.listing.images?.[0] && (
                  <img 
                    src={orderData.listing.images[0].url} 
                    alt={orderData.listing.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{orderData.listing.title}</h3>
                  <p className="text-gray-600">{orderData.listing.location}</p>
                  <p className="text-xl font-bold text-green-600 mt-2">
                    {orderData.totalAmount?.toLocaleString('no-NO')} kr
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Selger</h4>
                <p className="text-gray-600">
                  {orderData?.seller?.firstName} {orderData?.seller?.lastName}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Betalingsstatus</h4>
                <Badge className="bg-green-100 text-green-800">
                  Bekreftet
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Neste steg */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Hva skjer nå?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium">1. Selger forbereder sending</h4>
                  <p className="text-sm text-gray-600">
                    Selger har 7 dager på seg til å sende varen med sporingsnummer
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 p-2 rounded-full mt-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium">2. Du mottar varen</h4>
                  <p className="text-sm text-gray-600">
                    Du får sporingsinformasjon og kan følge forsendelsen
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 p-2 rounded-full mt-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium">3. Godkjenn kjøpet</h4>
                  <p className="text-sm text-gray-600">
                    Du har 3 dager til å godkjenne eller rapportere problemer
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 p-2 rounded-full mt-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium">4. Selger får betaling</h4>
                  <p className="text-sm text-gray-600">
                    Etter din godkjenning blir pengene utbetalt til selger
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sikkerhetsinformasjon */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="text-center">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Dine penger er trygt beskyttet</h3>
              <p className="text-sm text-gray-600 mb-4">
                Kulbruk holder pengene dine til du har mottatt og godkjent varen. 
                Du kan rapportere problemer hvis noe ikke stemmer.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/dashboard/customer">
              Se mine ordrer
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/annonser">
              <ArrowRight className="h-4 w-4 mr-2" />
              Fortsett shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function FortGjortSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
