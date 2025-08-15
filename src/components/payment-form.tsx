'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react'
import { formatPrice } from '@/lib/stripe-shared'

// Initialiser Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormProps {
  amount: number // I øre
  description: string
  categorySlug?: string
  listingId?: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

interface CheckoutFormProps extends PaymentFormProps {
  clientSecret: string
  paymentId: string
}

const CheckoutForm = ({ 
  amount, 
  description, 
  clientSecret, 
  paymentId,
  onSuccess, 
  onError 
}: CheckoutFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setIsProcessing(false)
      return
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          // For norske betalinger
          address: {
            country: 'NO', // Norge
          },
        },
      }
    })

    if (result.error) {
      console.error('Payment error:', result.error)
      onError?.(result.error.message || 'Betalingen feilet')
    } else {
      setIsSuccess(true)
      onSuccess?.()
    }

    setIsProcessing(false)
  }

  if (isSuccess) {
    return (
      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Betaling vellykket!
          </h3>
          <p className="text-green-700">
            Din betaling på {formatPrice(amount)} er behandlet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-[#af4c0f]" />
          Betalingsinformasjon
        </CardTitle>
        <CardDescription>
          {description} - {formatPrice(amount)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
                // Konfigurer for Norge - postnummer er påkrevd
                hidePostalCode: false, // Vis postnummer-felt
                iconStyle: 'default',
                // Norske kort krever postnummer
                disabled: false,
              }}
            />
          </div>
          
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="text-blue-600 mt-0.5">ℹ️</div>
              <div>
                <p className="font-medium text-blue-800">Tips for norske kort:</p>
                <p className="text-blue-700">Fyll inn ditt norske postnummer (f.eks. 0150) for å fullføre betalingen.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Totalt å betale:</span>
            <span className="font-semibold text-lg">{formatPrice(amount)}</span>
          </div>

          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full bg-[#af4c0f] hover:bg-[#af4c0f]/90"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Behandler betaling...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Betal {formatPrice(amount)}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function PaymentForm(props: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const initializePayment = async () => {
    if (props.amount === 0) {
      props.onSuccess?.()
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('🚀 PaymentForm: Initialiserer betaling...', {
        categorySlug: props.categorySlug,
        listingId: props.listingId,
        amount: props.amount,
        description: props.description
      })

      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categorySlug: props.categorySlug,
          listingId: props.listingId,
          type: 'listing',
        }),
      })

      const data = await response.json()
      console.log('💳 PaymentForm: API respons:', { status: response.status, data })

      if (!response.ok) {
        console.error('❌ PaymentForm: API feil:', data)
        throw new Error(data.error || 'Feil ved opprettelse av betaling')
      }

      if (data.isFree) {
        console.log('✅ PaymentForm: Gratis annonse, hopper over betaling')
        props.onSuccess?.()
        return
      }

      if (!data.clientSecret) {
        console.error('❌ PaymentForm: Mangler clientSecret i responsen')
        throw new Error('Mangler clientSecret fra Stripe')
      }

      console.log('✅ PaymentForm: Payment Intent opprettet:', {
        paymentId: data.paymentId,
        amount: data.amount,
        hasClientSecret: !!data.clientSecret
      })

      setClientSecret(data.clientSecret)
      setPaymentId(data.paymentId)
    } catch (err: any) {
      console.error('❌ PaymentForm: Feil ved initialisering:', err)
      setError(err.message)
      props.onError?.(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Gratis annonser
  if (props.amount === 0) {
    return (
      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Gratis annonse
          </h3>
          <p className="text-green-700 mb-4">
            {props.description} er helt gratis!
          </p>
          <Button 
            onClick={() => props.onSuccess?.()}
            className="bg-green-600 hover:bg-green-700"
          >
            Fortsett
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Vis feil
  if (error) {
    return (
      <Card className="border-2 border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Feil ved betaling
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button 
            onClick={initializePayment}
            variant="outline"
            className="border-red-300 text-red-700"
          >
            Prøv igjen
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Hvis payment intent ikke er opprettet enda
  if (!clientSecret || !paymentId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Betalingsinformasjon</CardTitle>
          <CardDescription>
            {props.description} - {formatPrice(props.amount)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#af4c0f]" />
                <p className="text-gray-600">Forbereder betaling...</p>
              </div>
            ) : (
              <Button
                onClick={initializePayment}
                className="bg-[#af4c0f] hover:bg-[#af4c0f]/90"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Start betaling
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Vis betalingsskjema
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        {...props}
        clientSecret={clientSecret}
        paymentId={paymentId}
      />
    </Elements>
  )
}
