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
import VehicleInfoForm from '@/components/vehicle-info-form'
import PriceEstimation from '@/components/price-estimation'
import { SubCategory } from '../category-selector'
import { ListingData } from '../listing-wizard'

const vehicleSchema = z.object({
  title: z.string().min(5, 'Tittel må være minst 5 tegn').max(100),
  description: z.string().min(20, 'Beskrivelse må være minst 20 tegn').max(2000),
  price: z.number().min(0, 'Pris kan ikke være negativ').max(10000000),
  location: z.string().min(2, 'Angi lokasjon').max(100),
  contactName: z.string().min(2).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(8).optional(),
})

type VehicleFormData = z.infer<typeof vehicleSchema>

interface VehicleFormProps {
  subcategory: SubCategory
  initialData: Partial<ListingData>
  onComplete: (data: Partial<ListingData>) => void
}

export default function VehicleForm({ subcategory, initialData, onComplete }: VehicleFormProps) {
  const [vehicleData, setVehicleData] = useState<any>(initialData.vehicleSpec || null)
  const [showPriceEstimation, setShowPriceEstimation] = useState(false)
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      title: initialData.title || '',
      description: initialData.description || '',
      price: initialData.price || 0,
      location: initialData.location || '',
      contactName: initialData.contactName || '',
      contactEmail: initialData.contactEmail || '',
      contactPhone: initialData.contactPhone || ''
    }
  })

  const currentPrice = watch('price')

  const handleVehicleDataChange = (data: any) => {
    setVehicleData(data)
    
    // Auto-generer tittel hvis det er bil
    if (data && subcategory.id === 'car') {
      const autoTitle = `${data.make || ''} ${data.model || ''} ${data.year || ''}`.trim()
      if (autoTitle.length > 5) {
        setValue('title', autoTitle)
      }
    }

    // Vis prisestimering for biler
    if (data && subcategory.id === 'car') {
      setShowPriceEstimation(true)
    }
  }

  const handlePriceEstimation = (price: number) => {
    setEstimatedPrice(price)
    setValue('price', price)
  }

  const onSubmit = (formData: VehicleFormData) => {
    const completeData: Partial<ListingData> = {
      ...formData,
      vehicleSpec: vehicleData,
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
          Fyll ut informasjon om ditt kjøretøy
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Venstre kolonne - Kjøretøy detaljer */}
          <div className="space-y-6">
            {/* Kjøretøy informasjon */}
            <Card>
              <CardHeader>
                <CardTitle>Kjøretøy informasjon</CardTitle>
              </CardHeader>
              <CardContent>
                <VehicleInfoForm
                  initialData={vehicleData}
                  onDataChange={handleVehicleDataChange}
                  vehicleType={subcategory.id}
                />
              </CardContent>
            </Card>

            {/* Prisestimering for biler */}
            {showPriceEstimation && subcategory.id === 'car' && vehicleData && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Prisforslag</CardTitle>
                </CardHeader>
                <CardContent>
                  <PriceEstimation
                    vehicleData={vehicleData}
                    onPriceCalculated={handlePriceEstimation}
                  />
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
                    placeholder={
                      subcategory.id === 'car' 
                        ? 'F.eks: BMW X5 2019 - Lav kilometerstand'
                        : `F.eks: ${subcategory.name} til salgs`
                    }
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
                    placeholder="Beskriv kjøretøyet ditt i detalj. Nevn tilstand, utstyr, service osv."
                    rows={6}
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
                  {estimatedPrice && currentPrice !== estimatedPrice && (
                    <p className="text-sm text-blue-600 mt-1">
                      AI foreslår: {estimatedPrice.toLocaleString('nb-NO')} kr
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
