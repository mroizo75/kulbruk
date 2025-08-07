'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Building2, CheckCircle, ArrowRight, Loader } from 'lucide-react'
import { toast } from 'sonner'

export default function CompleteBusinessSetupPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingUser, setIsCheckingUser] = useState(true)
  const [formData, setFormData] = useState({
    companyName: '',
    orgNumber: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    website: '',
    description: '',
    businessType: 'bilforhandler' as 'bilforhandler' | 'importør' | 'verksted' | 'annet'
  })

  // Sjekk om brukeren allerede er satt opp som business
  useEffect(() => {
    const checkBusinessSetup = async () => {
      if (!isLoaded || !isSignedIn || !user) {
        console.log('Complete-business-setup: Venter på Clerk...', { isLoaded, isSignedIn, hasUser: !!user })
        return
      }

      console.log('Complete-business-setup: Sjekker business status for bruker:', user.id)

      try {
        const response = await fetch('/api/user/check-business-status', {
          credentials: 'include'
        })
        
        console.log('API response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('Business status data:', data)

        if (data.isBusinessSetup) {
          toast.success('Du er allerede registrert som bedrift!')
          router.push('/dashboard/business')
          return
        }

        // Pre-fill med brukerdata fra Clerk
        setFormData(prev => ({
          ...prev,
          phone: user.phoneNumbers[0]?.phoneNumber || ''
        }))

        console.log('Business setup ikke komplett - viser form')

      } catch (error) {
        console.error('Feil ved sjekk av bedriftsstatus:', error)
        toast.error('Kunne ikke sjekke kontostatus. Prøver å laste skjema...')
        
        // Fortsett med å vise skjema selv om API feiler
        setFormData(prev => ({
          ...prev,
          phone: user.phoneNumbers[0]?.phoneNumber || ''
        }))
      } finally {
        setIsCheckingUser(false)
      }
    }

    checkBusinessSetup()
  }, [isLoaded, isSignedIn, user, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateOrgNumber = (orgNumber: string) => {
    const cleaned = orgNumber.replace(/\s/g, '')
    return /^\d{9}$/.test(cleaned)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isSignedIn) {
      toast.error('Du må være logget inn')
      router.push('/sign-in')
      return
    }

    if (!validateOrgNumber(formData.orgNumber)) {
      toast.error('Organisasjonsnummer må være 9 siffer')
      return
    }

    if (!formData.companyName || !formData.address || !formData.city || !formData.postalCode) {
      toast.error('Vennligst fyll ut alle påkrevde felt')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/business/complete-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          contactPerson: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          email: user?.emailAddresses[0]?.emailAddress || ''
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Bedrift registrert vellykket!')
        // Gi litt tid for database oppdatering før redirect
        setTimeout(() => {
          router.push('/dashboard/business')
        }, 500)
      } else {
        toast.error(data.error || 'Kunne ikke registrere bedrift')
      }
    } catch (error) {
      console.error('Registrering feilet:', error)
      toast.error('Noe gikk galt. Prøv igjen.')
    } finally {
      setIsLoading(false)
    }
  }

  // Vis loading mens vi sjekker bruker
  if (!isLoaded || isCheckingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Sjekker kontostatus...</p>
        </div>
      </div>
    )
  }

  // Redirect hvis ikke logget inn
  if (!isSignedIn) {
    router.push('/sign-in')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl mr-3">
              K
            </div>
            <span className="text-2xl font-bold text-gray-900">Kulbruk.no</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Fullfør bedriftsregistrering</h1>
          </div>
          <Badge className="bg-blue-600 mb-4">Steg 2 av 2</Badge>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Vi trenger litt mer informasjon om din bedrift for å gi deg tilgang til våre profesjonelle verktøy.
          </p>
        </div>

        {/* Progress */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-600">Clerk-konto opprettet</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2">
                <span className="text-xs font-bold">2</span>
              </div>
              <span className="text-sm font-medium text-blue-600">Bedriftsinformasjon</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Bedriftsinformasjon */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Bedriftsinformasjon
                </CardTitle>
                <CardDescription>
                  Grunnleggende informasjon om din bedrift
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Bedriftsnavn *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Eks: Oslo Bil AS"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="orgNumber">Organisasjonsnummer *</Label>
                  <Input
                    id="orgNumber"
                    value={formData.orgNumber}
                    onChange={(e) => handleInputChange('orgNumber', e.target.value)}
                    placeholder="123 456 789"
                    maxLength={11}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">9 siffer uten mellomrom</p>
                </div>

                <div>
                  <Label htmlFor="businessType">Type virksomhet</Label>
                  <select
                    id="businessType"
                    value={formData.businessType}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="bilforhandler">Bilforhandler</option>
                    <option value="importør">Bil-importør</option>
                    <option value="verksted">Verksted med salg</option>
                    <option value="annet">Annet</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="description">Beskrivelse av virksomhet</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Kort beskrivelse av din bedrift og fokusområder..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Kontakt og adresse */}
            <Card>
              <CardHeader>
                <CardTitle>Kontakt og adresse</CardTitle>
                <CardDescription>
                  Hvor kan vi nå deg og din bedrift?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+47 123 45 678"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Forretningsadresse *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Gateadresse 123"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">Postnummer *</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      placeholder="0123"
                      maxLength={4}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="city">Poststed *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Oslo"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Nettside (valgfritt)</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://bedrift.no"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Hva skjer etter registrering?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 mt-0.5">1</Badge>
                    <span>Øyeblikkelig tilgang til business dashboard</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 mt-0.5">2</Badge>
                    <span>Se alle bil-auksjoner og gi bud</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 mt-0.5">3</Badge>
                    <span>Tilgang til profit-kalkulator</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 mt-0.5">4</Badge>
                    <span>Profesjonelle bud-verktøy</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    // Set en flag i Clerk metadata om at brukeren hoppet over
                    fetch('/api/user/skip-business-setup', { 
                      method: 'POST',
                      credentials: 'include'
                    }).finally(() => {
                      router.push('/dashboard/customer')
                    })
                  }}
                  className="flex-1"
                >
                  Hopp over (fullfør senere)
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Registrerer bedrift...
                    </>
                  ) : (
                    'Fullfør registrering'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
