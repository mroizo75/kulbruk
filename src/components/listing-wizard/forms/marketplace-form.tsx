'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { SubCategory } from '../category-selector'
import { ListingData } from '../listing-wizard'

const marketplaceSchema = z.object({
  title: z.string().min(5, 'Tittel må være minst 5 tegn').max(100),
  description: z.string().min(20, 'Beskrivelse må være minst 20 tegn').max(2000),
  price: z.number().min(0, 'Pris kan ikke være negativ').max(1000000),
  location: z.string().min(2, 'Angi lokasjon').max(100),
  condition: z.string().min(1, 'Velg tilstand'),
  contactName: z.string().min(2).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(8).optional(),
})

type MarketplaceFormData = z.infer<typeof marketplaceSchema>

interface MarketplaceFormProps {
  subcategory: SubCategory
  initialData: Partial<ListingData>
  onComplete: (data: Partial<ListingData>) => void
}

const CONDITIONS = [
  { value: 'new', label: 'Ny/ubrukt' },
  { value: 'very_good', label: 'Meget bra' },
  { value: 'good', label: 'Bra' },
  { value: 'ok', label: 'Brukbar' },
  { value: 'poor', label: 'Dårlig' }
]

export default function MarketplaceForm({ subcategory, initialData, onComplete }: MarketplaceFormProps) {
  const [enableFortGjort, setEnableFortGjort] = useState(false)
  const [condition, setCondition] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<MarketplaceFormData>({
    resolver: zodResolver(marketplaceSchema),
    defaultValues: {
      title: initialData.title || '',
      description: initialData.description || '',
      price: initialData.price || 0,
      location: initialData.location || '',
      condition: '',
      contactName: initialData.contactName || '',
      contactEmail: initialData.contactEmail || '',
      contactPhone: initialData.contactPhone || ''
    }
  })

  const currentPrice = watch('price')

  // Sjekk om Fort gjort er tilgjengelig (500-50000 kr)
  const isFortGjortEligible = currentPrice >= 500 && currentPrice <= 50000

  const onSubmit = (formData: MarketplaceFormData) => {
    const completeData: Partial<ListingData> = {
      ...formData,
      enableFortGjort: enableFortGjort && isFortGjortEligible,
    }
    onComplete(completeData)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {subcategory.name}
        </h1>
        <p className="text-gray-600">
          Fyll ut informasjon om varen du vil selge
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Venstre kolonne - Produkt detaljer */}
          <div className="space-y-6">
            {/* Produktinformasjon */}
            <Card>
              <CardHeader>
                <CardTitle>Produkt detaljer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="condition">Tilstand *</Label>
                  <Select 
                    onValueChange={(value) => {
                      setCondition(value)
                      setValue('condition', value)
                    }}
                  >
                    <SelectTrigger className={errors.condition ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Velg tilstand" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map((cond) => (
                        <SelectItem key={cond.value} value={cond.value}>
                          {cond.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.condition && (
                    <p className="text-sm text-red-600 mt-1">{errors.condition.message}</p>
                  )}
                </div>

                {subcategory.id === 'electronics' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Tips for elektronikk:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Nevn merke og modell</li>
                      <li>• Inkluder serienummer hvis mulig</li>
                      <li>• Nevn om original emballasje følger med</li>
                      <li>• Oppgi garantistatus</li>
                    </ul>
                  </div>
                )}

                {subcategory.id === 'furniture' && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Tips for møbler:</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Oppgi dimensjoner (L x B x H)</li>
                      <li>• Nevn materiale og farge</li>
                      <li>• Beskriv eventuelle skader</li>
                      <li>• Om det er fra røykfritt hjem</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fort gjort */}
            {isFortGjortEligible && (
              <Card>
                <CardHeader>
                  <CardTitle>🛡️ Fort gjort - Trygg handel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="enableFortGjort"
                      checked={enableFortGjort}
                      onCheckedChange={(checked) => setEnableFortGjort(checked as boolean)}
                    />
                    <div>
                      <Label htmlFor="enableFortGjort" className="font-medium">
                        Aktiver Fort gjort
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Sikker betaling gjennom vår escrow-tjeneste. Kjøper betaler til oss, 
                        og du får pengene når kjøper bekrefter mottak. Gebyr: 2.5%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Høyre kolonne - Annonse detaljer */}
          <div className="space-y-6">
            {/* Grunnleggende informasjon */}
            <Card>
              <CardHeader>
                <CardTitle>Annonse detaljer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Tittel *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder={`F.eks: iPhone 13 Pro i perfekt stand`}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Beskrivelse *</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Beskriv varen din i detalj. Nevn tilstand, alder, hvorfor du selger osv."
                    rows={8}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="price">Pris (kr) *</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="0"
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  {isFortGjortEligible && (
                    <p className="text-sm text-green-600 mt-1">
                      ✅ Kvalifiserer for Fort gjort (500-50.000 kr)
                    </p>
                  )}
                  {errors.price && (
                    <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="location">Lokasjon *</Label>
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="F.eks: Oslo, Bergen, Trondheim"
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Kontaktinformasjon */}
            <Card>
              <CardHeader>
                <CardTitle>Kontaktinformasjon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contactName">Navn</Label>
                  <Input
                    id="contactName"
                    {...register('contactName')}
                    placeholder="Ditt navn"
                  />
                </div>

                <div>
                  <Label htmlFor="contactEmail">E-post</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    {...register('contactEmail')}
                    placeholder="din@epost.no"
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Telefon</Label>
                  <Input
                    id="contactPhone"
                    {...register('contactPhone')}
                    placeholder="12345678"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            Neste: Legg til bilder
          </Button>
        </div>
      </form>
    </div>
  )
}
