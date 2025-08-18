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
import PropertyInfoForm from '@/components/property-info-form'
import { toast } from 'sonner'
import { Gavel, Trash2, DollarSign, EyeOff, Eye } from 'lucide-react'

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
  // Eiendom utleie felter
  rentalPrice: z.number().min(0).optional(),
  deposit: z.number().min(0).optional(),
  availableFrom: z.string().optional(),
  rentIncludes: z.string().optional(),
  // Fort gjort og andre settings
  enableFortGjort: z.boolean().optional(),
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
  propertySpec?: any
  listingType?: 'FIXED_PRICE' | 'AUCTION'
  status: string
  enableFortGjort: boolean
  // Eiendom felter
  propertyPurpose?: string
  rentalPrice?: number
  deposit?: number
  availableFrom?: string
  rentIncludes?: string
  category: any
}

export default function EditListingForm(props: Props) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<any[]>(props.images?.map((i) => ({ url: i.url, name: 'Eksisterende', uploaded: true })) || [])
  const [vehicleData, setVehicleData] = useState<any>(props.vehicleSpec || null)
  const [propertyData, setPropertyData] = useState<any>(props.propertySpec || null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
      rentalPrice: props.rentalPrice,
      deposit: props.deposit,
      availableFrom: props.availableFrom,
      rentIncludes: props.rentIncludes,
      enableFortGjort: props.enableFortGjort,
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
        propertySpec: propertyData || undefined,
        // Eiendom utleie data
        ...(props.propertyPurpose === 'RENTAL' && {
          propertyPurpose: 'RENTAL',
          rentalPrice: data.rentalPrice,
          deposit: data.deposit,
          availableFrom: data.availableFrom ? new Date(data.availableFrom) : undefined,
          rentIncludes: data.rentIncludes
        })
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-2">
            <Checkbox id="showAddress" {...register('showAddress')} />
            <span className="text-sm">Vis adresse på annonse</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox id="isActive" {...register('isActive')} />
            <span className="text-sm">Annonse aktiv</span>
          </label>
          {props.category?.slug === 'torget' && (
            <label className="flex items-center gap-2">
              <Checkbox id="enableFortGjort" {...register('enableFortGjort')} />
              <span className="text-sm">Aktiver Fort gjort</span>
            </label>
          )}
        </div>

        {/* Eiendom utleie felter */}
        {props.propertyPurpose === 'RENTAL' && (
          <Card>
            <CardHeader>
              <CardTitle>Utleie detaljer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rentalPrice">Månedlig leie (kr)</Label>
                  <Input id="rentalPrice" type="number" {...register('rentalPrice', { valueAsNumber: true })} className={errors.rentalPrice ? 'border-red-500' : ''} />
                </div>
                <div>
                  <Label htmlFor="deposit">Depositum (kr)</Label>
                  <Input id="deposit" type="number" {...register('deposit', { valueAsNumber: true })} className={errors.deposit ? 'border-red-500' : ''} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="availableFrom">Tilgjengelig fra</Label>
                  <Input id="availableFrom" type="date" {...register('availableFrom')} />
                </div>
              </div>
              <div>
                <Label htmlFor="rentIncludes">Hva som inngår i leien</Label>
                <Textarea id="rentIncludes" rows={3} {...register('rentIncludes')} placeholder="Strøm, vann, internett..." />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status informasjon */}
        <Card>
          <CardHeader>
            <CardTitle>Annonse status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  props.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  props.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  props.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  props.status === 'SOLD' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {props.status === 'APPROVED' && 'Godkjent'}
                  {props.status === 'PENDING' && 'Venter på godkjenning'}
                  {props.status === 'REJECTED' && 'Avvist'}
                  {props.status === 'SOLD' && 'Solgt'}
                  {!['APPROVED', 'PENDING', 'REJECTED', 'SOLD'].includes(props.status) && props.status}
                </span>
              </div>
              {props.shortCode && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Annonse-ID:</span>
                  <code className="px-2 py-1 bg-gray-100 rounded text-xs">#{props.shortCode}</code>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
        
        {/* Eiendomsspesifikasjon (for eiendom) */}
        {props.propertySpec && (
          <Card>
            <CardHeader>
              <CardTitle>Eiendomsinformasjon</CardTitle>
            </CardHeader>
            <CardContent>
              <PropertyInfoForm
                onPropertyDataChange={setPropertyData}
                className=""
                defaultValues={{
                  rooms: props.propertySpec.rooms || undefined,
                  bedrooms: props.propertySpec.bedrooms || undefined,
                  bathrooms: props.propertySpec.bathrooms || undefined,
                  livingArea: props.propertySpec.livingArea || undefined,
                  propertyType: props.propertySpec.propertyType || undefined,
                  ownershipType: props.propertySpec.ownershipType || undefined,
                  buildingYear: props.propertySpec.buildingYear || undefined,
                  condition: props.propertySpec.condition || undefined,
                  furnished: props.propertySpec.furnished || false,
                  furnishingLevel: props.propertySpec.furnishingLevel || undefined,
                  utilitiesIncluded: props.propertySpec.utilitiesIncluded || false,
                  internetIncluded: props.propertySpec.internetIncluded || false,
                  cleaningIncluded: props.propertySpec.cleaningIncluded || false,
                  minimumRentalPeriod: props.propertySpec.minimumRentalPeriod || undefined,
                  petsAllowed: props.propertySpec.petsAllowed || true,
                  smokingAllowed: props.propertySpec.smokingAllowed || false,
                  studentFriendly: props.propertySpec.studentFriendly || false,
                  hasBalcony: props.propertySpec.hasBalcony || false,
                  hasGarden: props.propertySpec.hasGarden || false,
                  hasParking: props.propertySpec.hasParking || false,
                  hasElevator: props.propertySpec.hasElevator || false,
                  hasBasement: props.propertySpec.hasBasement || false,
                  energyRating: props.propertySpec.energyRating || undefined,
                  heatingType: props.propertySpec.heatingType || undefined,
                  monthlyFee: props.propertySpec.monthlyFee || undefined,
                  propertyTax: props.propertySpec.propertyTax || undefined,
                  floor: props.propertySpec.floor || undefined,
                  totalFloors: props.propertySpec.totalFloors || undefined,
                }}
              />
            </CardContent>
          </Card>
        )}
        <div className="pt-6 space-y-4">
          {/* Hoved handlinger */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? 'Lagrer…' : 'Lagre endringer'}
            </Button>
            
            {props.status === 'APPROVED' && props.status !== 'SOLD' && (
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/annonser/${encodeURIComponent(props.id)}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ markAsSold: true })
                    })
                    if (!res.ok) throw new Error('Kunne ikke markere som solgt')
                    toast.success('Annonse markert som solgt')
                    router.refresh()
                  } catch (e: any) {
                    toast.error(e?.message || 'Noe gikk galt')
                  }
                }}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Marker som solgt
              </Button>
            )}
            
            {props.listingType === 'FIXED_PRICE' && props.status === 'APPROVED' && (
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
          
          {/* Skjul/vis annonse og Fort gjort */}
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                try {
                  const newActiveState = !watch('isActive')
                  const res = await fetch(`/api/annonser/${encodeURIComponent(props.id)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isActive: newActiveState })
                  })
                  if (!res.ok) throw new Error('Kunne ikke oppdatere synlighet')
                  toast.success(newActiveState ? 'Annonse er nå synlig' : 'Annonse er nå skjult')
                  router.refresh()
                } catch (e: any) {
                  toast.error(e?.message || 'Noe gikk galt')
                }
              }}
            >
              {watch('isActive') ? (
                <><EyeOff className="h-4 w-4 mr-2" />Skjul annonse</>
              ) : (
                <><Eye className="h-4 w-4 mr-2" />Vis annonse</>
              )}
            </Button>
            
            {props.enableFortGjort && props.category?.slug === 'torget' && (
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/annonser/${encodeURIComponent(props.id)}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ enableFortGjort: false })
                    })
                    if (!res.ok) throw new Error('Kunne ikke fjerne Fort gjort')
                    toast.success('Fort gjort er fjernet fra annonsen')
                    router.refresh()
                  } catch (e: any) {
                    toast.error(e?.message || 'Noe gikk galt')
                  }
                }}
              >
                Fjern Fort gjort
              </Button>
            )}
          </div>
          
          {/* Farlige handlinger */}
          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Slett annonse
              </Button>
            </div>
          </div>
          
          {/* Bekreft sletting modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Bekreft sletting</h3>
                <p className="text-gray-600 mb-6">
                  Er du sikker på at du vil slette denne annonsen? Denne handlingen kan ikke angres.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Avbryt
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isDeleting}
                    onClick={async () => {
                      setIsDeleting(true)
                      try {
                        const res = await fetch(`/api/annonser/${encodeURIComponent(props.id)}`, {
                          method: 'DELETE'
                        })
                        if (!res.ok) throw new Error('Kunne ikke slette annonse')
                        toast.success('Annonse slettet')
                        router.push('/dashboard/customer/annonser')
                      } catch (e: any) {
                        toast.error(e?.message || 'Noe gikk galt ved sletting')
                        setIsDeleting(false)
                        setShowDeleteConfirm(false)
                      }
                    }}
                  >
                    {isDeleting ? 'Sletter...' : 'Slett annonse'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


