'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, CreditCard } from 'lucide-react'
import PaymentForm from '@/components/payment-form'
import { ListingCategory } from '../category-selector'

interface PaymentStepProps {
  category: ListingCategory
  onComplete: () => void
}

export default function PaymentStep({ category, onComplete }: PaymentStepProps) {
  const [paymentCompleted, setPaymentCompleted] = useState(false)

  const price = category.pricing?.price || 0

  const handlePaymentSuccess = () => {
    setPaymentCompleted(true)
  }

  const handleContinue = () => {
    onComplete()
  }

  if (category.pricing?.free) {
    // Should not reach here, but safety check
    onComplete()
    return null
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Betaling
        </h1>
        <p className="text-gray-600">
          Betal for å publisere din annonse
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {category.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg">{category.pricing?.description}</span>
            <Badge variant="outline" className="text-lg font-bold">
              {price} kr
            </Badge>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Inkludert i prisen:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Annonse publiseres umiddelbart
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Synlig i 30 dager
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Ubegrenset redigering
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Innbygget meldingssystem
              </li>
              {category.id === 'property_rental' && (
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Automatisk fornyelse
                </li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      {!paymentCompleted ? (
        <Card>
          <CardHeader>
            <CardTitle>Betalingsinformasjon</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentForm
              amount={price}
              description={`${category.name} - ${category.pricing?.description}`}
              paymentType="PROPERTY_AD"
              onPaymentSuccess={handlePaymentSuccess}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-500 bg-green-50">
          <CardContent className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="bg-green-500 rounded-full p-3">
                <Check className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">
              Betaling fullført!
            </h3>
            <p className="text-green-700 mb-6">
              Takk for betalingen. Din annonse er klar til publisering.
            </p>
            <Button onClick={handleContinue} size="lg">
              Fortsett til gjennomgang
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
