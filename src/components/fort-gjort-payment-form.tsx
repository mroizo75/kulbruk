'use client'

import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Loader2, Shield } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface FortGjortPaymentFormProps {
  clientSecret: string
  orderId: string
  onSuccess: () => void
  onError: (error: string) => void
}

export default function FortGjortPaymentForm({ 
  clientSecret, 
  orderId, 
  onSuccess, 
  onError 
}: FortGjortPaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message || 'Feil ved validering av betalingsinformasjon')
        setLoading(false)
        return
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/fort-gjort/success?orderId=${orderId}`,
        },
        redirect: 'if_required'
      })

      if (confirmError) {
        if (confirmError.type === 'card_error' || confirmError.type === 'validation_error') {
          setError(confirmError.message || 'Betalingsfeil')
        } else {
          setError('Uventet feil ved betaling')
        }
      } else {
        // Betaling vellykket
        onSuccess()
      }
    } catch (err) {
      setError('Uventet feil ved betaling')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'klarna', 'vipps']
          }}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Behandler betaling...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Betal med Fort gjort
            </>
          )}
        </Button>

        <div className="text-xs text-center text-gray-500">
          Ved å fullføre betalingen godtar du våre{' '}
          <a href="/vilkar-og-betingelser" className="text-green-600 hover:underline">
            vilkår for Fort gjort
          </a>
        </div>
      </div>
    </form>
  )
}
