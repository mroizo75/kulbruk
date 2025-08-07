'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, User, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<'customer' | 'business' | null>(null)

  const handleSelection = (type: 'customer' | 'business') => {
    if (type === 'customer') {
      router.push('/sign-up?role=customer')
    } else {
      router.push('/sign-up?role=business')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl mr-3">
              K
            </div>
            <span className="text-2xl font-bold text-gray-900">Kulbruk.no</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Velkommen til Kulbruk</h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Velg kontotype som passer best for deg
          </p>
        </div>

        {/* Type selection */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Privatkunde */}
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedType === 'customer' ? 'ring-2 ring-blue-500 shadow-lg' : ''
            }`}
            onClick={() => setSelectedType('customer')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Privatkunde</CardTitle>
              <CardDescription>
                Jeg vil selge eller kjøpe brukte produkter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Legg ut annonser gratis</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Kjøp og selg trygt</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Få tilbud fra bedrifter på biler</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Favorittsystem</span>
                </div>
              </div>
              
              <Button 
                onClick={() => handleSelection('customer')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Registrer som privatkunde
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Bedrift */}
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedType === 'business' ? 'ring-2 ring-blue-500 shadow-lg' : ''
            }`}
            onClick={() => setSelectedType('business')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                Bedrift 
                <Badge variant="outline" className="text-xs">PRO</Badge>
              </CardTitle>
              <CardDescription>
                Jeg representerer en bedrift som vil handle biler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Tilgang til bil-auksjoner</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Profit-kalkulator og verktøy</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Profesjonell bud-system</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Business dashboard</span>
                </div>
              </div>
              
              <Button 
                onClick={() => handleSelection('business')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Registrer bedrift
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Benefits section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Hvorfor velge Kulbruk?</h2>
            <p className="text-gray-600 mt-2">Trygg handel med innovative verktøy</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Trygg handel</h3>
              <p className="text-sm text-gray-600">Verifiserte brukere og sikre betalingsløsninger</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">For bedrifter</h3>
              <p className="text-sm text-gray-600">Avanserte verktøy for profesjonell bilhandel</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">For privatpersoner</h3>
              <p className="text-sm text-gray-600">Enkelt å legge ut og få best pris for dine ting</p>
            </div>
          </div>
        </div>

        {/* Login link */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Har du allerede en konto?{' '}
            <Link href="/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
              Logg inn her
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
