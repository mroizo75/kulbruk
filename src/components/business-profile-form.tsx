'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Building2, Save, Loader } from 'lucide-react'
import { toast } from 'sonner'

interface BusinessProfileFormProps {
  company: {
    name: string
    orgNumber: string
    phone: string
    location: string
    website: string
    contactPerson: string
  }
}

export default function BusinessProfileForm({ company }: BusinessProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: company.name,
    orgNumber: company.orgNumber,
    phone: company.phone,
    address: company.location.split(',')[0] || '',
    postalCode: company.location.match(/\d{4}/)?.[0] || '',
    city: company.location.split(',').pop()?.trim() || '',
    website: company.website,
    contactPerson: company.contactPerson,
    description: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/business/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Bedriftsprofil oppdatert!')
      } else {
        toast.error(data.error || 'Kunne ikke oppdatere profil')
      }
    } catch (error) {
      console.error('Oppdatering feilet:', error)
      toast.error('Noe gikk galt. Prøv igjen.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Bedriftsinformasjon
        </CardTitle>
        <CardDescription>
          Oppdater din bedriftsprofil og kontaktinformasjon
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Bedriftsnavn *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="orgNumber">Organisasjonsnummer *</Label>
              <Input
                id="orgNumber"
                value={formData.orgNumber}
                onChange={(e) => handleInputChange('orgNumber', e.target.value)}
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Organisasjonsnummer kan ikke endres
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactPerson">Kontaktperson *</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
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
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Adresse *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Gateadresse 123"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label htmlFor="website">Nettside</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://bedrift.no"
            />
          </div>

          <div>
            <Label htmlFor="description">Beskrivelse av virksomhet</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Beskriv din bedrift og tjenester..."
              rows={4}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Lagrer...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Lagre endringer
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
