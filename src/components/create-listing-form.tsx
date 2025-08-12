"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Upload, X, Car, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import VehicleInfoForm from './vehicle-info-form'
import PriceEstimation from './price-estimation'
import ImageUpload from '@/components/image-upload'
import PaymentForm from '@/components/payment-form'
import { getListingPrice } from '@/lib/stripe-shared'

// Validering schema
const listingSchema = z.object({
  title: z.string().min(5, 'Tittel må være minst 5 tegn').max(100, 'Tittel kan ikke være over 100 tegn'),
  description: z.string().min(20, 'Beskrivelse må være minst 20 tegn').max(2000, 'Beskrivelse kan ikke være over 2000 tegn'),
  price: z.number().min(0, 'Pris kan ikke være negativ').max(10000000, 'Pris kan ikke være over 10 millioner'),
  category: z.string().min(1, 'Velg en kategori'),
  location: z.string().min(2, 'Angi lokasjon').max(100, 'Lokasjon kan ikke være over 100 tegn'),
  contactEmail: z.string().email('Ugyldig e-postadresse').optional(),
  contactPhone: z.string().min(8, 'Telefonnummer må være minst 8 siffer').max(15, 'Telefonnummer kan ikke være over 15 siffer').optional(),
  contactName: z.string().min(2, 'Navn må være minst 2 tegn').max(50, 'Navn kan ikke være over 50 tegn').optional(),
})

type ListingFormData = z.infer<typeof listingSchema>

interface UiCategory { value: string; label: string }

