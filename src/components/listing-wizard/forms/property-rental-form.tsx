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
import { Badge } from '@/components/ui/badge'
import { SubCategory } from '../category-selector'
import { ListingData } from '../listing-wizard'

const propertySchema = z.object({
  title: z.string().min(5, 'Tittel må være minst 5 tegn').max(100),
  description: z.string().min(20, 'Beskrivelse må være minst 20 tegn').max(2000),
  rentalPrice: z.number().min(0, 'Leiebeløp kan ikke være negativ'),
  deposit: z.number().min(0, 'Depositum kan ikke være negativ').optional(),
  location: z.string().min(2, 'Angi lokasjon').max(100),
  availableFrom: z.string().optional(),
  contactName: z.string().min(2).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(8).optional(),
})

type PropertyFormData = z.infer<typeof propertySchema>

interface PropertyRentalFormProps {
  subcategory: SubCategory
  initialData: Partial<ListingData>
  onComplete: (data: Partial<ListingData>) => void
}

export default function PropertyRentalForm({ subcategory, initialData, onComplete }: PropertyRentalFormProps) {
  const [propertyData, setPropertyData] = useState<any>({
    rooms: '',
    bedrooms: '',
    bathrooms: '',
    livingArea: '',
    furnished: false,
    utilitiesIncluded: false,
    internetIncluded: false,
    petsAllowed: true,
    smokingAllowed: false,
    ...initialData.propertySpec
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: initialData.title || '',
      description: initialData.description || '',
      rentalPrice: initialData.price || 0,
      deposit: 0,
      location: initialData.location || '',
      availableFrom: '',
      contactName: initialData.contactName || '',
      contactEmail: initialData.contactEmail || '',
      contactPhone: initialData.contactPhone || ''
    }
  })

  const rentIncludes = []
  if (propertyData.utilitiesIncluded) rentIncludes.push('Strøm/vann')
  if (propertyData.internetIncluded) rentIncludes.push('Internett')

  const onSubmit = (formData: PropertyFormData) => {
    const completeData: Partial<ListingData> = {
      ...formData,
      price: formData.rentalPrice, // Map rentalPrice to price
      propertySpec: {
        ...propertyData,
        rentIncludes: rentIncludes.join(', ')
      },
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
          Fyll ut informasjon om utleie
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-4 sm:px-6 lg:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Venstre kolonne - Eiendom detaljer */}
          <div className="space-y-6">
            {/* Eiendomsinformasjon */}
            <Card>
              <CardHeader>
                <CardTitle>Eiendom detaljer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rooms">Antall rom</Label>
                    <Input
                      id="rooms"
                      type="number"
                      value={propertyData.rooms}
                      onChange={(e) => setPropertyData({...propertyData, rooms: e.target.value})}
                      placeholder="3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Soverom</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={propertyData.bedrooms}
                      onChange={(e) => setPropertyData({...propertyData, bedrooms: e.target.value})}
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
                      value={propertyData.bathrooms}
                      onChange={(e) => setPropertyData({...propertyData, bathrooms: e.target.value})}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="livingArea">Boareal (m²)</Label>
                    <Input
                      id="livingArea"
                      type="number"
                      value={propertyData.livingArea}
                      onChange={(e) => setPropertyData({...propertyData, livingArea: e.target.value})}
                      placeholder="80"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availableFrom">Tilgjengelig fra</Label>
                  <Input
                    id="availableFrom"
                    type="date"
                    {...register('availableFrom')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Fasiliteter og inkludert */}
            <Card>
              <CardHeader>
                <CardTitle>Fasiliteter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <Checkbox
                      id="furnished"
                      checked={propertyData.furnished}
                      onCheckedChange={(checked) => 
                        setPropertyData({...propertyData, furnished: checked})
                      }
                    />
                    <Label htmlFor="furnished" className="text-sm font-medium cursor-pointer">Møblert</Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <Checkbox
                      id="utilitiesIncluded"
                      checked={propertyData.utilitiesIncluded}
                      onCheckedChange={(checked) => 
                        setPropertyData({...propertyData, utilitiesIncluded: checked})
                      }
                    />
                    <Label htmlFor="utilitiesIncluded" className="text-sm font-medium cursor-pointer">Strøm/vann inkludert</Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <Checkbox
                      id="internetIncluded"
                      checked={propertyData.internetIncluded}
                      onCheckedChange={(checked) => 
                        setPropertyData({...propertyData, internetIncluded: checked})
                      }
                    />
                    <Label htmlFor="internetIncluded" className="text-sm font-medium cursor-pointer">Internett inkludert</Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <Checkbox
                      id="petsAllowed"
                      checked={propertyData.petsAllowed}
                      onCheckedChange={(checked) => 
                        setPropertyData({...propertyData, petsAllowed: checked})
                      }
                    />
                    <Label htmlFor="petsAllowed" className="text-sm font-medium cursor-pointer">Kjæledyr tillatt</Label>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 max-w-sm">
                  <Checkbox
                    id="smokingAllowed"
                    checked={propertyData.smokingAllowed}
                    onCheckedChange={(checked) => 
                      setPropertyData({...propertyData, smokingAllowed: checked})
                    }
                  />
                  <Label htmlFor="smokingAllowed" className="text-sm font-medium cursor-pointer">Røyking tillatt</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Høyre kolonne - Annonse detaljer */}
          <div className="space-y-6">
            {/* Grunnleggende informasjon */}
            <Card>
              <CardHeader>
                <CardTitle>Annonse detaljer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Tittel *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder={`F.eks: Lys ${subcategory.name.toLowerCase()} sentralt i byen`}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Beskrivelse *</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Beskriv boligen i detalj. Nevn beliggenhet, tilstand, nærområde osv."
                    rows={6}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rentalPrice">Månedlig leie (kr) *</Label>
                    <Input
                      id="rentalPrice"
                      type="number"
                      {...register('rentalPrice', { valueAsNumber: true })}
                      placeholder="15000"
                      className={errors.rentalPrice ? 'border-red-500' : ''}
                    />
                    {errors.rentalPrice && (
                      <p className="text-sm text-red-600 mt-1">{errors.rentalPrice.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deposit">Depositum (kr)</Label>
                    <Input
                      id="deposit"
                      type="number"
                      {...register('deposit', { valueAsNumber: true })}
                      placeholder="30000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Lokasjon *</Label>
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="F.eks: Grünerløkka, Oslo"
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>
                  )}
                </div>

                {rentIncludes.length > 0 && (
                  <div>
                    <Label>Inkludert i leien</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {rentIncludes.map((item, index) => (
                        <Badge key={index} variant="secondary">{item}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Kontaktinformasjon */}
            <Card>
              <CardHeader>
                <CardTitle>Kontaktinformasjon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Navn</Label>
                  <Input
                    id="contactName"
                    {...register('contactName')}
                    placeholder="Ditt navn"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">E-post</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    {...register('contactEmail')}
                    placeholder="din@epost.no"
                  />
                </div>

                <div className="space-y-2">
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
