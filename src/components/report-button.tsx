'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Flag, AlertTriangle, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ReportButtonProps {
  listingId: string
  className?: string
}

const reportReasons = [
  { value: 'SCAM', label: 'Svindel / Scam', description: 'Mistenkelig eller uredelig innhold' },
  { value: 'SPAM', label: 'Spam / Reklame', description: 'Uønsket reklame eller spam' },
  { value: 'WRONG_CATEGORY', label: 'Feil kategori', description: 'Annonsen er i feil kategori' },
  { value: 'OFFENSIVE', label: 'Støtende innhold', description: 'Upassende eller støtende innhold' },
  { value: 'OTHER', label: 'Annet', description: 'Andre brudd på våre retningslinjer' },
]

export default function ReportButton({ listingId, className = '' }: ReportButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [comment, setComment] = useState('')

  const handleSubmit = async () => {
    if (!session?.user) {
      toast.error('Du må være logget inn for å rapportere')
      router.push('/sign-in?redirectUrl=' + encodeURIComponent(window.location.pathname))
      return
    }

    if (!selectedReason) {
      toast.error('Vennligst velg en årsak for rapporteringen')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          reason: selectedReason,
          comment: comment.trim() || undefined
        })
      })

      if (response.ok) {
        toast.success('Rapport sendt. Takk for at du hjelper oss å holde Kulbruk trygt!')
        setIsOpen(false)
        setSelectedReason('')
        setComment('')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Kunne ikke sende rapport')
      }
    } catch (error) {
      console.error('Rapport-feil:', error)
      toast.error('Noe gikk galt. Prøv igjen senere.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setSelectedReason('')
    setComment('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Flag className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Rapporter</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Rapporter annonse
          </DialogTitle>
          <DialogDescription>
            Hjelp oss å holde Kulbruk trygt ved å rapportere innhold som bryter våre retningslinjer.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Årsak til rapportering</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="mt-2">
              {reportReasons.map((reason) => (
                <div key={reason.value} className="flex items-start space-x-2">
                  <RadioGroupItem value={reason.value} id={reason.value} className="mt-1" />
                  <div className="flex-1 cursor-pointer" onClick={() => setSelectedReason(reason.value)}>
                    <Label htmlFor={reason.value} className="font-medium cursor-pointer">
                      {reason.label}
                    </Label>
                    <p className="text-sm text-gray-600">{reason.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="comment" className="text-sm font-medium">
              Tilleggsinformasjon (valgfritt)
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Beskriv problemet nærmere..."
              className="mt-1"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 tegn
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-1" />
              Avbryt
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedReason || isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              <Send className="h-4 w-4 mr-1" />
              {isSubmitting ? 'Sender...' : 'Send rapport'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
