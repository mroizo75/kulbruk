'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Loader2, 
  Building2, 
  CreditCard,
  Star,
  ArrowRight,
  Crown
} from 'lucide-react'
import { PRICING, formatPrice } from '@/lib/stripe'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface SubscriptionPlansProps {
  currentPlan?: 'BASIC' | 'STANDARD' | null
  adsRemaining?: number
}

interface CheckoutFormProps {
  plan: 'BASIC' | 'STANDARD'
  clientSecret: string
  onSuccess: () => void
  onError: (error: string) => void
}

const CheckoutForm = ({ plan, clientSecret, onSuccess, onError }: CheckoutFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) return

    setIsProcessing(true)

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setIsProcessing(false)
      return
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement }
    })

    if (result.error) {
      onError(result.error.message || 'Betalingen feilet')
    } else {
      onSuccess()
    }

    setIsProcessing(false)
  }

  const pricing = plan === 'BASIC' ? PRICING.BUSINESS_BASIC : PRICING.BUSINESS_STANDARD

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
            },
          }}
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Abonnement:</span>
          <span className="font-medium">{plan === 'BASIC' ? 'Basic Business' : 'Standard Business'}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Annonser per måned:</span>
          <span className="font-medium">{pricing.adsPerMonth} stk</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Månedlig kostnad:</span>
          <span className="font-semibold text-lg">{formatPrice(pricing.amount)}</span>
        </div>
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
            Start abonnement - {formatPrice(pricing.amount)}/mnd
          </>
        )}
      </Button>
    </form>
  )
}

export default function SubscriptionPlans({ currentPlan, adsRemaining }: SubscriptionPlansProps) {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<'BASIC' | 'STANDARD' | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const plans = [
    {
      id: 'BASIC' as const,
      name: 'Basic Business',
      price: PRICING.BUSINESS_BASIC.amount,
      adsPerMonth: PRICING.BUSINESS_BASIC.adsPerMonth,
      description: 'Perfekt for mindre bilforhandlere',
      features: [
        '5 bil-annonser per måned',
        'Tilgang til auksjoner',
        'Grunnleggende analytics',
        'E-post support',
        'Standard visibilitet',
      ],
      badge: null,
      buttonText: 'Velg Basic',
    },
    {
      id: 'STANDARD' as const,
      name: 'Standard Business',
      price: PRICING.BUSINESS_STANDARD.amount,
      adsPerMonth: PRICING.BUSINESS_STANDARD.adsPerMonth,
      description: 'For større forhandlere med høyt volum',
      features: [
        '10 bil-annonser per måned',
        'Prioritert tilgang til auksjoner',
        'Avansert AI profit-kalkulator',
        'Prioritert support',
        'Økt visibilitet i søk',
        'Detaljerte rapporter',
      ],
      badge: 'Mest populær',
      buttonText: 'Velg Standard',
    },
  ]

  const handlePlanSelect = async (plan: 'BASIC' | 'STANDARD') => {
    setSelectedPlan(plan)
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Feil ved opprettelse av abonnement')
      }

      setClientSecret(data.clientSecret)
    } catch (err: any) {
      setError(err.message)
      setSelectedPlan(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    router.push('/dashboard/business?subscription=success')
  }

  const handlePaymentError = (error: string) => {
    setError(error)
    setSelectedPlan(null)
    setClientSecret(null)
  }

  // Vis betalingsskjema hvis plan er valgt
  if (selectedPlan && clientSecret) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#af4c0f]" />
              Fullfør abonnement
            </CardTitle>
            <CardDescription>
              {selectedPlan === 'BASIC' ? 'Basic Business' : 'Standard Business'} plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise}>
              <CheckoutForm
                plan={selectedPlan}
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      {currentPlan && (
        <Card className="border-2 border-[#af4c0f]/20 bg-[#af4c0f]/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Aktivt abonnement: {currentPlan === 'BASIC' ? 'Basic Business' : 'Standard Business'}
                </h3>
                <p className="text-sm text-gray-600">
                  {adsRemaining !== undefined ? `${adsRemaining} annonser igjen denne måneden` : ''}
                </p>
              </div>
              <Badge className="bg-[#af4c0f] text-white">Aktiv</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative transition-all hover:shadow-lg border-2 ${
              plan.id === 'STANDARD'
                ? 'border-[#af4c0f] ring-2 ring-[#af4c0f]/20'
                : 'border-gray-200 hover:border-[#af4c0f]/30'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-[#af4c0f] text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  {plan.badge}
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-[#af4c0f]">
                {formatPrice(plan.price)}
                <span className="text-sm font-normal text-gray-600">/måned</span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#af4c0f] flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePlanSelect(plan.id)}
                disabled={isLoading || currentPlan === plan.id}
                className={`w-full ${
                  plan.id === 'STANDARD'
                    ? 'bg-[#af4c0f] hover:bg-[#af4c0f]/90 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                {isLoading && selectedPlan === plan.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Forbereder...
                  </>
                ) : currentPlan === plan.id ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aktivt abonnement
                  </>
                ) : (
                  <>
                    {plan.buttonText}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <h4 className="font-semibold text-blue-900 mb-2">Viktig informasjon</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Abonnementet fornyes automatisk hver måned</li>
            <li>• Du kan kansellere når som helst i innstillingene</li>
            <li>• Ubrukte annonser forfaller ved slutten av måneden</li>
            <li>• Alle priser er eks. mva</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
