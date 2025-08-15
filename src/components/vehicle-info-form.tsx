'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle, Car, RefreshCw, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

interface VehicleInfoFormProps {
  onVehicleDataChange?: (data: VehicleFormData) => void
  showAuctionOption?: boolean
  className?: string
  defaultValues?: Partial<VehicleFormData>
}

interface VehicleFormData {
  registrationNumber?: string
  mileage?: number
  condition?: string
  nextInspection?: string
  hasAccidents?: boolean
  serviceHistory?: string
  modifications?: string
  additionalEquipment?: string[]
  isAuction?: boolean
}

interface CarData {
  registrationNumber: string
  make: string
  model: string
  year: number
  fuelType: string
  transmission: string
  color: string
  vin?: string
  
  // Motor og ytelse
  engineSize?: number
  cylinderCount?: number
  maxPower?: number
  maxSpeed?: number
  
  // Dimensjoner
  length?: number
  width?: number
  height?: number
  bodyType?: string
  
  // Vekter og kapasitet
  weight?: number
  maxWeight?: number
  payload?: number
  roofLoad?: number
  trailerWeightBraked?: number
  trailerWeightUnbraked?: number
  
  // Personer og seter
  seats?: number
  frontSeats?: number
  
  // Miljødata
  co2Emissions?: number
  euroClass?: string
  fuelConsumption?: {
    combined?: number
    city?: number
    highway?: number
  }
  
  // Dekk og felg
  tires?: Array<{
    dimension?: string
    speedRating?: string
    loadRating?: string
    rimSize?: string
  }>
  
  // Sikkerhet
  abs?: boolean
  airbags?: boolean
  
  // Registrering og kontroll
  firstRegistrationDate?: string
  registrationStatus?: string
  lastInspection?: string
  lastApprovedInspection?: string
  
  // Klassifisering
  vehicleGroup?: string
  technicalCode?: string
  
  // Merknader
  remarks?: string[]
}

const conditionOptions = [
  { value: 'A', label: 'A - Meget god (som ny)' },
  { value: 'B', label: 'B - God (mindre bruksspor)' },
  { value: 'C', label: 'C - Middels (synlige bruksspor)' },
  { value: 'D', label: 'D - Dårlig (mye slitasje/skader)' }
]

const commonEquipment = [
  'Klimaanlegg', 'Cruise control', 'Navigasjonssystem', 'Ryggekamera',
  'Parkeringssensorer', 'Xenon/LED-lys', 'Skinnseter', 'Oppvarmet seter',
  'Elektriske seter', 'Panoramatak', 'Tilhengerfeste', 'DAB-radio',
  'Bluetooth', 'Apple CarPlay/Android Auto', 'Adaptiv cruisekontroll',
  'Kollisjonsvern', 'Dødsvinkelassistent', 'Keyless start'
]

