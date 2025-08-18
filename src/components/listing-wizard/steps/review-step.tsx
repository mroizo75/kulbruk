'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Check, MapPin, Calendar, Phone, Mail, User, Edit, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { ListingCategory, SubCategory } from '../category-selector'
import { ListingData } from '../listing-wizard'

interface ReviewStepProps {
  listingData: ListingData
  category: ListingCategory
  subcategory: SubCategory
  onGoBack?: () => void
}

export default function ReviewStep({ listingData, category, subcategory, onGoBack }: ReviewStepProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleSubmit = async () => {
    if (!termsAccepted) {
      toast.error('Du må akseptere vilkårene for å publisere annonsen')
      return
    }

    setIsSubmitting(true)

    try {
      const submissionData = {
        ...listingData,
        category: category.id,
        subcategory: subcategory.id,
        termsAccepted: true
      }

      const response = await fetch('/api/annonser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      })

      if (!response.ok) {
        throw new Error('Feil ved oppretting av annonse')
      }

      const result = await response.json()
      
      toast.success('Annonse opprettet!', {
        description: 'Din annonse vil være synlig etter godkjenning.'
      })

      // Redirect til annonsen eller dashboard
      router.push(`/annonser/detaljer/${result.listing.id}`)
      
    } catch (error) {
      console.error('Submission error:', error)
      toast.error('Noe gikk galt. Prøv igjen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gjennomgang og publisering
        </h1>
        <p className="text-gray-600">
          Sjekk at alt stemmer før du publiserer annonsen
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Venstre kolonne - Annonse preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Annonse forhåndsvisning</CardTitle>
                {onGoBack && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onGoBack}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Rediger
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold">{listingData.title}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <Badge variant="outline">{subcategory.name}</Badge>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {listingData.location}
                    </span>
                  </div>
                </div>

                <div className="text-2xl font-bold text-green-600">
                  {category.id === 'property_rental' ? (
                    `${listingData.price?.toLocaleString('nb-NO')} kr/mnd`
                  ) : (
                    `${listingData.price?.toLocaleString('nb-NO')} kr`
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {listingData.description}
                  </p>
                </div>

                {listingData.images && listingData.images.length > 0 ? (
                  <div>
                    <h4 className="font-medium mb-3">Bilder ({listingData.images.length})</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {listingData.images.map((image, index) => (
                        <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden shadow-sm">
                          <img 
                            src={image} 
                            alt={`Bilde ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                    {listingData.images.length > 10 && (
                      <p className="text-sm text-gray-500 mt-2">
                        Første bilde vil være hovedbilde i annonsen
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Ingen bilder lagt til</span>
                    </div>
                    <p className="text-yellow-700 text-sm mt-1">
                      Annonser med bilder får betydelig mer oppmerksomhet og flere henvendelser.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Høyre kolonne - Detaljer */}
        <div className="space-y-6">
          {/* Kontaktinfo */}
          <Card>
            <CardHeader>
              <CardTitle>Kontaktinformasjon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {listingData.contactName && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{listingData.contactName}</span>
                </div>
              )}
              {listingData.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{listingData.contactEmail}</span>
                </div>
              )}
              {listingData.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{listingData.contactPhone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Kategori-spesifikke detaljer */}
          {category.id === 'vehicle' && listingData.vehicleSpec && (
            <Card>
              <CardHeader>
                <CardTitle>Kjøretøy detaljer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {listingData.vehicleSpec.make && (
                    <div><strong>Merke:</strong> {listingData.vehicleSpec.make}</div>
                  )}
                  {listingData.vehicleSpec.model && (
                    <div><strong>Modell:</strong> {listingData.vehicleSpec.model}</div>
                  )}
                  {listingData.vehicleSpec.year && (
                    <div><strong>År:</strong> {listingData.vehicleSpec.year}</div>
                  )}
                  {listingData.vehicleSpec.mileage && (
                    <div><strong>Kilometertstand:</strong> {listingData.vehicleSpec.mileage.toLocaleString()} km</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {category.id === 'property_rental' && listingData.propertySpec && (
            <Card>
              <CardHeader>
                <CardTitle>Bolig detaljer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {listingData.propertySpec.rooms && (
                    <div><strong>Rom:</strong> {listingData.propertySpec.rooms}</div>
                  )}
                  {listingData.propertySpec.bedrooms && (
                    <div><strong>Soverom:</strong> {listingData.propertySpec.bedrooms}</div>
                  )}
                  {listingData.propertySpec.livingArea && (
                    <div><strong>Boareal:</strong> {listingData.propertySpec.livingArea} m²</div>
                  )}
                  {listingData.propertySpec.furnished && (
                    <div><strong>Møblert:</strong> Ja</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fort gjort */}
          {listingData.enableFortGjort && (
            <Card className="border-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Fort gjort aktivert</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Sikker betaling gjennom escrow-tjeneste
                </p>
              </CardContent>
            </Card>
          )}

          {/* Publisering */}
          <Card>
            <CardHeader>
              <CardTitle>Publisering</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm">
                  Jeg aksepterer{' '}
                  <a href="/vilkar-og-betingelser" target="_blank" className="text-blue-600 hover:underline">
                    vilkårene og betingelsene
                  </a>
                </Label>
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={!termsAccepted || isSubmitting}
                size="lg"
                className="w-full"
              >
                {isSubmitting ? 'Publiserer...' : 'Publiser annonse'}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Annonsen vil være synlig etter godkjenning (vanligvis innen 24 timer)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