export default function CreateListingForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImages, setUploadedImages] = useState([])
  const [categories, setCategories] = useState<UiCategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)

  const [showVehicleFields, setShowVehicleFields] = useState(false)
  const [vehicleData, setVehicleData] = useState<any>(null)
  const [showPriceEstimation, setShowPriceEstimation] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [createdListingId, setCreatedListingId] = useState<string | null>(null)
  const [showAddress, setShowAddress] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      price: 0,
    }
  })

  const selectedCategory = watch('category')

  // Last kategorier fra API (DB) for å sikre at UI alltid samsvarer med databasen
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true)
      try {
        const res = await fetch('/api/kategorier', { cache: 'no-store' })
        if (!res.ok) throw new Error('Kunne ikke hente kategorier')
        const data = await res.json()
        const items: UiCategory[] = data.map((c: any) => ({ value: c.slug, label: c.name }))
        setCategories(items)
      } catch (e) {
        console.error(e)
        setCategories([])
      } finally {
        setIsLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  // Automatisk fylle inn kontaktinformasjon fra session
  useEffect(() => {
    if (session?.user) {
      // Fyller inn navn (først og sist navn, eller bare firstName hvis det er alt som finnes)
      const fullName = session.user.firstName && session.user.lastName 
        ? `${session.user.firstName} ${session.user.lastName}` 
        : session.user.firstName || session.user.name || ''
      
      setValue('contactName', fullName)
      
      // Fyller inn e-post
      setValue('contactEmail', session.user.email || '')
      
      // Fyller inn telefon hvis tilgjengelig
      if (session.user.phone) {
        setValue('contactPhone', session.user.phone)
      }
    }
  }, [session, setValue])

  // Håndter kategori-endring
  const handleCategoryChange = (value: string) => {
    setValue('category', value)
    setShowVehicleFields(value === 'biler')
    setShowPriceEstimation(false)
    setVehicleData(null)
  }

  // Håndter bil-data endringer
  const handleVehicleDataChange = (data: any) => {
    setVehicleData(data)
    setShowPriceEstimation(data.isAuction || false)
  }

  // Håndter bildeopplasting
  const handleImagesChange = (images: any[]) => {
    setUploadedImages(images)
  }

  // Håndter vellykket betaling
  const handlePaymentSuccess = () => {
    setShowPayment(false)
    toast.success('Betaling fullført! Annonsen er nå publisert.')
    router.push('/dashboard/customer/annonser')
  }

  // Håndter betalingsfeil
  const handlePaymentError = (error: string) => {
    toast.error(`Betalingsfeil: ${error}`)
  }

  // Send inn skjema
  const onSubmit = async (data: ListingFormData) => {
    setIsSubmitting(true)
    
    // Valider at vi har minst ett bilde
    if (uploadedImages.length === 0) {
      toast.error('Du må laste opp minst ett bilde')
      setIsSubmitting(false)
      return
    }
    
    try {
      // Sjekk at bruker er logget inn
      if (!session?.user) {
        toast.error('Du må være logget inn for å legge ut en annonse')
        router.push('/sign-in')
        return
      }
      // Hent kategori ID fra valgt kategori
      const response = await fetch('/api/kategorier')
      const categories = await response.json()
      const selectedCategoryObj = categories.find((cat: any) => cat.slug === data.category)
      
      if (!selectedCategoryObj) {
        toast.error('Ugyldig kategori valgt')
        return
      }

      // Forbered data for API
      const apiData = {
        title: data.title,
        description: data.description,
        price: data.price,
        categoryId: selectedCategoryObj.id,
        location: data.location,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        contactName: data.contactName,
        // Bil-spesifikke felt
        ...(selectedCategory === 'biler' && vehicleData ? {
          vehicleSpec: {
            registrationNumber: vehicleData.registrationNumber || null,
            mileage: vehicleData.mileage || null,
            nextInspection: vehicleData.nextInspection || null,
            accidents: vehicleData.hasAccidents || false,
            serviceHistory: vehicleData.serviceHistory || '',
            modifications: [
              vehicleData.modifications || '',
              ...(vehicleData.additionalEquipment || [])
            ].filter(Boolean).join(', ')
          }
        } : {}),
        showAddress,
        images: uploadedImages.filter(img => img.uploaded).map(img => ({ 
          url: img.url, 
          altText: img.name,
          sortOrder: uploadedImages.indexOf(img),
          isMain: uploadedImages.indexOf(img) === 0 
        }))
      }
      
      // NextAuth håndterer automatisk autentisering
      console.log('Bruker autentisert:', !!session)
      
      // Send til API (NextAuth session sendes automatisk)
      const createResponse = await fetch('/api/annonser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Inkluderer cookies som backup
        body: JSON.stringify(apiData)
      })
      
      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        throw new Error(errorData.error || 'Kunne ikke opprette annonse')
      }
      
      const result = await createResponse.json()
      
      // Sjekk om annonsen krever betaling
      const pricing = getListingPrice(data.category)
      
      if (pricing.amount > 0) {
        // Vis betalingsskjema
        setCreatedListingId(result.id)
        setShowPayment(true)
        toast.success('Annonse opprettet! Fullfør betaling for å publisere.')
      } else {
        // Gratis annonse - gå direkte til dashboard
        toast.success('Annonse opprettet! Venter på godkjenning.')
        router.push('/dashboard/customer/annonser')
      }
      
    } catch (error: any) {
      console.error('Feil ved opprettelse:', error)
      toast.error(error.message || 'Kunne ikke opprette annonse. Prøv igjen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hovedinnhold */}
        <div className="lg:col-span-2 space-y-6">
          {/* Grunnleggende informasjon */}
          <Card>
            <CardHeader>
              <CardTitle>Grunnleggende informasjon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Tittel *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="F.eks: BMW X5 2019 - Lav kilometerstand"
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
                  placeholder="Beskriv varen din i detalj..."
                  rows={6}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Pris (kr) *</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="0"
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Kategori *</Label>
                   <Select onValueChange={handleCategoryChange}>
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder={isLoadingCategories ? 'Laster kategorier...' : 'Velg kategori'} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length === 0 && !isLoadingCategories && (
                        <div className="px-3 py-2 text-sm text-gray-500">Ingen kategorier tilgjengelig</div>
                      )}
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="location">Lokasjon *</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="Oslo, Bergen, Trondheim..."
                  className={errors.location ? 'border-red-500' : ''}
                />
                {errors.location && (
                  <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bil-spesifikke felt */}
          {showVehicleFields && (
            <VehicleInfoForm 
              onVehicleDataChange={handleVehicleDataChange}
              showAuctionOption={true}
            />
          )}

          {/* Prisestimering - kun for bil-auksjoner */}
          {showPriceEstimation && vehicleData && (
            <PriceEstimation 
              onEstimationComplete={(estimation) => {
                console.log('Prisestimering for auksjon:', estimation)
                // Her kan vi lagre estimatet til senere bruk
              }}
            />
          )}

          {/* Bilder */}


          {/* Bilder */}
          <Card>
            <CardHeader>
              <CardTitle>Bilder</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                maxImages={10}
                maxFileSize={5}
                onImagesChange={handleImagesChange}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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
                {errors.contactName && (
                  <p className="text-sm text-red-600 mt-1">{errors.contactName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="contactEmail">E-post</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  {...register('contactEmail')}
                  placeholder="din@epost.no"
                />
                {errors.contactEmail && (
                  <p className="text-sm text-red-600 mt-1">{errors.contactEmail.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="contactPhone">Telefon</Label>
                <Input
                  id="contactPhone"
                  {...register('contactPhone')}
                  placeholder="12345678"
                />
                {errors.contactPhone && (
                  <p className="text-sm text-red-600 mt-1">{errors.contactPhone.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="showAddress" checked={showAddress} onCheckedChange={(v) => setShowAddress(!!v)} />
                <Label htmlFor="showAddress" className="text-sm">Vis adresse på annonse</Label>
              </div>
            </CardContent>
          </Card>

          {/* Forhåndsvisning */}
          <Card>
            <CardHeader>
              <CardTitle>Forhåndsvisning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  Slik vil annonsen din se ut:
                </p>
                {/* Mini preview */}
                <div className="bg-white rounded border p-3">
                  <h4 className="font-semibold text-sm">{watch('title') || 'Annonse tittel'}</h4>
                  <p className="text-lg font-bold text-blue-600">{watch('price') || 0} kr</p>
                  <p className="text-sm text-gray-500">{watch('location') || 'Lokasjon'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit knapp */}
          <Card>
            <CardContent className="pt-6">
              {/* Prisinfo */}
              {watch('category') && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Annonsegebyr:</span>
                    <span className="font-semibold">
                      {getListingPrice(watch('category')).amount === 0 
                        ? 'Gratis' 
                        : `${getListingPrice(watch('category')).amount / 100} kr`
                      }
                    </span>
                  </div>
                  {getListingPrice(watch('category')).amount > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Betaling kreves etter opprettelse av annonse
                    </p>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Oppretter annonse...' : 'Opprett annonse'}
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {watch('category') === 'biler' 
                  ? 'Annonsen publiseres etter betaling og godkjenning'
                  : 'Annonsen vil bli sendt til godkjenning før publisering'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      </form>

      {/* Betalingsskjema modal */}
    {showPayment && createdListingId && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="text-center mb-6">
              <CreditCard className="h-8 w-8 text-[#af4c0f] mx-auto mb-2" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Fullfør betaling
              </h2>
              <p className="text-gray-600">
                For å publisere din bil-annonse må du betale annonsegebyret.
              </p>
            </div>

            <PaymentForm
              amount={getListingPrice(watch('category')).amount}
              description={getListingPrice(watch('category')).description}
              categorySlug={watch('category')}
              listingId={createdListingId}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />

            <div className="mt-4 text-center">
              <button
                onClick={() => setShowPayment(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Avbryt og returner senere
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  )
}