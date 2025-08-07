'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Gavel, Calculator, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface BidModalProps {
  auctionId: string
  title: string
  currentBid: number | null
  estimatedPrice: number
}

export default function BidModal({ auctionId, title, currentBid, estimatedPrice }: BidModalProps) {
  const { data: session } = useSession()
  const isSignedIn = !!session
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [bidAmount, setBidAmount] = useState('')
  const [message, setMessage] = useState('')

  // Standard kontrakt-tekst
  const standardMessage = `Tilbudet gjelder bilen slik den er fremstilt i annonsen med følgende betingelser:

• Kjøpet er betinget av befaring og teknisk gjennomgang
• Bilen skal være fri for skjulte feil og mangler
• Alle oppgitte opplysninger skal være korrekte
• Overlevering innen 7 virkedager etter aksept
• Betaling ved overlevering eller etter avtale

Med vennlig hilsen,
[Bedriftsnavn]`

  const calculateProfit = (bidPrice: number) => {
    const sellPrice = estimatedPrice * 1.15 // 15% markup
    const profit = sellPrice - bidPrice
    const margin = (profit / sellPrice) * 100
    
    return {
      sellPrice: Math.round(sellPrice),
      profit: Math.round(profit),
      margin: margin.toFixed(1)
    }
  }

  const handleBidChange = (value: string) => {
    // Kun tillat tall og mellomrom
    const cleaned = value.replace(/[^\d\s]/g, '')
    setBidAmount(cleaned)
  }

  const getMinBidAmount = () => {
    if (currentBid) {
      return currentBid + 5000 // Minimum 5000 kr over nåværende bud
    }
    return Math.round(estimatedPrice * 0.7) // Start på 70% av estimat
  }

  const getBidAmountNumber = () => {
    return parseInt(bidAmount.replace(/\s/g, '')) || 0
  }

  const isValidBid = () => {
    const amount = getBidAmountNumber()
    const minBid = getMinBidAmount()
    return amount >= minBid && amount <= estimatedPrice * 1.2 // Maks 20% over estimat
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isSignedIn) {
      toast.error('Du må være logget inn for å gi bud')
      return
    }

    if (!isValidBid()) {
      toast.error(`Budet må være minst ${getMinBidAmount().toLocaleString('no-NO')} kr`)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/business/bid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          auctionId,
          amount: getBidAmountNumber(),
          message: message || standardMessage
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Bud sendt vellykket!')
        setIsOpen(false)
        setBidAmount('')
        setMessage('')
        // Refresh siden for å vise nytt bud
        window.location.reload()
      } else {
        toast.error(data.error || 'Kunne ikke sende bud')
      }
    } catch (error) {
      console.error('Bud feilet:', error)
      toast.error('Noe gikk galt. Prøv igjen.')
    } finally {
      setIsLoading(false)
    }
  }

  // Sett standard message første gang
  if (message === '') {
    setMessage(standardMessage)
  }

  const bidAmountNumber = getBidAmountNumber()
  const minBid = getMinBidAmount()
  const profitCalc = bidAmountNumber > 0 ? calculateProfit(bidAmountNumber) : null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
          <Gavel className="h-4 w-4 mr-2" />
          Gi bud
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Gi bud på bil
          </DialogTitle>
          <DialogDescription>
            {title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Bud informasjon */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Prisestimering:</span>
                  <p className="text-lg font-semibold">{estimatedPrice.toLocaleString('no-NO')} kr</p>
                </div>
                <div>
                  <span className="font-medium">Nåværende høyeste bud:</span>
                  <p className="text-lg font-semibold text-green-600">
                    {currentBid ? `${currentBid.toLocaleString('no-NO')} kr` : 'Ingen bud ennå'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bud beløp */}
          <div className="space-y-2">
            <Label htmlFor="bidAmount">Ditt bud *</Label>
            <Input
              id="bidAmount"
              value={bidAmount}
              onChange={(e) => handleBidChange(e.target.value)}
              placeholder={`Minimum: ${minBid.toLocaleString('no-NO')} kr`}
              className="text-lg"
              required
            />
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <AlertCircle className="h-3 w-3" />
              <span>Minimum bud: {minBid.toLocaleString('no-NO')} kr</span>
              {!isValidBid() && bidAmountNumber > 0 && (
                <Badge variant="destructive" className="text-xs">Ugyldig beløp</Badge>
              )}
              {isValidBid() && (
                <Badge variant="default" className="text-xs bg-green-600">Gyldig bud</Badge>
              )}
            </div>
          </div>

          {/* Profit kalkulator */}
          {profitCalc && isValidBid() && (
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Profit-beregning</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Kjøpspris:</span>
                    <p className="font-semibold">{bidAmountNumber.toLocaleString('no-NO')} kr</p>
                  </div>
                  <div>
                    <span className="text-blue-700">Forventet salgspris:</span>
                    <p className="font-semibold">{profitCalc.sellPrice.toLocaleString('no-NO')} kr</p>
                  </div>
                  <div>
                    <span className="text-blue-700">Estimert profit:</span>
                    <p className="font-semibold text-green-700">
                      {profitCalc.profit.toLocaleString('no-NO')} kr ({profitCalc.margin}%)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Kontrakt-tekst */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="message">Tilbuds-tekst</Label>
              <Badge variant="outline" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Standard kontrakt
              </Badge>
            </div>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="text-sm"
              placeholder="Tilbuds-betingelser..."
            />
            <div className="text-xs text-gray-500">
              Standard kontrakt-tekst er ferdig utfylt. Du kan tilpasse den etter behov.
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Avbryt
            </Button>
            <Button
              type="submit"
              disabled={!isValidBid() || isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Sender bud...' : `Send bud (${bidAmountNumber.toLocaleString('no-NO')} kr)`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
