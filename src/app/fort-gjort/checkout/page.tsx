'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import FortGjortPaymentForm from '@/components/fort-gjort-payment-form'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderData, setOrderData] = useState<any>(null)

  const clientSecret = searchParams.get('clientSecret')
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    if (!clientSecret || !orderId) {
      setError('Manglende betalingsinformasjon')
      setLoading(false)
      return
    }

    // Hent ordre detaljer
    fetchOrderDetails()
  }, [clientSecret, orderId])

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

  const handlePaymentSuccess = () => {
    router.push(`/fort-gjort/success?orderId=${orderId}`)
  }

  const handlePaymentError = (error: string) => {
    setError(error)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Laster checkout...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Feil</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button asChild variant="outline">
              <Link href="/annonser">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tilbake til annonser
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href={`/annonser/detaljer/${orderData?.listing?.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tilbake til annonse
            </Link>
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Fort gjort</h1>
            <Badge className="bg-green-100 text-green-800">Sikker betaling</Badge>
          </div>
          <p className="text-gray-600">
            Dine penger holdes trygt til du har mottatt og godkjent varen
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ordre sammendrag */}
          <Card>
            <CardHeader>
              <CardTitle>Ordre sammendrag</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderData?.listing && (
                <>
                  <div className="flex gap-4">
                    {orderData.listing.images?.[0] && (
                      <img 
                        src={orderData.listing.images[0].url} 
                        alt={orderData.listing.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{orderData.listing.title}</h3>
                      <p className="text-sm text-gray-600">{orderData.listing.location}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Pris:</span>
                      <span>{orderData.itemPrice?.toLocaleString('no-NO')} kr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fort gjort gebyr:</span>
                      <span>{orderData.kulbrukFee?.toLocaleString('no-NO')} kr</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Totalt:</span>
                      <span>{orderData.totalAmount?.toLocaleString('no-NO')} kr</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Betalingsskjema */}
          <Card>
            <CardHeader>
              <CardTitle>Betaling</CardTitle>
            </CardHeader>
            <CardContent>
              {clientSecret && (
                <Elements stripe={stripePromise} options={{ 
                  clientSecret,
                  locale: 'nb',
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#16a34a',
                    }
                  }
                }}>
                  <FortGjortPaymentForm
                    clientSecret={clientSecret}
                    orderId={orderId!}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sikkerhetsinformasjon */}
        <Card className="mt-8">
          <CardContent className="py-6">
            <div className="text-center">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Slik fungerer Fort gjort</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
                <div>
                  <div className="font-medium text-green-600 mb-1">1. Betal trygt</div>
                  <div>Dine penger holdes trygt av Kulbruk til du godkjenner kjøpet</div>
                </div>
                <div>
                  <div className="font-medium text-green-600 mb-1">2. Motta varen</div>
                  <div>Selger sender varen innen 7 dager med sporingsnummer</div>
                </div>
                <div>
                  <div className="font-medium text-green-600 mb-1">3. Godkjenn</div>
                  <div>Du har 3 dager til å godkjenne eller rapportere problemer</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function FortGjortCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
