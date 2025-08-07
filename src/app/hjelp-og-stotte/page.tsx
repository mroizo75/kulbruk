'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText, 
  Shield, 
  Car, 
  Home, 
  Plane,
  Search,
  CreditCard,
  Users,
  Settings,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

export default function HelpAndSupportPage() {
  const helpCategories = [
    {
      icon: Car,
      title: "Bil-annonser",
      description: "Spørsmål om bilsalg og -kjøp",
      topics: [
        "Hvordan legge ut bil-annonse",
        "AI-prisestimering for biler",
        "Vegvesen-data og bilhistorikk",
        "Auksjoner for bedrifter"
      ]
    },
    {
      icon: Home,
      title: "Eiendom",
      description: "Hjelp med eiendomsannonser",
      topics: [
        "Legge ut eiendom",
        "Bildeopplasting",
        "Kontakt med interessenter",
        "Prisforslag"
      ]
    },
    {
      icon: Plane,
      title: "Reiser",
      description: "Booking og reisesøk",
      topics: [
        "Flysøk og sammenligning",
        "Booking av billetter",
        "Hotellsøk",
        "Reiseforsikring"
      ]
    },
    {
      icon: CreditCard,
      title: "Betaling",
      description: "Betalingsløsninger og fakturering",
      topics: [
        "Sikre betalinger",
        "Refundering",
        "Fakturaer",
        "Bedrift-abonnement"
      ]
    },
    {
      icon: Users,
      title: "Brukerkontoer",
      description: "Kontoinnstillinger og roller",
      topics: [
        "Registrering og innlogging",
        "Rolle som privat/bedrift",
        "Profilinnstillinger",
        "Slette konto"
      ]
    },
    {
      icon: Settings,
      title: "Teknisk støtte",
      description: "Tekniske problemer og feil",
      topics: [
        "Nettside fungerer ikke",
        "Mobilapp problemer",
        "Bildeopplasting feiler",
        "Søk fungerer ikke"
      ]
    }
  ]

  const quickActions = [
    {
      icon: MessageCircle,
      title: "Chat med oss",
      description: "Få hjelp i sanntid",
      action: "Start chat",
      available: "Mandag-Fredag 8-16"
    },
    {
      icon: Phone,
      title: "Ring oss",
      description: "+47 XX XX XX XX",
      action: "Ring nå",
      available: "Mandag-Fredag 9-15"
    },
    {
      icon: Mail,
      title: "Send e-post",
      description: "hjelp@kulbruk.no",
      action: "Send e-post",
      available: "Svar innen 24 timer"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#af4c0f]/10">
              <HelpCircle className="h-6 w-6 text-[#af4c0f]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Hjelp og støtte</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vi er her for å hjelpe deg! Finn svar på vanlige spørsmål eller ta kontakt med vårt supportteam.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Få hjelp nå</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow border-2 hover:border-[#af4c0f]/30">
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#af4c0f]/10">
                    <action.icon className="h-6 w-6 text-[#af4c0f]" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-[#af4c0f] hover:bg-[#af4c0f]/90 text-white mb-2">
                    {action.action}
                  </Button>
                  <p className="text-xs text-gray-500">{action.available}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Help Categories */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Hjelpeemner</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-2 hover:border-[#af4c0f]/30">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#af4c0f]/10">
                      <category.icon className="h-5 w-5 text-[#af4c0f]" />
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.topics.map((topic, topicIndex) => (
                      <li key={topicIndex}>
                        <Link 
                          href="#" 
                          className="text-sm text-gray-600 hover:text-[#af4c0f] transition-colors flex items-center gap-2"
                        >
                          <Search className="h-3 w-3" />
                          {topic}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Ofte stilte spørsmål</h2>
          <div className="space-y-4">
            <Card className="border-2 hover:border-[#af4c0f]/30 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-[#af4c0f]" />
                  Hvordan fungerer AI-prisestimeringen?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Vår AI-prisestimering bruker OpenAI GPT-4 og sammenligner med markedsdata, Vegvesen-registeret 
                  og historiske salgspriser for å gi deg en realistisk prisestimering på din bil.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#af4c0f]/30 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-[#af4c0f]" />
                  Er det gratis å legge ut annonser?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Ja! For privatpersoner er det helt gratis å legge ut annonser. Bedrifter har tilgang til 
                  avanserte verktøy som auksjoner og profit-kalkulatorer gjennom vårt PRO-abonnement.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#af4c0f]/30 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-[#af4c0f]" />
                  Hvordan sikrer dere trygg handel?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Vi bruker verifiserte brukerkontoer, sikre betalingsløsninger og har moderering av alle annonser. 
                  Les mer på vår <Link href="/trygg-handel" className="text-[#af4c0f] hover:underline">trygg handel side</Link>.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact info */}
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-2 border-[#af4c0f]/20 bg-[#af4c0f]/5">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Fant du ikke svar?</CardTitle>
              <CardDescription>
                Vårt supportteam er klare til å hjelpe deg med alle spørsmål om Kulbruk.no
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-[#af4c0f] hover:bg-[#af4c0f]/90">
                  <Link href="/kontakt-oss">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Kontakt oss
                  </Link>
                </Button>
                <Button variant="outline" asChild className="border-[#af4c0f] text-[#af4c0f] hover:bg-[#af4c0f]/10">
                  <Link href="mailto:hjelp@kulbruk.no">
                    <Mail className="h-4 w-4 mr-2" />
                    Send e-post
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
