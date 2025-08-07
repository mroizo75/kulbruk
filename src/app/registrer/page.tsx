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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Registrer deg på Kulbruk</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Velg kontotype som passer best for deg og kom i gang med trygg handel
          </p>
        </div>

        {/* Type selection */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Privatkunde */}
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
              selectedType === 'customer' ? 'ring-2 ring-[#af4c0f] shadow-lg border-[#af4c0f]' : 'border-gray-200 hover:border-[#af4c0f]/30'
            }`}
            onClick={() => setSelectedType('customer')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#af4c0f]/10">
                <User className="h-8 w-8 text-[#af4c0f]" />
              </div>
              <CardTitle className="text-xl text-gray-900">Privatkunde</CardTitle>
              <CardDescription>
                Jeg vil selge eller kjøpe brukte produkter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-[#af4c0f]" />
                  <span>Legg ut annonser gratis</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-[#af4c0f]" />
                  <span>Kjøp og selg trygt</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-[#af4c0f]" />
                  <span>Få tilbud fra bedrifter på biler</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-[#af4c0f]" />
                  <span>Favorittsystem og AI-verktøy</span>
                </div>
              </div>
              
              <Button 
                onClick={() => handleSelection('customer')}
                className="w-full bg-[#af4c0f] hover:bg-[#af4c0f]/90 text-white"
              >
                Registrer som privatkunde
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Bedrift */}
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
              selectedType === 'business' ? 'ring-2 ring-[#af4c0f] shadow-lg border-[#af4c0f]' : 'border-gray-200 hover:border-[#af4c0f]/30'
            }`}
            onClick={() => setSelectedType('business')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#af4c0f]/20 to-yellow-100">
                <Building2 className="h-8 w-8 text-[#af4c0f]" />
              </div>
              <CardTitle className="text-xl flex items-center justify-center gap-2 text-gray-900">
                Bedrift 
                <Badge className="text-xs bg-[#af4c0f] text-white">PRO</Badge>
              </CardTitle>
              <CardDescription>
                Jeg representerer en bedrift som vil handle biler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-[#af4c0f]" />
                  <span>Tilgang til bil-auksjoner</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-[#af4c0f]" />
                  <span>AI profit-kalkulator og verktøy</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-[#af4c0f]" />
                  <span>Profesjonell bud-system</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-[#af4c0f]" />
                  <span>Avansert business dashboard</span>
                </div>
              </div>
              
              <Button 
                onClick={() => handleSelection('business')}
                className="w-full bg-gradient-to-r from-[#af4c0f] to-[#af4c0f]/90 hover:from-[#af4c0f]/90 hover:to-[#af4c0f]/80 text-white"
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
            <p className="text-gray-600 mt-2">Trygg handel med innovative AI-verktøy</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#af4c0f]/10">
                <CheckCircle className="h-6 w-6 text-[#af4c0f]" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">Trygg handel</h3>
              <p className="text-sm text-gray-600">Verifiserte brukere og sikre betalingsløsninger</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#af4c0f]/10">
                <Building2 className="h-6 w-6 text-[#af4c0f]" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">For bedrifter</h3>
              <p className="text-sm text-gray-600">AI-drevne verktøy for profesjonell bilhandel</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#af4c0f]/10">
                <User className="h-6 w-6 text-[#af4c0f]" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">For privatpersoner</h3>
              <p className="text-sm text-gray-600">AI-prisestimering og enkelt å få best pris</p>
            </div>
          </div>
        </div>

        {/* Login link */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Har du allerede en konto?{' '}
            <Link href="/sign-in" className="font-medium text-[#af4c0f] hover:text-[#af4c0f]/80 transition-colors">
              Logg inn her
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
