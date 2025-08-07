'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Target, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Car,
  Fuel,
  Calendar
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'

export default function ProfitCalculatorPage() {
  const [purchasePrice, setPurchasePrice] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [costs, setCosts] = useState({
    reconditioning: '',
    transport: '',
    registration: '',
    marketing: '',
    overhead: ''
  })

  const [autoCalculate, setAutoCalculate] = useState(true)

  // Automatisk beregning basert på kjøpspris
  useEffect(() => {
    if (autoCalculate && purchasePrice) {
      const price = parseFloat(purchasePrice.replace(/\s/g, '')) || 0
      if (price > 0) {
        // Standard markup: 15-25% avhengig av prisklasse
        let markup = 0.18 // Standard 18%
        if (price < 100000) markup = 0.25      // Høyere margin på billige biler
        else if (price < 300000) markup = 0.20
        else if (price > 500000) markup = 0.15 // Lavere margin på dyre biler
        
        const calculatedSelling = Math.round(price * (1 + markup))
        setSellingPrice(calculatedSelling.toLocaleString('no-NO'))

        // Standard kostnader basert på kjøpspris
        setCosts({
          reconditioning: Math.round(price * 0.03).toString(), // 3% for oppussing
          transport: '3500', // Standard transport
          registration: '2800', // Standard omregistrering
          marketing: Math.round(price * 0.01).toString(), // 1% for markedsføring
          overhead: Math.round(price * 0.02).toString() // 2% overhead
        })
      }
    }
  }, [purchasePrice, autoCalculate])

  const formatNumber = (value: string) => {
    const number = parseFloat(value.replace(/\s/g, ''))
    return isNaN(number) ? '' : number.toLocaleString('no-NO')
  }

  const handleNumberInput = (value: string, setter: (val: string) => void) => {
    const cleaned = value.replace(/[^\d]/g, '')
    setter(cleaned ? parseFloat(cleaned).toLocaleString('no-NO') : '')
  }

  const getNumbers = () => {
    const purchase = parseFloat(purchasePrice.replace(/\s/g, '')) || 0
    const selling = parseFloat(sellingPrice.replace(/\s/g, '')) || 0
    const totalCosts = Object.values(costs).reduce((sum, cost) => {
      return sum + (parseFloat(cost.replace(/\s/g, '')) || 0)
    }, 0)

    const grossProfit = selling - purchase
    const netProfit = grossProfit - totalCosts
    const grossMargin = purchase > 0 ? (grossProfit / selling) * 100 : 0
    const netMargin = purchase > 0 ? (netProfit / selling) * 100 : 0
    const roi = purchase > 0 ? (netProfit / purchase) * 100 : 0

    return {
      purchase,
      selling,
      totalCosts,
      grossProfit,
      netProfit,
      grossMargin,
      netMargin,
      roi
    }
  }

  const numbers = getNumbers()

  const getProfitLevel = () => {
    if (numbers.netMargin >= 20) return { level: 'excellent', color: 'text-green-600', bg: 'bg-green-50' }
    if (numbers.netMargin >= 15) return { level: 'good', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (numbers.netMargin >= 10) return { level: 'average', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    if (numbers.netMargin >= 5) return { level: 'low', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { level: 'poor', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const profitLevel = getProfitLevel()

  return (
    <DashboardLayout userRole="business">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Profit-kalkulator
          </h1>
          <p className="text-gray-600">
            Beregn fortjeneste og margin på bilkjøp for optimal lønnsomhet
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Input sektion */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Kjøp og salg */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Kjøp og salgspris
                </CardTitle>
                <CardDescription>
                  Angi priser for beregning av fortjeneste
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purchasePrice">Kjøpspris *</Label>
                    <Input
                      id="purchasePrice"
                      value={purchasePrice}
                      onChange={(e) => handleNumberInput(e.target.value, setPurchasePrice)}
                      placeholder="350 000"
                      className="text-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Din bud-pris eller kjøpspris</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="sellingPrice">Forventet salgspris *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="sellingPrice"
                        value={sellingPrice}
                        onChange={(e) => {
                          handleNumberInput(e.target.value, setSellingPrice)
                          setAutoCalculate(false)
                        }}
                        placeholder="420 000"
                        className="text-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAutoCalculate(true)}
                        className="shrink-0"
                      >
                        Auto
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {autoCalculate ? 'Beregnes automatisk basert på kjøpspris' : 'Manuell salgspris'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kostnader */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Kostnader
                </CardTitle>
                <CardDescription>
                  Estimerte kostnader for kjøp og salg
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reconditioning">Oppussing/reparasjoner</Label>
                    <Input
                      id="reconditioning"
                      value={costs.reconditioning}
                      onChange={(e) => setCosts({...costs, reconditioning: formatNumber(e.target.value)})}
                      placeholder="15 000"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="transport">Transport/henting</Label>
                    <Input
                      id="transport"
                      value={costs.transport}
                      onChange={(e) => setCosts({...costs, transport: formatNumber(e.target.value)})}
                      placeholder="3 500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="registration">Omregistrering</Label>
                    <Input
                      id="registration"
                      value={costs.registration}
                      onChange={(e) => setCosts({...costs, registration: formatNumber(e.target.value)})}
                      placeholder="2 800"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="marketing">Markedsføring</Label>
                    <Input
                      id="marketing"
                      value={costs.marketing}
                      onChange={(e) => setCosts({...costs, marketing: formatNumber(e.target.value)})}
                      placeholder="4 000"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="overhead">Overhead (drift, lager, etc.)</Label>
                    <Input
                      id="overhead"
                      value={costs.overhead}
                      onChange={(e) => setCosts({...costs, overhead: formatNumber(e.target.value)})}
                      placeholder="8 000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resultat sektion */}
          <div className="space-y-6">
            
            {/* Hovedresultat */}
            <Card className={profitLevel.bg}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Profit-analyse
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${profitLevel.color}`}>
                    {numbers.netProfit.toLocaleString('no-NO')} kr
                  </div>
                  <p className="text-sm text-gray-600">Netto fortjeneste</p>
                  <Badge 
                    variant="outline" 
                    className={`mt-2 ${profitLevel.color} border-current`}
                  >
                    {numbers.netMargin.toFixed(1)}% margin
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Salgspris:</span>
                    <span className="font-semibold">{numbers.selling.toLocaleString('no-NO')} kr</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kjøpspris:</span>
                    <span className="text-red-600">-{numbers.purchase.toLocaleString('no-NO')} kr</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Totale kostnader:</span>
                    <span className="text-red-600">-{numbers.totalCosts.toLocaleString('no-NO')} kr</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Netto fortjeneste:</span>
                    <span className={profitLevel.color}>{numbers.netProfit.toLocaleString('no-NO')} kr</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nøkkeltall */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Nøkkeltall
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Brutto margin:</span>
                  <Badge variant="outline">{numbers.grossMargin.toFixed(1)}%</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Netto margin:</span>
                  <Badge variant="outline">{numbers.netMargin.toFixed(1)}%</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">ROI (avkastning):</span>
                  <Badge variant="outline">{numbers.roi.toFixed(1)}%</Badge>
                </div>

                <Separator />

                {numbers.netMargin >= 15 ? (
                  <div className="flex items-start gap-2 text-green-700 text-sm">
                    <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Utmerket lønnsomhet! Dette er et attraktivt kjøp.</span>
                  </div>
                ) : numbers.netMargin >= 10 ? (
                  <div className="flex items-start gap-2 text-blue-700 text-sm">
                    <Target className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>God lønnsomhet. Akseptabel margin for denne bilen.</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-orange-700 text-sm">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Lav margin. Vurder å justere bud eller salgspris.</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">💡 Profit-tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• <strong>20%+ margin:</strong> Utmerket kjøp</p>
                <p>• <strong>15-20% margin:</strong> Meget bra</p>
                <p>• <strong>10-15% margin:</strong> Akseptabelt</p>
                <p>• <strong>Under 10%:</strong> Høy risiko</p>
                <Separator className="my-3" />
                <p className="text-xs text-gray-600">
                  Husk å inkludere alle kostnader som oppussing, transport, og tid brukt på salg.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
