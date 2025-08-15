'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calculator, Info } from 'lucide-react'
import { calculateCarTotalPrice, formatCarPrice, isCarCategory } from '@/lib/car-pricing'

interface CarPriceDisplayProps {
  salesPrice: number
  categorySlug: string
  registrationFee?: number | null
  showBreakdown?: boolean
  className?: string
}

export default function CarPriceDisplay({
  salesPrice,
  categorySlug,
  registrationFee,
  showBreakdown = true,
  className = ''
}: CarPriceDisplayProps) {
  // Bare vis for bil-kategorier
  if (!isCarCategory(categorySlug)) {
    return null
  }

  const pricing = calculateCarTotalPrice(salesPrice, registrationFee)

  return (
    <Card className={`border-blue-200 bg-blue-50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
          <Calculator className="h-5 w-5" />
          Totalpris for kjøper
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Totalpris - prominent */}
        <div className="text-center p-4 bg-white rounded-lg border-2 border-blue-300">
          <div className="text-sm text-gray-600 mb-1">Totalpris inkl. omregistrering</div>
          <div className="text-3xl font-bold text-blue-700">
            {formatCarPrice(pricing.totalPrice)}
          </div>
        </div>

        {/* Breakdown hvis ønsket */}
        {showBreakdown && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">Salgspris:</span>
              <span className="font-medium">{formatCarPrice(pricing.salesPrice)}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Omregistrering:</span>
                {pricing.isEstimated ? (
                  <Badge variant="outline" className="text-xs">Estimat</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Offisiell</Badge>
                )}
              </div>
              <span className="font-medium">{formatCarPrice(pricing.registrationFee)}</span>
            </div>

            <hr className="border-blue-200" />

            <div className="flex justify-between items-center font-semibold">
              <span>Total for kjøper:</span>
              <span className="text-blue-700">{formatCarPrice(pricing.totalPrice)}</span>
            </div>
          </div>
        )}

        {/* Info-tekst */}
        <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-100 p-3 rounded-lg">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Om omregistreringsavgift:</p>
            <p className="mt-1">
              {pricing.isEstimated 
                ? `Estimat basert på 2.5% av salgspris. Faktisk avgift kan variere.`
                : `Offisiell avgift fra Skatteetaten per ${new Date().toLocaleDateString('no-NO')}.`
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
