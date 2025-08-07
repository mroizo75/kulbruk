'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Building2, FileText, Phone, Mail, Globe, MapPin, CreditCard, Shield } from 'lucide-react'
import { toast } from 'sonner'

export default function RegisterBusinessPage() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    orgNumber: '',
    contactPerson: user?.firstName + ' ' + user?.lastName || '',
    phone: '',
    email: user?.emailAddresses[0]?.emailAddress || '',
    address: '',
    postalCode: '',
    city: '',
    website: '',
    description: '',
    businessType: 'bilforhandler' as 'bilforhandler' | 'importør' | 'verksted' | 'annet'
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateOrgNumber = (orgNumber: string) => {
    // Norsk organisasjonsnummer validering (9 siffer)
    const cleaned = orgNumber.replace(/\s/g, '')
    return /^\d{9}$/.test(cleaned)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isSignedIn) {
      toast.error('Du må være logget inn for å registrere bedrift')
      router.push('/sign-in?redirectUrl=/registrer-bedrift')
      return
    }

    if (!validateOrgNumber(formData.orgNumber)) {
      toast.error('Organisasjonsnummer må være 9 siffer')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/business/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Bedrift registrert! Vi gjennomgår søknaden din.')
        router.push('/dashboard/business')
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

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle>Bedriftsregistrering</CardTitle>
            <CardDescription>
              Du må være logget inn for å registrere din bedrift
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/sign-in?redirectUrl=/registrer-bedrift')}
              className="w-full"
            >
              Logg inn
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Building2 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Registrer din bedrift</h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Få tilgang til Kulbruks auksjonssystem for bilhandlere. 
            By på biler fra privatpersoner og utbygg din virksomhet.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <CreditCard className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Økt fortjeneste</h3>
              <p className="text-sm text-gray-600">Kjøp biler direkte fra privatpersoner til konkurransedyktige priser</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Trygg handel</h3>
              <p className="text-sm text-gray-600">Standardiserte kontrakter og sikker betalingsløsning</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Enkel prosess</h3>
              <p className="text-sm text-gray-600">Gi tilbud med ett klikk, automatisert dokumentasjon</p>
            </CardContent>
          </Card>
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

            {/* Kontaktinformasjon */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Kontaktinformasjon
                </CardTitle>
                <CardDescription>
                  Hvordan kan vi kontakte deg?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contactPerson">Kontaktperson *</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    placeholder="Fullt navn"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-post *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="post@bedrift.no"
                    required
                  />
                </div>

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
                  <Label htmlFor="website">Nettside</Label>
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

            {/* Adresse */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Forretningsadresse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Adresse *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Gateadresse 123"
                      required
                    />
                  </div>
                  
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
                  
                  <div className="md:col-span-3">
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
              </CardContent>
            </Card>
          </div>

          {/* Vilkår og send */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Hva skjer etter registrering?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 mt-0.5">1</Badge>
                    <span>Vi gjennomgår din søknad (1-2 virkedager)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 mt-0.5">2</Badge>
                    <span>Du får tilgang til auksjonsdashboard</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 mt-0.5">3</Badge>
                    <span>Velg abonnement som passer din bedrift</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 mt-0.5">4</Badge>
                    <span>Start å by på biler umiddelbart!</span>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Tilbake
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? 'Registrerer...' : 'Registrer bedrift'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
