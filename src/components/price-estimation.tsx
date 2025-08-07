'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingUp, RefreshCw, Car, Calculator } from 'lucide-react'
import { toast } from 'sonner'

interface PriceEstimationProps {
  onEstimationComplete?: (estimation: PriceEstimation) => void
  className?: string
}

interface CarData {
  registrationNumber: string
  make: string
  model: string
  year: number
  fuelType: string
  transmission: string
  color: string
}

interface PriceEstimation {
  estimatedPrice: number
  priceRange: { min: number; max: number }
  confidence: string
  method: string
  factors: any
  carData: CarData
  disclaimer: string
}

export default function PriceEstimation({ onEstimationComplete, className = '' }: PriceEstimationProps) {
  const [step, setStep] = useState<'input' | 'loading' | 'result'>('input')
  const [regNumber, setRegNumber] = useState('')
  const [mileage, setMileage] = useState('')
  const [condition, setCondition] = useState('')
  const [estimation, setEstimation] = useState<PriceEstimation | null>(null)
  const [carData, setCarData] = useState<CarData | null>(null)

  const handleEstimate = async () => {
    if (!regNumber || !mileage || !condition) {
      toast.error('Vennligst fyll ut alle feltene')
      return
    }

    if (regNumber.length !== 7) {
      toast.error('Registreringsnummer må være 7 tegn')
      return
    }

    setStep('loading')

    try {
      const response = await fetch('/api/vegvesen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: regNumber.toUpperCase(),
          mileage: parseInt(mileage),
          condition: condition.toUpperCase()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Kunne ikke hente prisestimering')
      }

      setCarData(data.carData)
      setEstimation(data.priceEstimation)
      setStep('result')
      
      // Kall callback
      if (onEstimationComplete) {
        onEstimationComplete({
          ...data.priceEstimation,
          carData: data.carData
        })
      }

      toast.success('Prisestimering beregnet!')

    } catch (error) {
      console.error('Prisestimering feil:', error)
      toast.error(error instanceof Error ? error.message : 'Noe gikk galt')
      setStep('input')
    }
  }

  const handleReset = () => {
    setStep('input')
    setEstimation(null)
    setCarData(null)
    setRegNumber('')
    setMileage('')
    setCondition('')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('no-NO').format(price)
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className={`border-green-200 bg-green-50 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-900">
          <Calculator className="h-5 w-5" />
          🏆 Prisestimering for Auksjon
        </CardTitle>
        <p className="text-sm text-green-700">
          Få et prisestimat for din bil som skal selges på auksjon til forhandlere
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {step === 'input' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="regNumber">Registreringsnummer</Label>
                <Input
                  id="regNumber"
                  placeholder="AB12345"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                  maxLength={7}
                  className="font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">7 tegn, f.eks AB12345</p>
              </div>
              
              <div>
                <Label htmlFor="mileage">Kilometerstand</Label>
                <Input
                  id="mileage"
                  type="number"
                  placeholder="120000"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Nåværende kilometerstand</p>
              </div>
            </div>

            <div>
              <Label htmlFor="condition">Bilens tilstand</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg tilstand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A - Meget god (som ny)</SelectItem>
                  <SelectItem value="B">B - God (mindre bruksspor)</SelectItem>
                  <SelectItem value="C">C - Middels (synlige bruksspor)</SelectItem>
                  <SelectItem value="D">D - Dårlig (mye slitasje/skader)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Vurder bilens generelle tilstand</p>
            </div>

            <Button 
              onClick={handleEstimate} 
              className="w-full"
              disabled={!regNumber || !mileage || !condition}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Beregn Prisestimering
            </Button>
          </div>
        )}

        {step === 'loading' && (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-sm text-gray-600">
              Henter bildata fra Statens Vegvesen og beregner prisestimering...
            </p>
          </div>
        )}

        {step === 'result' && estimation && carData && (
          <div className="space-y-4">
            {/* Bilinfo */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Car className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Bilens informasjon</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Merke/Modell:</strong> {carData.make} {carData.model}</div>
                <div><strong>Årsmodell:</strong> {carData.year}</div>
                <div><strong>Drivstoff:</strong> {carData.fuelType}</div>
                <div><strong>Girkasse:</strong> {carData.transmission}</div>
                <div><strong>Kilometerstand:</strong> {formatPrice(parseInt(mileage))} km</div>
                <div><strong>Tilstand:</strong> {condition} - {
                  condition === 'A' ? 'Meget god' :
                  condition === 'B' ? 'God' :
                  condition === 'C' ? 'Middels' : 'Dårlig'
                }</div>
              </div>
            </div>

            {/* Prisestimering */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3">💰 Prisestimering</h3>
              
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-green-800">
                  {formatPrice(estimation.estimatedPrice)} kr
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Prisintervall: {formatPrice(estimation.priceRange.min)} - {formatPrice(estimation.priceRange.max)} kr
                </div>
              </div>

              <div className="flex justify-center mb-3">
                <Badge className={getConfidenceColor(estimation.confidence)}>
                  Sikkerhet: {estimation.confidence}
                </Badge>
              </div>

              {estimation.factors && (
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Basisverdi ({carData.make}): {formatPrice(estimation.factors.basePrice)} kr</div>
                  <div>• Alders-reduksjon ({estimation.factors.carAge} år): -{formatPrice(estimation.factors.ageDeduction)} kr</div>
                  <div>• Kilometer-reduksjon ({formatPrice(estimation.factors.excessMileage)} km over 100k): -{formatPrice(estimation.factors.mileageDeduction)} kr</div>
                  <div>• Tilstands-faktor ({condition}): ×{estimation.factors.conditionMultiplier}</div>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-800">
                  <strong>Viktig:</strong> {estimation.disclaimer}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Ny estimering
              </Button>
              <Button 
                onClick={() => toast.success('Prisestimering lagret i annonsen!')}
                className="flex-1"
              >
                Bruk dette estimatet
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}