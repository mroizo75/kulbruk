'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface PropertyInfoFormProps {
  onPropertyDataChange?: (data: PropertyFormData) => void
  className?: string
  defaultValues?: Partial<PropertyFormData>
}

interface PropertyFormData {
  // Rom og areal
  rooms?: number
  bedrooms?: number
  bathrooms?: number
  livingArea?: number
  totalUsableArea?: number
  
  // Eiendomstype og tilstand
  propertyType?: string
  ownershipType?: string
  buildingYear?: number
  condition?: string
  
  // Utleie-spesifikke
  furnished?: boolean
  furnishingLevel?: string
  utilitiesIncluded?: boolean
  internetIncluded?: boolean
  cleaningIncluded?: boolean
  minimumRentalPeriod?: number
  
  // Restriksjoner
  petsAllowed?: boolean
  smokingAllowed?: boolean
  studentFriendly?: boolean
  
  // Eiendomsavgifter
  monthlyFee?: number
  propertyTax?: number
  municipalFee?: number
  
  // Teknisk
  energyRating?: string
  heatingType?: string
  
  // Fasiliteter
  hasBalcony?: boolean
  hasGarden?: boolean
  hasParking?: boolean
  hasElevator?: boolean
  hasBasement?: boolean
  
  // Adresse detaljer
  floor?: string
  totalFloors?: number
  
  // Beskrivelse
  description?: string
}

const propertyTypes = [
  'Leilighet', 'Enebolig', 'Rekkehus', 'Tomannsbolig', 'Villa', 
  'Fritidsbolig', 'Blokkleilighet', 'Terrasseleilighet'
]

const ownershipTypes = [
  'Selveier', 'Borettslag', 'Aksjeleilighet', 'Andel', 'Leie'
]

const furnishingLevels = [
  'Umøblert', 'Delvis møblert', 'Fullt møblert'
]

const energyRatings = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

const heatingTypes = [
  'Fjernvarme', 'Elektrisk', 'Varmepumpe', 'Gass', 'Ved/pellets', 'Olje'
]

