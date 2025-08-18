'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Car, Home, ShoppingBag, ChevronRight } from 'lucide-react'

export interface ListingCategory {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  subcategories: SubCategory[]
  pricing?: {
    free?: boolean
    price?: number
    description?: string
  }
}

export interface SubCategory {
  id: string
  name: string
  description?: string
}

const LISTING_CATEGORIES: ListingCategory[] = [
  {
    id: 'vehicle',
    name: 'Bil og kjøretøy',
    description: 'Selg din bil, mc, båt eller andre kjøretøy',
    icon: <Car className="h-8 w-8" />,
    subcategories: [
      { id: 'car', name: 'Personbil', description: 'Biler for privat bruk' },
      { id: 'motorcycle', name: 'MC/Scooter', description: 'Motorsykler og scootere' },
      { id: 'van', name: 'Varebil', description: 'Varebiler og kassebiler' },
      { id: 'truck', name: 'Lastebil', description: 'Tunge kjøretøy' },
      { id: 'boat', name: 'Båt', description: 'Fritidsbåter og joller' },
      { id: 'caravan', name: 'Husvogn/Campingvogn', description: 'Campingutstyr på hjul' },
    ],
    pricing: { price: 49, description: 'Bil-annonse (1 måned)' }
  },
  {
    id: 'property_rental',
    name: 'Utleie bolig', 
    description: 'Lei ut din bolig, leilighet eller rom',
    icon: <Home className="h-8 w-8" />,
    subcategories: [
      { id: 'apartment', name: 'Leilighet', description: 'Hele leiligheter til leie' },
      { id: 'house', name: 'Enebolig/Rekkehus', description: 'Hus til leie' },
      { id: 'cabin', name: 'Hytte/Feriebolig', description: 'Fritidsboliger' },
      { id: 'room', name: 'Rom i bofellesskap', description: 'Delt bolig med andre' },
      { id: 'office', name: 'Kontor/Næring', description: 'Næringsarealer' },
    ],
    pricing: { price: 99, description: 'Privatpersoner: 99 kr/mnd' }
  },
  {
    id: 'marketplace',
    name: 'Torget',
    description: 'Alt annet du ønsker å selge eller kjøpe',
    icon: <ShoppingBag className="h-8 w-8" />,
    subcategories: [
      { id: 'electronics', name: 'Elektronikk', description: 'Mobiler, PC, TV osv.' },
      { id: 'furniture', name: 'Møbler og interiør', description: 'Sofaer, bord, lamper osv.' },
      { id: 'clothing', name: 'Klær og sko', description: 'Brukte klær og tilbehør' },
      { id: 'sports', name: 'Sport og fritid', description: 'Treningsutstyr og hobbying' },
      { id: 'kids', name: 'Barn og baby', description: 'Barnetøy, leker og utstyr' },
      { id: 'garden', name: 'Hage og utendørs', description: 'Hageutstyr og utendørsmøbler' },
      { id: 'other', name: 'Annet', description: 'Alt som ikke passer andre kategorier' },
    ],
    pricing: { free: true, description: 'Gratis å legge ut' }
  }
]

interface CategorySelectorProps {
  onCategorySelect: (category: ListingCategory, subcategory: SubCategory) => void
}

export default function CategorySelector({ onCategorySelect }: CategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory | null>(null)

  const handleCategoryClick = (category: ListingCategory) => {
    setSelectedCategory(category)
    setSelectedSubcategory(null)
  }

  const handleSubcategoryClick = (subcategory: SubCategory) => {
    setSelectedSubcategory(subcategory)
  }

  const handleContinue = () => {
    if (selectedCategory && selectedSubcategory) {
      onCategorySelect(selectedCategory, selectedSubcategory)
    }
  }

  const handleBack = () => {
    setSelectedCategory(null)
    setSelectedSubcategory(null)
  }

  if (!selectedCategory) {
    // Steg 1: Velg hovedkategori
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hva vil du legge ut?</h1>
          <p className="text-gray-600">Velg kategorien som passer best for din annonse</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LISTING_CATEGORIES.map((category) => (
            <Card 
              key={category.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => handleCategoryClick(category)}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center text-blue-600 mb-4">
                  {category.icon}
                </div>
                <CardTitle className="text-xl">{category.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">{category.description}</p>
                
                <div className="flex justify-center mb-4">
                  {category.pricing?.free ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Gratis
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      {category.pricing?.price} kr/mnd
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-500">{category.pricing?.description}</p>
                
                <div className="mt-4 flex justify-center">
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Steg 2: Velg underkategori
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          ← Tilbake til kategorier
        </Button>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedCategory.name}
          </h1>
          <p className="text-gray-600">Velg type for å få riktig skjema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {selectedCategory.subcategories.map((subcategory) => (
          <Card 
            key={subcategory.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedSubcategory?.id === subcategory.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleSubcategoryClick(subcategory)}
          >
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2">{subcategory.name}</h3>
              {subcategory.description && (
                <p className="text-sm text-gray-600">{subcategory.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedSubcategory && (
        <div className="flex justify-center">
          <Button onClick={handleContinue} size="lg">
            Fortsett med {selectedSubcategory.name}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export { LISTING_CATEGORIES }
