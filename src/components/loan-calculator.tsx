'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface LoanCalculatorProps {
  listingId: string
  priceNok: number
  defaultDownPayment?: number
  defaultYears?: number
  defaultNominalRate?: number // % per year
}

const formatNok = (amount: number) => new Intl.NumberFormat('nb-NO', {
  style: 'currency', currency: 'NOK', minimumFractionDigits: 0,
}).format(Math.max(0, Math.round(amount)))

export default function LoanCalculator({
  listingId,
  priceNok,
  defaultDownPayment = Math.min(50000, Math.floor(priceNok * 0.15)),
  defaultYears = 5,
  defaultNominalRate = 8.25,
}: LoanCalculatorProps) {
  const [downPayment, setDownPayment] = useState<number>(defaultDownPayment)
  const [years, setYears] = useState<number>(defaultYears)
  const [rate, setRate] = useState<number>(defaultNominalRate)

  const principal = useMemo(() => Math.max(0, priceNok - (downPayment || 0)), [priceNok, downPayment])
  const months = useMemo(() => Math.max(1, years * 12), [years])

  const monthlyPayment = useMemo(() => {
    const monthlyRate = rate / 100 / 12
    if (monthlyRate <= 0) return principal / months
    const factor = monthlyRate / (1 - Math.pow(1 + monthlyRate, -months))
    return principal * factor
  }, [principal, months, rate])

  const totalCost = useMemo(() => monthlyPayment * months, [monthlyPayment, months])
  const costOfCredit = useMemo(() => Math.max(0, totalCost - principal), [totalCost, principal])

  const safeDownPayment = (v: number) => {
    const max = Math.max(0, priceNok)
    return Math.min(Math.max(0, Math.floor(v || 0)), max)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Billånskalkulator</span>
          <Badge variant="outline">Estimert</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Kjøpesum (låst) */}
          <div>
            <Label className="text-sm text-gray-600">Kjøpesum</Label>
            <Input value={formatNok(priceNok)} readOnly className="font-semibold" />
          </div>

          {/* Egenkapital */}
          <div>
            <Label htmlFor="downPayment" className="text-sm text-gray-600">Egenkapital</Label>
            <Input
              id="downPayment"
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(safeDownPayment(parseInt(e.target.value)))}
              min={0}
              max={priceNok}
            />
            <div className="pt-2">
              <Slider
                value={[downPayment]}
                onValueChange={(vals) => setDownPayment(safeDownPayment(vals[0]))}
                min={0}
                max={Math.max(0, priceNok)}
                step={1000}
              />
            </div>
          </div>

          {/* Nedbetalingstid */}
          <div>
            <Label htmlFor="years" className="text-sm text-gray-600">Nedbetalingstid</Label>
            <Select value={String(years)} onValueChange={(v) => setYears(parseInt(v))}>
              <SelectTrigger id="years"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((y) => (
                  <SelectItem key={y} value={String(y)}>{y} år</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Nominell rente */}
          <div>
            <Label htmlFor="rate" className="text-sm text-gray-600">Nominell rente</Label>
            <Input
              id="rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(Math.max(0, parseFloat(e.target.value)))}
              step={0.05}
              min={0}
            />
            <div className="pt-2">
              <Slider
                value={[rate]}
                onValueChange={(vals) => setRate(Math.max(0, vals[0]))}
                min={0}
                max={20}
                step={0.05}
              />
            </div>
          </div>

          {/* Lånesum */}
          <div>
            <Label className="text-sm text-gray-600">Lånesum</Label>
            <Input value={formatNok(principal)} readOnly className="font-semibold" />
          </div>

          {/* Estimert pr mnd */}
          <div>
            <Label className="text-sm text-gray-600">Estimert pr måned</Label>
            <Input value={formatNok(monthlyPayment)} readOnly className="font-semibold text-blue-700" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm text-gray-600">Totalkostnad</Label>
            <Input value={formatNok(totalCost)} readOnly />
          </div>
          <div>
            <Label className="text-sm text-gray-600">Kostnad kreditt</Label>
            <Input value={formatNok(costOfCredit)} readOnly />
          </div>
          <div>
            <Label className="text-sm text-gray-600">Termin</Label>
            <Input value={`${months} mnd`} readOnly />
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Dette er kun et estimat basert på oppgitt nominell rente. Effektiv rente vil avvike.
          Lånetilbud og kredittsjekk håndteres av långiver. Integrasjon mot Lendo kommer.
        </p>
      </CardContent>
    </Card>
  )
}


