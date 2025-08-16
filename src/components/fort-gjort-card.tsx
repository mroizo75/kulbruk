'use client'

import { useState } from 'react'
import { Shield, Clock, CheckCircle, Info, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// Dialog import fjernet - implementeres senere
import { 
  isEligibleForFortGjort, 
  calculateSellerPayout,
  formatAmount,
  FORT_GJORT_CONFIG 
} from '@/lib/fort-gjort'

interface FortGjortCardProps {
  listing: {
    id: string
    title: string
    price: number
    category: { slug: string }
    status: string
    userId: string
    listingType?: string
    enableFortGjort?: boolean
    user: {
      firstName?: string
      lastName?: string
    }
  }
  currentUserId?: string
}

export default function FortGjortCard({ listing, currentUserId }: FortGjortCardProps) {
  const [showInfo, setShowInfo] = useState(false)
  
  // Sjekk om annonsen er kvalifisert
  if (!isEligibleForFortGjort(listing)) {
    return null
  }
  
  // Må være innlogget for å kjøpe
  if (!currentUserId) {
    return null
  }
  
  // Ikke vis for egen annonse (kan ikke kjøpe sin egen vare)
  if (currentUserId === listing.userId) {
    return null
  }
  
  const priceInOre = Math.round(listing.price * 100)
  const { totalAmount, kulbrukFee, sellerAmount } = calculateSellerPayout(priceInOre)
  
  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg text-green-800">Fort gjort</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Sikker handel
            </Badge>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowInfo(!showInfo)}
            className="text-green-600 hover:text-green-700"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {showInfo && (
          <div className="bg-white rounded-lg p-4 border border-green-200 space-y-3">
            <h4 className="font-medium text-green-800">Hvordan Fort gjort fungerer:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-green-600 font-medium">1.</span>
                <span>Du betaler trygt - betalingen holdes sikker av Kulbruk</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-600 font-medium">2.</span>
                <span>Selger har 7 dager på å sende varen med sporingsnummer</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-600 font-medium">3.</span>
                <span>Du har 3 dager etter mottak til å godkjenne varen</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-600 font-medium">4.</span>
                <span>Etter godkjenning utbetales pengene til selger</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 border-t pt-2">
              Fort gjort-gebyr: {formatAmount(kulbrukFee)} 
              ({(FORT_GJORT_CONFIG.KULBRUK_FEE_PERCENTAGE * 100).toFixed(1)}% av kjøpesummen)
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          <p className="text-sm text-green-700">
            <strong>Sikker betaling:</strong> Dine penger holdes trygt til du har mottatt og godkjent varen.
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>7 dager sending</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4" />
              <span>3 dager godkjenning</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-3 border border-green-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Totalpris:</span>
            <span className="text-lg font-bold text-green-600">{formatAmount(totalAmount)}</span>
          </div>
          <div className="text-xs text-gray-500">
            Inkluderer Fort gjort-gebyr på {formatAmount(kulbrukFee)}
          </div>
        </div>
        
        <Button 
          onClick={async () => {
            try {
              const response = await fetch('/api/fort-gjort/create-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId: listing.id })
              })
              
              const data = await response.json()
              
              if (!response.ok) {
                alert(`Feil: ${data.error}`)
                return
              }
              
              // Redirect til checkout med clientSecret
              const checkoutUrl = `/fort-gjort/checkout?clientSecret=${data.clientSecret}&orderId=${data.orderId}`
              window.location.href = checkoutUrl
            } catch (error) {
              console.error('Fort gjort error:', error)
              alert('Feil ved start av Fort gjort kjøp')
            }
          }}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          <Shield className="h-4 w-4 mr-2" />
          Kjøp med Fort gjort
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        
        <p className="text-xs text-center text-gray-500">
          Ved å kjøpe med Fort gjort godtar du våre{' '}
          <a href="/vilkar-og-betingelser" className="text-green-600 hover:underline">
            vilkår for sikker handel
          </a>
        </p>
      </CardContent>
    </Card>
  )
}

// Compact versjon for listing cards
export function FortGjortBadge({ listing }: { listing: FortGjortCardProps['listing'] }) {
  if (!isEligibleForFortGjort(listing)) {
    return null
  }
  
  return (
    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
      <Shield className="h-3 w-3 mr-1" />
      Fort gjort
    </Badge>
  )
}
