"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, X, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Card, CardContent } from '@/components/ui/card'

interface CancelBookingButtonProps {
  partnerOrderId: string
  bookingId: string
}

export default function CancelBookingButton({ partnerOrderId, bookingId }: CancelBookingButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPenalties, setIsLoadingPenalties] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [penalties, setPenalties] = useState<any>(null)
  const [showPenalties, setShowPenalties] = useState(false)
  const router = useRouter()

  // Hent cancellation penalties når dialog åpnes
  useEffect(() => {
    if (showPenalties && !penalties && !isLoadingPenalties) {
      fetchPenalties()
    }
  }, [showPenalties])

  const fetchPenalties = async () => {
    try {
      setIsLoadingPenalties(true)
      const response = await fetch('/api/hotels/cancellation-penalties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partnerOrderId }),
      })

      const data = await response.json()

      if (data.success) {
        setPenalties(data.penalties)
      }
    } catch (err: any) {
      console.error('Fetch penalties error:', err)
    } finally {
      setIsLoadingPenalties(false)
    }
  }

  const handleCancel = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/hotels/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partnerOrderId }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Kunne ikke kansellere booking')
      }

      // Refresh siden for å oppdatere status
      router.refresh()

    } catch (err: any) {
      console.error('Cancel booking error:', err)
      setError(err.message || 'En feil oppstod')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Kansellerer...
            </>
          ) : (
            <>
              <X className="h-4 w-4 mr-2" />
              Kanseller booking
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialog onOpenChange={setShowPenalties}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Kanseller booking?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>Er du sikker på at du vil kansellere denne bookingen? Denne handlingen kan ikke angres.</p>
              
              {/* Cancellation Penalties */}
              {isLoadingPenalties ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Henter kanselleringsgebyrer...
                </div>
              ) : penalties ? (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-900 mb-2">Kanselleringsgebyrer</h4>
                        {Array.isArray(penalties) && penalties.length > 0 ? (
                          <div className="space-y-2 text-sm text-yellow-800">
                            {penalties.map((penalty: any, i: number) => (
                              <div key={i} className="border-l-2 border-yellow-400 pl-3">
                                {penalty.amount && (
                                  <div className="font-medium">
                                    Gebyr: {penalty.amount} {penalty.currency_code || 'NOK'}
                                  </div>
                                )}
                                {penalty.description && (
                                  <div className="text-xs mt-1">{penalty.description}</div>
                                )}
                                {penalty.date_from && (
                                  <div className="text-xs mt-1">
                                    Fra: {new Date(penalty.date_from).toLocaleDateString('nb-NO')}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-yellow-800">
                            Ingen kanselleringsgebyrer - gratis kansellering tilgjengelig.
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  {error}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleCancel()
              }}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kansellerer...
                </>
              ) : (
                'Ja, kanseller'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialog>
  )
}

