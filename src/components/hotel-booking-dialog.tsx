'use client'

import { useState, useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { useSession } from 'next-auth/react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Loader2, Check, User, Mail, Phone, CreditCard, AlertCircle, Lock } from 'lucide-react'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Payment Form Component (må være inni Elements wrapper)
interface ChildGuest {
  firstName: string
  lastName: string
  age: number
}

function PaymentForm({ 
  onSuccess, 
  onError, 
  guestInfo,
  partnerOrderId,
  bookHash,
  childGuests,
  hotelName,
  checkIn,
  checkOut,
  adults,
  rooms,
  selectedPaymentType,
  remarks,
  isProcessing,
  setIsProcessing 
}: { 
  onSuccess: () => void
  onError: (error: string) => void
  guestInfo: any
  partnerOrderId: string
  bookHash: string
  childGuests: ChildGuest[]
  hotelName: string
  checkIn: string
  checkOut: string
  adults: number
  rooms: number
  selectedPaymentType: any
  remarks?: string
  isProcessing: boolean
  setIsProcessing: (val: boolean) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    try {
      setIsProcessing(true)
      setErrorMessage(null)

      const { error: submitError } = await elements.submit()
      if (submitError) {
        throw new Error(submitError.message)
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/customer/hotellbookinger`,
        },
        redirect: 'if_required'
      })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      if (paymentIntent?.status === 'succeeded') {
        const response = await fetch('/api/hotels/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partnerOrderId,
            bookHash,
            childGuests,
            hotelName,
            checkIn,
            checkOut,
            adults,
            rooms,
            guestInfo,
            paymentType: selectedPaymentType,
            paymentIntentId: paymentIntent.id,
            remarks: remarks || ''
          })
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Booking feilet')
        }

        onSuccess()
      } else {
        throw new Error('Betaling ikke fullført')
      }

    } catch (err: any) {
      console.error('❌ Payment error:', err)
      const message = err.message || 'Betaling feilet'
      setErrorMessage(message)
      onError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="pt-4">
        <Button 
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Behandler betaling...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Betal og bekreft booking
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

interface HotelBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomData: {
    book_hash: string
    room_name: string
    hotel_name: string
    checkIn: string
    checkOut: string
    adults: number
    children: number[]
    rooms: number
    totalPrice: string
  }
}

export default function HotelBookingDialog({
  open,
  onOpenChange,
  roomData
}: HotelBookingDialogProps) {
  const { data: session } = useSession()
  const [step, setStep] = useState<'prebook' | 'details' | 'recheck' | 'payment' | 'confirmation'>('prebook')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prebookData, setPrebookData] = useState<any>(null)
  const [originalPrice, setOriginalPrice] = useState<number | null>(null)
  // recheckData: latest prebook session — book_hash (p-), partner_order_id, payment_types, price_changed
  const [recheckData, setRecheckData] = useState<any>(null)
  const [selectedPaymentType, setSelectedPaymentType] = useState<any>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  // Form data
  const [guestInfo, setGuestInfo] = useState({
    firstName: session?.user?.name?.split(' ')[0] || '',
    lastName: session?.user?.name?.split(' ')[1] || '',
    email: session?.user?.email || '',
    phone: ''
  })
  const [bookingRemarks, setBookingRemarks] = useState('')
  // Individual child names keyed by index
  const [childGuests, setChildGuests] = useState<ChildGuest[]>(
    Array.isArray(roomData.children)
      ? roomData.children.map((age: number) => ({ firstName: '', lastName: '', age }))
      : []
  )

  // Start recheck automatisk når vi går til recheck step
  useEffect(() => {
    if (step === 'recheck' && !recheckData && !isLoading) {
      console.log('🔄 Auto-starting recheck...')
      handleRecheck()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  // Step 1: Prebook (validate rate)
  const handlePrebook = async () => {
    return Sentry.startSpan(
      {
        op: 'ui.click',
        name: 'Hotel Prebook',
      },
      async (span) => {
        try {
          setIsLoading(true)
          setError(null)

          span.setAttribute('hotelName', roomData.hotel_name)
          span.setAttribute('checkIn', roomData.checkIn)
          span.setAttribute('checkOut', roomData.checkOut)

          const response = await fetch('/api/hotels/prebook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookHash: roomData.book_hash,
              checkIn: roomData.checkIn,
              checkOut: roomData.checkOut,
              adults: roomData.adults,
              children: roomData.children,
              rooms: roomData.rooms
            })
          })

          const data = await response.json()

          if (!data.success) {
            span.setAttribute('prebookSuccess', false)
            span.setAttribute('prebookError', data.error || 'Unknown error')
            throw new Error(data.error || 'Prebook feilet')
          }

          span.setAttribute('prebookSuccess', true)
          setPrebookData(data.prebookData)
          
          // Lagre original pris fra første prebook
          if (data.prebookData.payment_types && data.prebookData.payment_types.length > 0) {
            const depositType = data.prebookData.payment_types.find((pt: any) => pt.type === 'deposit')
            const paymentType = depositType || data.prebookData.payment_types[0]
            setSelectedPaymentType(paymentType)
            
            // Lagre original pris for sammenligning
            const originalPriceValue = parseFloat(paymentType.amount || '0')
            setOriginalPrice(originalPriceValue)
            span.setAttribute('originalPrice', originalPriceValue)
          }
          
          setStep('details')
        } catch (err: any) {
          Sentry.captureException(err)
          span.setAttribute('error', err.message || String(err))
          setError(err.message || 'Kunne ikke validere prisen. Prøv igjen.')
        } finally {
          setIsLoading(false)
        }
      }
    )
  }

  // Step 2: Collect guest details
  const handleGuestDetails = async () => {
    if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone) {
      setError('Vennligst fyll ut alle feltene')
      return
    }
    const missingChildName = childGuests.find(c => !c.firstName || !c.lastName)
    if (missingChildName) {
      setError('Vennligst fyll ut navn for alle barn')
      return
    }
    
    // Reset recheck data før vi går til recheck step
    setRecheckData(null)
    setError(null)
    
    // Gå til recheck step (recheck starter automatisk via useEffect)
    setStep('recheck')
  }

  // Step 3: Recheck (valider pris, tilgjengelighet, policies før payment)
  const handleRecheck = async () => {
    return Sentry.startSpan(
      {
        op: 'ui.click',
        name: 'Hotel Recheck',
      },
      async (span) => {
        try {
          setIsLoading(true)
          setError(null)

          span.setAttribute('hotelName', roomData.hotel_name)
          span.setAttribute('originalPrice', originalPrice || 0)

          // Gjør ny prebook for å validere pris og tilgjengelighet
          const response = await fetch('/api/hotels/prebook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookHash: roomData.book_hash,
              checkIn: roomData.checkIn,
              checkOut: roomData.checkOut,
              adults: roomData.adults,
              children: roomData.children,
              rooms: roomData.rooms
            })
          })

          const data = await response.json()

          if (!data.success) {
            span.setAttribute('recheckSuccess', false)
            span.setAttribute('recheckError', data.error || 'Unknown error')
            throw new Error(data.error || 'Recheck feilet - pris eller tilgjengelighet har endret seg')
          }

          span.setAttribute('recheckSuccess', true)
          setRecheckData(data.prebookData)

          if (data.prebookData.payment_types && data.prebookData.payment_types.length > 0) {
            const depositType = data.prebookData.payment_types.find((pt: any) => pt.type === 'deposit')
            const paymentType = depositType || data.prebookData.payment_types[0]
            const newPrice = parseFloat(paymentType.amount || '0')

            span.setAttribute('newPrice', newPrice)
            span.setAttribute('price_changed', data.prebookData.price_changed ?? false)

            setSelectedPaymentType(paymentType)
          }
        } catch (err: any) {
          Sentry.captureException(err)
          span.setAttribute('error', err.message || String(err))
          setError(err.message || 'Kunne ikke validere booking. Prøv igjen.')
        } finally {
          setIsLoading(false)
        }
      }
    )
  }

  // Step 4: Prepare payment (kalles fra recheck)
  const handlePreparePayment = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!selectedPaymentType) {
        throw new Error('Ingen betalingstype valgt')
      }

      // Parse price fra selectedPaymentType
      const price = parseFloat(selectedPaymentType.amount || '0')
      const amountInCents = Math.round(price * 100) // Convert to øre

      console.log('💳 Creating payment intent for:', amountInCents, 'øre')

      // Create Stripe Payment Intent
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInCents,
          currency: 'nok',
          description: `Hotellbooking: ${roomData.hotel_name}`,
          metadata: {
            type: 'hotel',
            hotelName: roomData.hotel_name,
            roomName: roomData.room_name,
            checkIn: roomData.checkIn,
            checkOut: roomData.checkOut,
            guests: `${roomData.adults} voksne, ${roomData.children} barn`
          }
        })
      })

      const data = await response.json()

      if (!data.clientSecret) {
        throw new Error('Kunne ikke opprette betaling')
      }

      setClientSecret(data.clientSecret)
      setStep('payment')
    } catch (err: any) {
      console.error('❌ Payment intent error:', err)
      setError(err.message || 'Kunne ikke forberede betaling')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // Parse tax breakdown fra payment_options
  const parseTaxBreakdown = (paymentOptions: any) => {
    if (!paymentOptions?.payment_types?.[0]?.tax_data?.taxes) {
      return null
    }

    const taxes = paymentOptions.payment_types[0].tax_data.taxes
    const includedTaxes: any[] = []
    const nonIncludedTaxes: any[] = []

    taxes.forEach((tax: any) => {
      if (tax.included_by_supplier) {
        includedTaxes.push(tax)
      } else {
        nonIncludedTaxes.push(tax)
      }
    })

    return {
      included: includedTaxes,
      nonIncluded: nonIncludedTaxes,
      hasTaxes: includedTaxes.length > 0 || nonIncludedTaxes.length > 0
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl">
            {step === 'prebook' && 'Bekreft booking'}
            {step === 'details' && 'Dine opplysninger'}
            {step === 'recheck' && 'Gjennomgå booking'}
            {step === 'payment' && 'Betaling'}
            {step === 'confirmation' && 'Booking bekreftet!'}
          </DialogTitle>
          <DialogDescription>
            {step === 'prebook' && 'Sjekk detaljer før du fortsetter'}
            {step === 'details' && 'Fyll inn kontaktinformasjon'}
            {step === 'recheck' && 'Vi validerer pris og tilgjengelighet før betaling'}
            {step === 'payment' && 'Fullfør betaling for å bekrefte booking'}
            {step === 'confirmation' && 'Din booking er bekreftet'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="px-6 pb-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Booking Summary - vises i alle steg */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">{roomData.hotel_name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rom:</span>
                    <span className="font-medium">{roomData.room_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Innsjekk:</span>
                    <span>{formatDate(roomData.checkIn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utsjekk:</span>
                    <span>{formatDate(roomData.checkOut)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gjester:</span>
                    <span>{roomData.adults} voksne, {Array.isArray(roomData.children) ? roomData.children.length : roomData.children} barn</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Total pris:</span>
                    <span className="font-bold text-green-600 text-lg">{roomData.totalPrice}</span>
                  </div>
                  
                  {/* Tax Breakdown */}
                  {prebookData?.payment_types?.[0] && (() => {
                    const taxBreakdown = parseTaxBreakdown({ payment_types: prebookData.payment_types })
                    if (taxBreakdown?.hasTaxes) {
                      return (
                        <div className="pt-2 border-t mt-2 space-y-1">
                          {taxBreakdown.included.length > 0 && (
                            <div className="text-xs text-gray-600">
                              <span className="text-green-600">✓</span> Skatter inkludert i prisen
                            </div>
                          )}
                          {taxBreakdown.nonIncluded.length > 0 && (
                            <div className="text-xs text-orange-600">
                              <span className="font-semibold">⚠</span> Lokale skatter kan påløpe ved ankomst
                              <div className="mt-1 pl-4 text-xs">
                                {taxBreakdown.nonIncluded.map((tax: any, i: number) => (
                                  <div key={i}>
                                    {tax.name}: {tax.amount} {tax.currency_code}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Step 1: Prebook */}
            {step === 'prebook' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Klikk på knappen under for å validere tilgjengelighet og pris.
                </p>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handlePrebook}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Validerer...
                    </>
                  ) : (
                    'Fortsett til booking'
                  )}
                </Button>
              </div>
            )}

            {/* Step 2: Guest Details */}
            {step === 'details' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Fornavn *</Label>
                    <Input
                      id="firstName"
                      value={guestInfo.firstName}
                      onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                      placeholder="Ola"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Etternavn *</Label>
                    <Input
                      id="lastName"
                      value={guestInfo.lastName}
                      onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                      placeholder="Nordmann"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">E-post *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                    placeholder="ola@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                    placeholder="+47 123 45 678"
                  />
                </div>

                {/* Barnenavn – ett skjema per barn */}
                {childGuests.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Barneinformasjon</p>
                    {childGuests.map((child, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-3 space-y-2">
                        <p className="text-xs text-gray-500 font-medium">
                          Barn {idx + 1} – {child.age} år
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`childFirstName-${idx}`}>Fornavn *</Label>
                            <Input
                              id={`childFirstName-${idx}`}
                              value={child.firstName}
                              onChange={(e) => {
                                const updated = [...childGuests]
                                updated[idx] = { ...updated[idx], firstName: e.target.value }
                                setChildGuests(updated)
                              }}
                              placeholder="Fornavn"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`childLastName-${idx}`}>Etternavn *</Label>
                            <Input
                              id={`childLastName-${idx}`}
                              value={child.lastName}
                              onChange={(e) => {
                                const updated = [...childGuests]
                                updated[idx] = { ...updated[idx], lastName: e.target.value }
                                setChildGuests(updated)
                              }}
                              placeholder="Etternavn"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Booking Remarks / Special Requests */}
                <div>
                  <Label htmlFor="remarks">Spesielle ønsker (valgfritt)</Label>
                  <textarea
                    id="remarks"
                    className="w-full min-h-[80px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={bookingRemarks}
                    onChange={(e) => setBookingRemarks(e.target.value)}
                    placeholder="F.eks. sen innsjekk, ekstra seng, allergier..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Vi sender dine ønsker videre til hotellet, men kan ikke garantere at de oppfylles.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => setStep('prebook')}
                    className="flex-1"
                  >
                    Tilbake
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={handleGuestDetails}
                  >
                    Fortsett
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Recheck (valider pris og tilgjengelighet før payment) */}
            {step === 'recheck' && (
              <div className="space-y-4">
                {!recheckData ? (
                  // Vis loading mens recheck pågår
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="flex items-start">
                        <Loader2 className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5 animate-spin" />
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-1">Validerer booking...</h4>
                          <p className="text-sm text-blue-800">
                            Vi sjekker pris, tilgjengelighet og kanselleringsregler før betaling.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  // Vis recheck resultat
                  <>
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-green-900 mb-1">Booking validert</h4>
                            <p className="text-sm text-green-800">
                              Pris og tilgjengelighet er bekreftet. Du kan nå fortsette til betaling.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                {/* Prisendring varsel basert på API-flagget price_changed */}
                {recheckData?.price_changed === true && (
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-6">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-900 mb-1">Prisen har endret seg</h4>
                          <p className="text-sm text-yellow-800">
                            Opprinnelig pris var ikke lenger tilgjengelig. Et alternativt tilbud med tilsvarende romtype og kosttype er funnet.
                          </p>
                          {originalPrice && recheckData?.payment_types?.[0] && (
                            <div className="mt-3 text-xs text-yellow-700">
                              <div className="flex justify-between">
                                <span>Opprinnelig pris:</span>
                                <span className="font-medium">{originalPrice.toFixed(2)} NOK</span>
                              </div>
                              <div className="flex justify-between mt-1">
                                <span>Ny pris:</span>
                                <span className="font-medium">
                                  {parseFloat(recheckData.payment_types[0].amount || '0').toFixed(2)} NOK
                                </span>
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-yellow-700 mt-2">Bekreft for å fortsette med den nye prisen.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Cancellation Policies */}
                {prebookData && (
                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-3">Kanselleringsregler</h4>
                      <div className="space-y-2 text-sm">
                        {prebookData.cancellation_policies ? (
                          <div className="text-gray-700">
                            <Check className="h-4 w-4 inline mr-1 text-green-600" />
                            Gratis kansellering tilgjengelig
                          </div>
                        ) : (
                          <div className="text-gray-700">
                            <AlertCircle className="h-4 w-4 inline mr-1 text-orange-600" />
                            Kanselleringsregler gjelder - se detaljer ved booking
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => setStep('details')}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Tilbake
                  </Button>
                  {!recheckData ? (
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleRecheck}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Validerer...
                        </>
                      ) : (
                        'Valider booking'
                      )}
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handlePreparePayment}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Forbereder betaling...
                        </>
                      ) : (
                        'Fortsett til betaling'
                      )}
                    </Button>
                  )}
                </div>
                  </>
                )}
              </div>
            )}

            {/* Step 4: Payment */}
            {step === 'payment' && clientSecret && (
              <div className="space-y-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start">
                      <CreditCard className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Betaling</h4>
                        <p className="text-sm text-blue-800">
                          Du vil bli belastet {roomData.totalPrice}
                        </p>
                        <p className="text-xs text-blue-700 mt-2">
                          Sikker betaling via Stripe • Vi lagrer ikke kortinformasjon
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stripe Payment Element */}
                <Elements 
                  stripe={stripePromise} 
                  options={{ 
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#16a34a',
                      }
                    }
                  }}
                >
                  <PaymentForm 
                    onSuccess={() => setStep('confirmation')}
                    onError={(err) => setError(err)}
                    guestInfo={guestInfo}
                    partnerOrderId={recheckData?.partner_order_id || prebookData?.partner_order_id || ''}
                    bookHash={recheckData?.book_hash || prebookData?.book_hash || roomData.book_hash}
                    childGuests={childGuests}
                    hotelName={roomData.hotel_name}
                    checkIn={roomData.checkIn}
                    checkOut={roomData.checkOut}
                    adults={roomData.adults}
                    rooms={roomData.rooms}
                    selectedPaymentType={selectedPaymentType}
                    remarks={bookingRemarks}
                    isProcessing={isLoading}
                    setIsProcessing={setIsLoading}
                  />
                </Elements>

                <div className="pt-2">
                  <Button 
                    variant="outline"
                    onClick={() => setStep('details')}
                    className="w-full"
                    disabled={isLoading}
                  >
                    Tilbake
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 'confirmation' && (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold">Booking bekreftet!</h3>
                <p className="text-gray-600">
                  En bekreftelse er sendt til {guestInfo.email}
                </p>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => onOpenChange(false)}
                >
                  Lukk
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