export default function VehicleInfoForm({ 
  onVehicleDataChange, 
  showAuctionOption = false,
  className = '',
  defaultValues = {}
}: VehicleInfoFormProps) {
  const [step, setStep] = useState<'input' | 'loading' | 'loaded'>('input')
  const [carData, setCarData] = useState<CarData | null>(null)
  const [formData, setFormData] = useState<VehicleFormData>({
    additionalEquipment: defaultValues.additionalEquipment || [],
    registrationNumber: defaultValues.registrationNumber,
    mileage: defaultValues.mileage,
    condition: defaultValues.condition,
    nextInspection: defaultValues.nextInspection,
    hasAccidents: defaultValues.hasAccidents,
    serviceHistory: defaultValues.serviceHistory,
    modifications: defaultValues.modifications,
    isAuction: defaultValues.isAuction,
  })

  const handleRegNumberBlur = async () => {
    const regNumber = formData.registrationNumber
    
    if (!regNumber || regNumber.length !== 7) {
      return
    }

    setStep('loading')
    
    try {
      const response = await fetch(`/api/vegvesen?regNumber=${regNumber.toUpperCase()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Kunne ikke hente bildata')
      }

      setCarData(data.carData)
      setStep('loaded')
      
      // Automatisk fylle ut EU-kontroll dato hvis tilgjengelig
      if (data.carData.lastInspection) {
        updateFormData({ nextInspection: data.carData.lastInspection })
      }
      
      toast.success('Bildata hentet fra Vegvesen!')

    } catch (error) {
      console.error('Vegvesen API feil:', error)
      toast.error(error instanceof Error ? error.message : 'Kunne ikke hente bildata')
      setStep('input')
    }
  }

  const updateFormData = (updates: Partial<VehicleFormData>) => {
    const newFormData = { ...formData, ...updates }
    setFormData(newFormData)
    
    if (onVehicleDataChange) {
      onVehicleDataChange(newFormData)
    }
  }

  const toggleEquipment = (equipment: string) => {
    const current = formData.additionalEquipment || []
    const updated = current.includes(equipment)
      ? current.filter(item => item !== equipment)
      : [...current, equipment]
    
    updateFormData({ additionalEquipment: updated })
  }

  const addCustomEquipment = (equipment: string) => {
    if (equipment.trim() && !(formData.additionalEquipment || []).includes(equipment.trim())) {
      const updated = [...(formData.additionalEquipment || []), equipment.trim()]
      updateFormData({ additionalEquipment: updated })
    }
  }

  const removeEquipment = (equipment: string) => {
    const updated = (formData.additionalEquipment || []).filter(item => item !== equipment)
    updateFormData({ additionalEquipment: updated })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Registreringsnummer og bildata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Bil-informasjon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div>
            <Label htmlFor="regNumber">Registreringsnummer *</Label>
            <Input
              id="regNumber"
              placeholder="AB12345"
              value={formData.registrationNumber || ''}
              onChange={(e) => updateFormData({ registrationNumber: e.target.value.toUpperCase() })}
              onBlur={handleRegNumberBlur}
              maxLength={7}
              className="font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              7 tegn - bildata hentes automatisk fra Statens Vegvesen
            </p>
          </div>

          {step === 'loading' && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-800">Henter bildata fra Vegvesen...</span>
            </div>
          )}

          {step === 'loaded' && carData && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-3">✅ Bildata hentet fra Vegvesen:</h3>
              
              {/* Grunnleggende informasjon */}
              <div className="mb-4">
                <h4 className="font-medium text-green-900 mb-2">Grunnleggende informasjon</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-green-800">
                  <div><strong>Merke:</strong> {carData.make}</div>
                  <div><strong>Modell:</strong> {carData.model}</div>
                  <div><strong>Årsmodell:</strong> {carData.year}</div>
                  <div><strong>Karosseri:</strong> {carData.bodyType || 'Ikke oppgitt'}</div>
                  <div><strong>Farge:</strong> {carData.color}</div>
                  <div><strong>VIN:</strong> {carData.vin || 'Ikke tilgjengelig'}</div>
                </div>
              </div>

              {/* Motor og drivverk */}
              <div className="mb-4">
                <h4 className="font-medium text-green-900 mb-2">Motor og drivverk</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-green-800">
                  <div><strong>Drivstoff:</strong> {carData.fuelType}</div>
                  <div><strong>Girkasse:</strong> {carData.transmission}</div>
                  {carData.engineSize && <div><strong>Slagvolum:</strong> {carData.engineSize} L</div>}
                  {carData.cylinderCount && <div><strong>Sylindre:</strong> {carData.cylinderCount}</div>}
                  {carData.maxPower && <div><strong>Effekt:</strong> {carData.maxPower} hk</div>}
                  {carData.maxSpeed && <div><strong>Toppfart:</strong> {carData.maxSpeed} km/t</div>}
                </div>
              </div>

              {/* Dimensjoner og vekter */}
              <div className="mb-4">
                <h4 className="font-medium text-green-900 mb-2">Dimensjoner og vekter</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-green-800">
                  {carData.length && <div><strong>Lengde:</strong> {carData.length} cm</div>}
                  {carData.width && <div><strong>Bredde:</strong> {carData.width} cm</div>}
                  {carData.height && <div><strong>Høyde:</strong> {carData.height} cm</div>}
                  {carData.weight && <div><strong>Egenvekt:</strong> {carData.weight} kg</div>}
                  {carData.maxWeight && <div><strong>Totalvekt:</strong> {carData.maxWeight} kg</div>}
                  {carData.payload && <div><strong>Nyttelast:</strong> {carData.payload} kg</div>}
                  {carData.seats && <div><strong>Seter:</strong> {carData.seats}</div>}
                  {carData.trailerWeightBraked && <div><strong>Tilhengervekt (m/brems):</strong> {carData.trailerWeightBraked} kg</div>}
                </div>
              </div>

              {/* Miljødata */}
              {(carData.co2Emissions || carData.euroClass || carData.fuelConsumption?.combined) && (
                <div className="mb-4">
                  <h4 className="font-medium text-green-900 mb-2">Miljødata</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-green-800">
                    {carData.co2Emissions && <div><strong>CO₂-utslipp:</strong> {carData.co2Emissions} g/km</div>}
                    {carData.euroClass && <div><strong>Euro-klasse:</strong> {carData.euroClass}</div>}
                    {carData.fuelConsumption?.combined && <div><strong>Forbruk (blandet):</strong> {carData.fuelConsumption.combined} L/100km</div>}
                    {carData.fuelConsumption?.city && <div><strong>Forbruk (by):</strong> {carData.fuelConsumption.city} L/100km</div>}
                    {carData.fuelConsumption?.highway && <div><strong>Forbruk (landevei):</strong> {carData.fuelConsumption.highway} L/100km</div>}
                  </div>
                </div>
              )}

              {/* Sikkerhet */}
              {(carData.abs !== undefined || carData.airbags !== undefined) && (
                <div className="mb-4">
                  <h4 className="font-medium text-green-900 mb-2">Sikkerhet</h4>
                  <div className="flex flex-wrap gap-2 text-sm text-green-800">
                    {carData.abs && <Badge variant="outline" className="bg-green-100">ABS</Badge>}
                    {carData.airbags && <Badge variant="outline" className="bg-green-100">Airbags</Badge>}
                  </div>
                </div>
              )}

              {/* Registrering og kontroll */}
              <div className="mb-4">
                <h4 className="font-medium text-green-900 mb-2">Registrering og kontroll</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-green-800">
                  {carData.firstRegistrationDate && <div><strong>1. gang registrert:</strong> {new Date(carData.firstRegistrationDate).toLocaleDateString('no-NO')}</div>}
                  {carData.registrationStatus && <div><strong>Status:</strong> {carData.registrationStatus}</div>}
                  {carData.lastInspection && <div><strong>Neste EU-kontroll:</strong> {new Date(carData.lastInspection).toLocaleDateString('no-NO')}</div>}
                  {carData.vehicleGroup && <div><strong>Kjøretøygruppe:</strong> {carData.vehicleGroup}</div>}
                </div>
              </div>

              {/* Merknader */}
              {carData.remarks && carData.remarks.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-green-900 mb-2">Merknader</h4>
                  <div className="text-sm text-green-800">
                    {carData.remarks.map((remark, index) => (
                      <div key={index} className="bg-yellow-100 border-l-4 border-yellow-400 p-2 mb-1">
                        {remark}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-green-600 border-t border-green-200 pt-2 mt-3">
                EU-kontroll dato er automatisk fyllt ut i skjemaet basert på Vegvesen-data
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mileage">Kilometerstand *</Label>
              <Input
                id="mileage"
                type="number"
                placeholder="120000"
                value={formData.mileage || ''}
                onChange={(e) => updateFormData({ mileage: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="condition">Tilstand *</Label>
              <Select onValueChange={(value) => updateFormData({ condition: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg tilstand" />
                </SelectTrigger>
                <SelectContent>
                  {conditionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="nextInspection">Neste EU-kontroll</Label>
            <Input
              id="nextInspection"
              type="date"
              value={formData.nextInspection || ''}
              onChange={(e) => updateFormData({ nextInspection: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasAccidents"
              checked={formData.hasAccidents || false}
              onCheckedChange={(checked) => updateFormData({ hasAccidents: !!checked })}
            />
            <Label htmlFor="hasAccidents" className="text-sm">
              Bilen har vært involvert i ulykke
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Tilleggsutstyr */}
      <Card>
        <CardHeader>
          <CardTitle>Tilleggsutstyr</CardTitle>
          <p className="text-sm text-gray-600">Velg tilleggsutstyr som følger med bilen</p>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Forhåndsdefinerte utstyr */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {commonEquipment.map((equipment) => (
              <div key={equipment} className="flex items-center space-x-2">
                <Checkbox
                  id={equipment}
                  checked={(formData.additionalEquipment || []).includes(equipment)}
                  onCheckedChange={() => toggleEquipment(equipment)}
                />
                <Label htmlFor={equipment} className="text-sm cursor-pointer">
                  {equipment}
                </Label>
              </div>
            ))}
          </div>

          {/* Egendefinert utstyr */}
          <div>
            <Label htmlFor="customEquipment">Legg til annet utstyr</Label>
            <div className="flex gap-2">
              <Input
                id="customEquipment"
                placeholder="F.eks: Vinterdekk, Takboks..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const input = e.target as HTMLInputElement
                    addCustomEquipment(input.value)
                    input.value = ''
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.getElementById('customEquipment') as HTMLInputElement
                  addCustomEquipment(input.value)
                  input.value = ''
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Valgt utstyr */}
          {formData.additionalEquipment && formData.additionalEquipment.length > 0 && (
            <div className="space-y-2">
              <Label>Valgt utstyr:</Label>
              <div className="flex flex-wrap gap-2">
                {formData.additionalEquipment.map((equipment) => (
                  <Badge key={equipment} variant="secondary" className="flex items-center gap-1">
                    {equipment}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeEquipment(equipment)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service og modifikasjoner */}
      <Card>
        <CardHeader>
          <CardTitle>Service og modifikasjoner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div>
            <Label htmlFor="serviceHistory">Servicehistorikk</Label>
            <Textarea
              id="serviceHistory"
              placeholder="Beskriv servicehistorikk, når den siste servicen ble utført, osv..."
              value={formData.serviceHistory || ''}
              onChange={(e) => updateFormData({ serviceHistory: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="modifications">Modifikasjoner/Tuning</Label>
            <Textarea
              id="modifications"
              placeholder="Beskriv eventuelle modifikasjoner eller tuning..."
              value={formData.modifications || ''}
              onChange={(e) => updateFormData({ modifications: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Auksjon-alternativ (kun hvis showAuctionOption er true) */}
      {showAuctionOption && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">🏆 Auksjon til forhandlere</CardTitle>
            <p className="text-sm text-blue-700">
              Ønsker du å selge bilen din gjennom auksjon hvor forhandlere kan by?
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAuction"
                checked={formData.isAuction || false}
                onCheckedChange={(checked) => updateFormData({ isAuction: !!checked })}
              />
              <Label htmlFor="isAuction" className="text-sm">
                Ja, jeg vil selge bilen min gjennom auksjon til forhandlere
              </Label>
            </div>
            
            {formData.isAuction && (
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p><strong>Slik fungerer auksjon:</strong></p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Forhandlere byr på din bil i en lukket budrunde</li>
                      <li>Du får automatisk prisestimering basert på bilens data</li>
                      <li>Du bestemmer om du vil godta høyeste bud</li>
                      <li>Kulbruk håndterer alt papirarbeid ved salg</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}