'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plane, User, CreditCard, Check } from 'lucide-react'
import { toast } from 'sonner'

interface FlightOffer {
  id: string
  price: {
    total: number
    currency: string
    formattedNOK: string
  }
  itineraries: Array<{
    duration: string
    segments: Array<{
      departure: {
        iataCode: string
        at: string
        formatted: string
      }
      arrival: {
        iataCode: string
        at: string
        formatted: string
      }
      carrierCode: string
      number: string
      duration: string
    }>
  }>
}

interface Traveler {
  id: string
  name: {
    firstName: string
    lastName: string
  }
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE' | 'UNSPECIFIED'
  contact?: {
    emailAddress: string
    phones?: Array<{
      deviceType: string
      countryCallingCode: string
      number: string
    }>
  }
}

interface FlightBookingModalProps {
  isOpen: boolean
  onClose: () => void
  flightOffer: FlightOffer | null
  passengers: number
}

export function FlightBookingModal({ isOpen, onClose, flightOffer, passengers }: FlightBookingModalProps) {
  const { data: session } = useSession()
  const [step, setStep] = useState<'travelers' | 'contact' | 'payment' | 'confirmation'>('travelers')
  const [isLoading, setIsLoading] = useState(false)
  const [travelers, setTravelers] = useState<Traveler[]>([])
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: ''
  })
  const [bookingResult, setBookingResult] = useState<any>(null)

  // Initialize travelers when modal opens
  useState(() => {
    if (isOpen && passengers > 0) {
      const initialTravelers: Traveler[] = Array.from({ length: passengers }, (_, i) => ({
        id: `${i + 1}`,
        name: {
          firstName: '',
          lastName: ''
        },
        dateOfBirth: '',
        gender: 'UNSPECIFIED' as const
      }))
      setTravelers(initialTravelers)
    }
  }, [isOpen, passengers])

  const updateTraveler = (index: number, field: string, value: string) => {
    setTravelers(prev => prev.map((traveler, i) => {
      if (i === index) {
        if (field.includes('.')) {
          const [parent, child] = field.split('.')
          return {
            ...traveler,
            [parent]: {
              ...traveler[parent as keyof Traveler],
              [child]: value
            }
          }
        }
        return { ...traveler, [field]: value }
      }
      return traveler
    }))
  }

  const validateTravelers = () => {
    return travelers.every(traveler => 
      traveler.name.firstName && 
      traveler.name.lastName && 
      traveler.dateOfBirth && 
      traveler.gender !== 'UNSPECIFIED'
    )
  }

  const handleBooking = async () => {
    if (!flightOffer) return

    setIsLoading(true)
    
    try {
      console.log('📤 Sending booking request with:', {
        flightOffer: flightOffer?.id,
        travelersCount: travelers.length,
        contactInfo: { email: contactInfo.email, hasPhone: !!contactInfo.phone }
      })
      
      // Add contact info to first traveler
      const travelersWithContact = travelers.map((traveler, index) => ({
        ...traveler,
        ...(index === 0 && contactInfo.email && {
          contact: {
            emailAddress: contactInfo.email,
            ...(contactInfo.phone && {
              phones: [{
                deviceType: 'MOBILE',
                countryCallingCode: '47',
                number: contactInfo.phone
              }]
            })
          }
        })
      }))

      const response = await fetch('/api/flights/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          flightOffer,
          travelers: travelersWithContact,
          contacts: [{
            addresseeName: {
              firstName: travelers[0]?.name.firstName,
              lastName: travelers[0]?.name.lastName
            },
            emailAddress: contactInfo.email,
            phones: [{
              deviceType: 'MOBILE',
              countryCallingCode: '47',
              number: contactInfo.phone
            }]
          }]
        })
      })

      const result = await response.json()

      if (result.success) {
        setBookingResult(result)
        setStep('confirmation')
        toast.success('Flyreise booket successfully!')
      } else {
        toast.error(result.error || 'Booking feilet')
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('En feil oppstod under booking')
    } finally {
      setIsLoading(false)
    }
  }

  const resetModal = () => {
    setStep('travelers')
    setTravelers([])
    setContactInfo({ email: '', phone: '' })
    setBookingResult(null)
    onClose()
  }

  if (!flightOffer) return null

  return (
    <Dialog open={isOpen} onOpenChange={resetModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Book Flyreise
          </DialogTitle>
        </DialogHeader>

        {/* Flight Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Flydetaljer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <span>{flightOffer.itineraries[0].segments[0].departure.iataCode}</span>
                  <span>→</span>
                  <span>{flightOffer.itineraries[0].segments[flightOffer.itineraries[0].segments.length - 1].arrival.iataCode}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(flightOffer.itineraries[0].segments[0].departure.at).toLocaleDateString('nb-NO')}
                </div>
              </div>
              <div className="text-right">
                {(() => {
                  const pricePerPerson = parseFloat(flightOffer.price.total.toString())
                  const totalPrice = pricePerPerson * passengers
                  
                  return (
                    <>
                      <div className="text-2xl font-bold text-blue-600">
                        {new Intl.NumberFormat('nb-NO', { 
                          style: 'currency', 
                          currency: 'NOK',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(totalPrice)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {passengers} passasjer{passengers > 1 ? 'er' : ''}
                      </div>
                      {passengers > 1 && (
                        <div className="text-xs text-gray-500">
                          ({flightOffer.price.formattedNOK} per person)
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Indicators */}
        <div className="flex items-center justify-center mb-6">
          {['travelers', 'contact', 'payment', 'confirmation'].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === stepName ? 'bg-blue-500 text-white' : 
                ['travelers', 'contact', 'payment'].indexOf(step) > index ? 'bg-green-500 text-white' : 
                'bg-gray-200 text-gray-600'
              }`}>
                {['travelers', 'contact', 'payment'].indexOf(step) > index ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              {index < 3 && <div className="w-12 h-0.5 bg-gray-200 mx-2" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 'travelers' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Passasjerdetaljer</h3>
            <div className="space-y-6">
              {travelers.map((traveler, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Passasjer {index + 1}
                      {index === 0 && <Badge variant="secondary">Hovedpassasjer</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`firstName-${index}`}>Fornavn *</Label>
                      <Input
                        id={`firstName-${index}`}
                        value={traveler.name.firstName}
                        onChange={(e) => updateTraveler(index, 'name.firstName', e.target.value)}
                        placeholder="Fornavn"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`lastName-${index}`}>Etternavn *</Label>
                      <Input
                        id={`lastName-${index}`}
                        value={traveler.name.lastName}
                        onChange={(e) => updateTraveler(index, 'name.lastName', e.target.value)}
                        placeholder="Etternavn"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`dateOfBirth-${index}`}>Fødselsdato *</Label>
                      <Input
                        id={`dateOfBirth-${index}`}
                        type="date"
                        value={traveler.dateOfBirth}
                        onChange={(e) => updateTraveler(index, 'dateOfBirth', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`gender-${index}`}>Kjønn *</Label>
                      <Select
                        value={traveler.gender}
                        onValueChange={(value) => updateTraveler(index, 'gender', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Velg kjønn" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Mann</SelectItem>
                          <SelectItem value="FEMALE">Kvinne</SelectItem>
                          <SelectItem value="UNSPECIFIED">Ikke spesifisert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={onClose}>
                Avbryt
              </Button>
              <Button 
                onClick={() => setStep('contact')}
                disabled={!validateTravelers()}
              >
                Neste: Kontaktinfo
              </Button>
            </div>
          </div>
        )}

        {step === 'contact' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Kontaktinformasjon</h3>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="email">E-post *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="din.epost@example.com"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Booking-bekreftelse og billetter sendes til denne e-posten
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone">Telefonnummer *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="12345678"
                    required
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Nødvendig for flyselskapets kontakt ved forsinkelser eller endringer
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep('travelers')}>
                Tilbake
              </Button>
              <Button 
                onClick={() => setStep('payment')}
                disabled={!contactInfo.email || !contactInfo.phone}
              >
                Neste: Betaling
              </Button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Betaling og Bekreftelse</h3>
            
            {/* Pristransparens advarsel */}
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange-600 text-sm font-bold">⚠️</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-800 mb-2">Viktig prisinfmasjon</h4>
                  <div className="text-sm text-orange-700 space-y-2">
                    <p><strong>Prisen vist er grunnpris og inkluderer IKKE:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Setevalg (ca. 150-800 kr per person)</li>
                      <li>Innsjekket bagasje (ca. 200-600 kr per person)</li>
                      <li>Måltider ombord (ca. 100-400 kr per person)</li>
                      <li>Ekstra håndbagasje (ca. 100-300 kr per person)</li>
                    </ul>
                    <p className="font-medium pt-2">
                      Endelig pris kan bli betydelig høyere enn vist grunnpris.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {!session?.user && (
              <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-blue-900 mb-2">Logg inn for å fullføre booking</h4>
                    <p className="text-sm text-blue-700 mb-4">
                      Du må være logget inn for å fullføre booking og motta billetter på e-post.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        onClick={() => window.location.href = '/sign-in'}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Logg inn
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => window.location.href = '/sign-up'}
                      >
                        Opprett konto
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Betalingsinformasjon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Viktig:</strong> Dette er en demo-versjon. Ingen faktisk betaling vil bli trukket.
                    Booking-prosessen vil simulere en ekte booking gjennom våre reise-API-er.
                  </p>
                </div>
                
                <div className="space-y-4">
                  {/* Grunnpris */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Grunnpris flybillett:</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat('nb-NO', { 
                          style: 'currency', 
                          currency: 'NOK',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(parseFloat(flightOffer.price.total.toString()) * passengers)}
                      </span>
                    </div>
                    {passengers > 1 && (
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>{passengers} passasjerer × {flightOffer.price.formattedNOK}</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      Inkluderer skatter og avgifter
                    </div>
                  </div>

                  {/* Estimert tilleggskostnader */}
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <div className="text-sm">
                      <div className="font-medium text-yellow-800 mb-2">
                        + Estimerte tilleggskostnader per person:
                      </div>
                      <div className="space-y-1 text-yellow-700">
                        <div className="flex justify-between">
                          <span>• Setevalg (valgfritt):</span>
                          <span>150-800 kr</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Innsjekket bagasje (20kg):</span>
                          <span>200-600 kr</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Måltid ombord (valgfritt):</span>
                          <span>100-400 kr</span>
                        </div>
                      </div>
                      <div className="border-t border-yellow-300 mt-2 pt-2">
                        <div className="flex justify-between font-medium text-yellow-800">
                          <span>Mulig totalpris:</span>
                          <span>
                            {new Intl.NumberFormat('nb-NO', { 
                              style: 'currency', 
                              currency: 'NOK',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            }).format((parseFloat(flightOffer.price.total.toString()) + 450) * passengers)} - 
                            {new Intl.NumberFormat('nb-NO', { 
                              style: 'currency', 
                              currency: 'NOK',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            }).format((parseFloat(flightOffer.price.total.toString()) + 1800) * passengers)}
                          </span>
                        </div>
                        <div className="text-xs text-yellow-600 mt-1">
                          Avhengig av valg du gjør under bestilling
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bekreftet totalpris kun grunnpris */}
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Du betaler nå (grunnpris):</span>
                      <span className="text-lg font-bold text-blue-600">
                        {new Intl.NumberFormat('nb-NO', { 
                          style: 'currency', 
                          currency: 'NOK',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(parseFloat(flightOffer.price.total.toString()) * passengers)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Tilleggstjenester velges og betales direkte til flyselskapet
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('contact')}>
                Tilbake
              </Button>
              <Button 
                onClick={handleBooking}
                disabled={isLoading || !session?.user}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booker...
                  </>
                ) : !session?.user ? (
                  'Logg inn for å booke'
                ) : (
                  'Bekreft Booking'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'confirmation' && bookingResult && (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Booking Bekreftet!</h3>
              <p className="text-gray-600">Din flyreise er booket successfully</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="font-medium">Booking-referanse:</span>
                    <span className="font-mono">{bookingResult.booking.bookingReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <Badge className="bg-green-100 text-green-800">
                      {bookingResult.booking.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Totalpris:</span>
                    <span>
                      {new Intl.NumberFormat('nb-NO', { 
                        style: 'currency', 
                        currency: 'NOK',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(parseFloat(flightOffer.price.total.toString()) * passengers)}
                    </span>
                  </div>
                  {passengers > 1 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Per person:</span>
                      <span>{flightOffer.price.formattedNOK}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">E-post bekrefelse:</span>
                    <span>{contactInfo.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              <Button onClick={resetModal} className="w-full">
                Lukk
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