export default function PropertyInfoForm({ 
  onPropertyDataChange, 
  className = '',
  defaultValues = {}
}: PropertyInfoFormProps) {
  const [formData, setFormData] = useState<PropertyFormData>({
    rooms: 0,
    bedrooms: 0,
    bathrooms: 0,
    livingArea: 0,
    furnished: false,
    utilitiesIncluded: false,
    internetIncluded: false,
    petsAllowed: true,
    smokingAllowed: false,
    studentFriendly: false,
    hasBalcony: false,
    hasGarden: false,
    hasParking: false,
    hasElevator: false,
    hasBasement: false,
    ...defaultValues
  })

  const handleChange = (field: keyof PropertyFormData, value: any) => {
    const updatedData = { ...formData, [field]: value }
    setFormData(updatedData)
    onPropertyDataChange?.(updatedData)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Grunnleggende eiendomsinfo */}
      <Card>
        <CardHeader>
          <CardTitle>Eiendomsinformasjon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Eiendomstype</Label>
              <Select 
                value={formData.propertyType || ''} 
                onValueChange={(value) => handleChange('propertyType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg eiendomstype" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Eieform</Label>
              <Select 
                value={formData.ownershipType || ''} 
                onValueChange={(value) => handleChange('ownershipType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg eieform" />
                </SelectTrigger>
                <SelectContent>
                  {ownershipTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buildingYear">Byggeår</Label>
              <Input
                id="buildingYear"
                type="number"
                value={formData.buildingYear || ''}
                onChange={(e) => handleChange('buildingYear', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="2020"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Tilstand</Label>
              <Select 
                value={formData.condition || ''} 
                onValueChange={(value) => handleChange('condition', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg tilstand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A - Meget god</SelectItem>
                  <SelectItem value="B">B - God</SelectItem>
                  <SelectItem value="C">C - Middels</SelectItem>
                  <SelectItem value="D">D - Dårlig</SelectItem>
                  <SelectItem value="E">E - Meget dårlig</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rom og areal */}
      <Card>
        <CardHeader>
          <CardTitle>Rom og areal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rooms">Antall rom</Label>
              <Input
                id="rooms"
                type="number"
                value={formData.rooms || ''}
                onChange={(e) => handleChange('rooms', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bedrooms">Soverom</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms || ''}
                onChange={(e) => handleChange('bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bad</Label>
              <Input
                id="bathrooms"
                type="number"
                value={formData.bathrooms || ''}
                onChange={(e) => handleChange('bathrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="livingArea">Boareal (m²)</Label>
              <Input
                id="livingArea"
                type="number"
                value={formData.livingArea || ''}
                onChange={(e) => handleChange('livingArea', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="85"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floor">Etasje</Label>
              <Input
                id="floor"
                value={formData.floor || ''}
                onChange={(e) => handleChange('floor', e.target.value)}
                placeholder="3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalFloors">Antall etasjer i bygget</Label>
              <Input
                id="totalFloors"
                type="number"
                value={formData.totalFloors || ''}
                onChange={(e) => handleChange('totalFloors', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Utleie-spesifikke felter */}
      <Card>
        <CardHeader>
          <CardTitle>Utleie detaljer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Møblering</Label>
            <Select 
              value={formData.furnishingLevel || ''} 
              onValueChange={(value) => handleChange('furnishingLevel', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg møbleringsnivå" />
              </SelectTrigger>
              <SelectContent>
                {furnishingLevels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimumRentalPeriod">Minimum leieperiode (måneder)</Label>
            <Input
              id="minimumRentalPeriod"
              type="number"
              value={formData.minimumRentalPeriod || ''}
              onChange={(e) => handleChange('minimumRentalPeriod', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="12"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <Checkbox
                id="furnished"
                checked={formData.furnished}
                onCheckedChange={(checked) => handleChange('furnished', checked)}
              />
              <Label htmlFor="furnished" className="text-sm font-medium cursor-pointer">Møblert</Label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <Checkbox
                id="utilitiesIncluded"
                checked={formData.utilitiesIncluded}
                onCheckedChange={(checked) => handleChange('utilitiesIncluded', checked)}
              />
              <Label htmlFor="utilitiesIncluded" className="text-sm font-medium cursor-pointer">Strøm/vann inkludert</Label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <Checkbox
                id="internetIncluded"
                checked={formData.internetIncluded}
                onCheckedChange={(checked) => handleChange('internetIncluded', checked)}
              />
              <Label htmlFor="internetIncluded" className="text-sm font-medium cursor-pointer">Internett inkludert</Label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <Checkbox
                id="cleaningIncluded"
                checked={formData.cleaningIncluded}
                onCheckedChange={(checked) => handleChange('cleaningIncluded', checked)}
              />
              <Label htmlFor="cleaningIncluded" className="text-sm font-medium cursor-pointer">Renhold inkludert</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restriksjoner */}
      <Card>
        <CardHeader>
          <CardTitle>Restriksjoner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <Checkbox
                id="petsAllowed"
                checked={formData.petsAllowed}
                onCheckedChange={(checked) => handleChange('petsAllowed', checked)}
              />
              <Label htmlFor="petsAllowed" className="text-sm font-medium cursor-pointer">Kjæledyr tillatt</Label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <Checkbox
                id="smokingAllowed"
                checked={formData.smokingAllowed}
                onCheckedChange={(checked) => handleChange('smokingAllowed', checked)}
              />
              <Label htmlFor="smokingAllowed" className="text-sm font-medium cursor-pointer">Røyking tillatt</Label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <Checkbox
                id="studentFriendly"
                checked={formData.studentFriendly}
                onCheckedChange={(checked) => handleChange('studentFriendly', checked)}
              />
              <Label htmlFor="studentFriendly" className="text-sm font-medium cursor-pointer">Studentvennlig</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fasiliteter */}
      <Card>
        <CardHeader>
          <CardTitle>Fasiliteter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <Checkbox
                id="hasBalcony"
                checked={formData.hasBalcony}
                onCheckedChange={(checked) => handleChange('hasBalcony', checked)}
              />
              <Label htmlFor="hasBalcony" className="text-sm font-medium cursor-pointer">Balkong/terrasse</Label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <Checkbox
                id="hasGarden"
                checked={formData.hasGarden}
                onCheckedChange={(checked) => handleChange('hasGarden', checked)}
              />
              <Label htmlFor="hasGarden" className="text-sm font-medium cursor-pointer">Hage</Label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <Checkbox
                id="hasParking"
                checked={formData.hasParking}
                onCheckedChange={(checked) => handleChange('hasParking', checked)}
              />
              <Label htmlFor="hasParking" className="text-sm font-medium cursor-pointer">Parkering</Label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <Checkbox
                id="hasElevator"
                checked={formData.hasElevator}
                onCheckedChange={(checked) => handleChange('hasElevator', checked)}
              />
              <Label htmlFor="hasElevator" className="text-sm font-medium cursor-pointer">Heis</Label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <Checkbox
                id="hasBasement"
                checked={formData.hasBasement}
                onCheckedChange={(checked) => handleChange('hasBasement', checked)}
              />
              <Label htmlFor="hasBasement" className="text-sm font-medium cursor-pointer">Kjeller/bod</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teknisk informasjon */}
      <Card>
        <CardHeader>
          <CardTitle>Teknisk informasjon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Energimerking</Label>
              <Select 
                value={formData.energyRating || ''} 
                onValueChange={(value) => handleChange('energyRating', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg energimerking" />
                </SelectTrigger>
                <SelectContent>
                  {energyRatings.map(rating => (
                    <SelectItem key={rating} value={rating}>{rating}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Oppvarming</Label>
              <Select 
                value={formData.heatingType || ''} 
                onValueChange={(value) => handleChange('heatingType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg oppvarmingstype" />
                </SelectTrigger>
                <SelectContent>
                  {heatingTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kostnader */}
      <Card>
        <CardHeader>
          <CardTitle>Månedlige kostnader</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyFee">Felleskost (kr/mnd)</Label>
              <Input
                id="monthlyFee"
                type="number"
                value={formData.monthlyFee || ''}
                onChange={(e) => handleChange('monthlyFee', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="3500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyTax">Eiendomsskatt (kr/år)</Label>
              <Input
                id="propertyTax"
                type="number"
                value={formData.propertyTax || ''}
                onChange={(e) => handleChange('propertyTax', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="12000"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
