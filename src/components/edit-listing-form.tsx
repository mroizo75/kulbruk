'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import ImageUpload from '@/components/image-upload'
import VehicleInfoForm from '@/components/vehicle-info-form'
import { toast } from 'sonner'
import { Gavel } from 'lucide-react'

const schema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  price: z.number().min(0),
  location: z.string().min(2),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  showAddress: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  id: string
  title: string
  description: string
  price: number
  location: string
  contactName: string
  contactEmail: string
  contactPhone: string
  showAddress: boolean
  isActive: boolean
  shortCode?: string
  images?: { url: string }[]
  vehicleSpec?: any
  listingType?: 'FIXED_PRICE' | 'AUCTION'
}

export default function EditListingForm(props: Props) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<any[]>(props.images?.map((i) => ({ url: i.url, name: 'Eksisterende', uploaded: true })) || [])
  const [vehicleData, setVehicleData] = useState<any>(props.vehicleSpec || null)

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: props.title,
      description: props.description,
      price: props.price,
      location: props.location,
      contactName: props.contactName,
      contactEmail: props.contactEmail,
      contactPhone: props.contactPhone,
      showAddress: props.showAddress,
      isActive: props.isActive,
    }
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const payload: any = {
        ...data,
        images: images.filter((img) => img.uploaded).map((img, index) => ({
          url: img.url,
          altText: img.name || `Bilde ${index + 1}`,
          sortOrder: index,
          isMain: index === 0,
        })),
        vehicleSpec: vehicleData || undefined,
      }

      const res = await fetch(`/api/annonser/${encodeURIComponent(props.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Kunne ikke oppdatere annonse')
      toast.success(`Annonse oppdatert${props.shortCode ? ` (#${props.shortCode})` : ''}`)
      router.push('/dashboard/customer/annonser')
    } catch (e: any) {
      toast.error(e?.message || 'Noe gikk galt')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div>
          <Label htmlFor="title">Tittel</Label>
          <Input id="title" {...register('title')} className={errors.title ? 'border-red-500' : ''} />
        </div>
        <div>
          <Label htmlFor="description">Beskrivelse</Label>
          <Textarea id="description" rows={6} {...register('description')} className={errors.description ? 'border-red-500' : ''} />
        </div>
        <div>
          <Label htmlFor="price">Pris</Label>
          <Input id="price" type="number" step="1" {...register('price', { valueAsNumber: true })} className={errors.price ? 'border-red-500' : ''} />
        </div>
        <div>
          <Label htmlFor="location">Lokasjon</Label>
          <Input id="location" {...register('location')} className={errors.location ? 'border-red-500' : ''} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="contactName">Kontaktperson</Label>
            <Input id="contactName" {...register('contactName')} />
          </div>
          <div>
            <Label htmlFor="contactEmail">E‑post</Label>
            <Input id="contactEmail" type="email" {...register('contactEmail')} />
          </div>
          <div>
            <Label htmlFor="contactPhone">Telefon</Label>
            <Input id="contactPhone" {...register('contactPhone')} />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <Checkbox id="showAddress" checked={props.showAddress} {...register('showAddress')} />
            <span className="text-sm">Vis adresse på annonse</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox id="isActive" checked={props.isActive} {...register('isActive')} />
            <span className="text-sm">Annonse aktiv</span>
          </label>
        </div>

        {/* Bilder */}
        <Card>
          <CardHeader>
            <CardTitle>Bilder</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              maxImages={10}
              maxFileSize={5}
              onImagesChange={setImages}
              existingImages={(props.images || []).map((i) => i.url)}
            />
          </CardContent>
        </Card>

        {/* Kjøretøyspesifikasjon (for biler) */}
        {props.vehicleSpec && (
          <Card>
            <CardHeader>
              <CardTitle>Bilinformasjon</CardTitle>
            </CardHeader>
            <CardContent>
              <VehicleInfoForm
                onVehicleDataChange={setVehicleData}
                showAuctionOption={true}
                className=""
                defaultValues={{
                  registrationNumber: props.vehicleSpec.registrationNumber || undefined,
                  mileage: props.vehicleSpec.mileage || undefined,
                  nextInspection: props.vehicleSpec.nextInspection ? new Date(props.vehicleSpec.nextInspection).toISOString().slice(0,10) : undefined,
                  hasAccidents: props.vehicleSpec.accidents || false,
                  serviceHistory: props.vehicleSpec.serviceHistory || '',
                  modifications: props.vehicleSpec.modifications || '',
                  additionalEquipment: Array.isArray(props.vehicleSpec.additionalEquipment) ? props.vehicleSpec.additionalEquipment : [],
                }}
              />
            </CardContent>
          </Card>
        )}
        <div className="pt-2 flex gap-3">
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Lagrer…' : 'Lagre endringer'}
          </Button>
          {props.listingType === 'FIXED_PRICE' && (
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                try {
                  const res = await fetch('/api/business/auctions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ listingId: props.id })
                  })
                  const json = await res.json()
                  if (!res.ok || !json.success) throw new Error(json.error || 'Kunne ikke starte auksjon')
                  toast.success('Annonsen er konvertert til auksjon')
                  router.refresh()
                } catch (e: any) {
                  toast.error(e?.message || 'Noe gikk galt ved auksjon')
                }
              }}
            >
              <Gavel className="h-4 w-4 mr-2" />
              Selg via auksjon
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


