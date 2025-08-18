'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import CategorySelector, { ListingCategory, SubCategory } from './category-selector'
import VehicleForm from './forms/vehicle-form'
import PropertyRentalForm from './forms/property-rental-form'
import MarketplaceForm from './forms/marketplace-form'
import ImageUploadStep from './steps/image-upload-step'
import PaymentStep from './steps/payment-step'
import ReviewStep from './steps/review-step'

export interface ListingData {
  // Grunnleggende felter
  title: string
  description: string
  price: number
  location: string
  category: string
  subcategory: string
  
  // Kontaktinfo
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  showAddress?: boolean
  
  // Bilder
  images: string[]
  
  // Kategori-spesifikke data
  vehicleSpec?: any
  propertySpec?: any
  
  // Andre
  enableFortGjort?: boolean
  termsAccepted: boolean
}

enum WizardStep {
  CATEGORY_SELECTION = 0,
  FORM_DETAILS = 1,
  IMAGES = 2,
  PAYMENT = 3,
  REVIEW = 4
}

const STEP_NAMES = [
  'Velg kategori',
  'Detaljer',
  'Bilder',
  'Betaling',
  'Gjennomgang'
]

export default function ListingWizard() {
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.CATEGORY_SELECTION)
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory | null>(null)
  const [listingData, setListingData] = useState<Partial<ListingData>>({
    images: [],
    termsAccepted: false
  })

  const progress = ((currentStep + 1) / 5) * 100

  const handleCategorySelect = (category: ListingCategory, subcategory: SubCategory) => {
    setSelectedCategory(category)
    setSelectedSubcategory(subcategory)
    setListingData(prev => ({
      ...prev,
      category: category.id,
      subcategory: subcategory.id
    }))
    setCurrentStep(WizardStep.FORM_DETAILS)
  }

  const handleFormComplete = (formData: Partial<ListingData>) => {
    setListingData(prev => ({ ...prev, ...formData }))
    setCurrentStep(WizardStep.IMAGES)
  }

  const handleImagesComplete = (images: string[]) => {
    setListingData(prev => ({ ...prev, images }))
    // Hopp over betaling hvis gratis kategori
    if (selectedCategory?.pricing?.free) {
      setCurrentStep(WizardStep.REVIEW)
    } else {
      setCurrentStep(WizardStep.PAYMENT)
    }
  }

  const handlePaymentComplete = () => {
    setCurrentStep(WizardStep.REVIEW)
  }

  const handleBack = () => {
    if (currentStep === WizardStep.CATEGORY_SELECTION) return
    
    if (currentStep === WizardStep.FORM_DETAILS) {
      setCurrentStep(WizardStep.CATEGORY_SELECTION)
      setSelectedCategory(null)
      setSelectedSubcategory(null)
    } else if (currentStep === WizardStep.PAYMENT && selectedCategory?.pricing?.free) {
      // Hopp tilbake til bilder hvis gratis kategori
      setCurrentStep(WizardStep.IMAGES)
    } else {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case WizardStep.CATEGORY_SELECTION:
        return <CategorySelector onCategorySelect={handleCategorySelect} />

      case WizardStep.FORM_DETAILS:
        if (!selectedCategory || !selectedSubcategory) return null
        
        switch (selectedCategory.id) {
          case 'vehicle':
            return (
              <VehicleForm
                subcategory={selectedSubcategory}
                initialData={listingData}
                onComplete={handleFormComplete}
              />
            )
          case 'property_rental':
            return (
              <PropertyRentalForm
                subcategory={selectedSubcategory}
                initialData={listingData}
                onComplete={handleFormComplete}
              />
            )
          case 'marketplace':
            return (
              <MarketplaceForm
                subcategory={selectedSubcategory}
                initialData={listingData}
                onComplete={handleFormComplete}
              />
            )
          default:
            return <div>Ukjent kategori</div>
        }

      case WizardStep.IMAGES:
        return (
          <ImageUploadStep
            initialImages={listingData.images || []}
            onComplete={handleImagesComplete}
          />
        )

      case WizardStep.PAYMENT:
        return (
          <PaymentStep
            category={selectedCategory!}
            onComplete={handlePaymentComplete}
          />
        )

      case WizardStep.REVIEW:
        return (
          <ReviewStep
            listingData={listingData as ListingData}
            category={selectedCategory!}
            subcategory={selectedSubcategory!}
            onGoBack={() => setCurrentStep(WizardStep.IMAGES)}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      {currentStep > WizardStep.CATEGORY_SELECTION && (
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <Button variant="ghost" onClick={handleBack} className="p-2">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Tilbake
              </Button>
              <span className="text-sm text-gray-600">
                Steg {currentStep + 1} av 5: {STEP_NAMES[currentStep]}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="py-8 px-6">
        {renderCurrentStep()}
      </div>
    </div>
  )
}
