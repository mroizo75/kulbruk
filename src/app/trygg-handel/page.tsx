'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  CreditCard,
  Eye,
  Lock,
  MessageCircle,
  FileText,
  Phone,
  Car,
  Home,
  UserCheck,
  Flag,
  Star,
  Clock,
  Gavel,
  Banknote
} from 'lucide-react'
import Link from 'next/link'

export default function SafeTradingPage() {
  const safetyFeatures = [
    {
      icon: UserCheck,
      title: "Verifiserte brukere",
      description: "Alle brukere bekreftes via Clerk autentiseringsystem",
      details: "E-post og telefonnummer må bekreftes ved registrering"
    },
    {
      icon: Eye,
      title: "Modererte annonser",
      description: "Alle annonser gjennomgås før publisering",
      details: "Automatisk AI-screening + manuell kontroll av rapporterte annonser"
    },
    {
      icon: Star,
      title: "Vurderingssystem",
      description: "Brukere kan vurdere hverandre etter handel",
      details: "Bygg opp troverdighet gjennom positive vurderinger"
    },
    {
      icon: Flag,
      title: "Rapporteringssystem",
      description: "Enkel rapportering av mistenkelige aktiviteter",
      details: "24/7 overvåking og rask oppfølging av rapporter"
    },
    {
      icon: CreditCard,
      title: "Sikre betalinger",
      description: "Krypterte betalingsløsninger og escrow-tjenester",
      details: "Ingen kredittkortdata lagres på våre servere"
    },
    {
      icon: MessageCircle,
      title: "Trygg kommunikasjon",
      description: "All kommunikasjon logges for sikkerhet",
      details: "Beskyttelse mot svindel og misbruk"
    }
  ]

  const tradingTips = [
    {
      category: "Før kjøp",
      icon: Eye,
      tips: [
        "Les annonsen grundig og still spørsmål",
        "Be om ekstra bilder hvis nødvendig",
        "Sjekk selgers vurderinger og historikk",
        "Møt på offentlig sted eller hjemme hos selger",
        "Få skriftlig bekreftelse på avtale"
      ]
    },
    {
      category: "Under handel",
      icon: Gavel,
      tips: [
        "Inspiser produktet grundig før betaling",
        "Test at alt fungerer som beskrevet",
        "Ta bilder av produktet og kvittering",
        "Betal kun når du er fornøyd",
        "Få dokumentasjon på eierskap (særlig for biler)"
      ]
    },
    {
      category: "Etter handel",
      icon: Star,
      tips: [
        "Gi en ærlig vurdering av handelserfaringen",
        "Oppbevar dokumenter og kvitteringer",
        "Rapporter eventuelle problemer til oss",
        "Følg opp garantier eller reklamasjoner",
        "Del din erfaring med andre brukere"
      ]
    }
  ]

  const warningSignsData = [
    {
      icon: AlertTriangle,
      warning: "Priser som virker for gode til å være sanne",
      explanation: "Svært lave priser kan indikere svindel eller defekte produkter"
    },
    {
      icon: AlertTriangle,
      warning: "Krav om forskuddsbetaling",
      explanation: "Vær forsiktig med betalingsmetoder som ikke gir beskyttelse"
    },
    {
      icon: AlertTriangle,
      warning: "Vage produktbeskrivelser",
      explanation: "Mangel på detaljer eller kvalitetsbilder kan skjule problemer"
    },
    {
      icon: AlertTriangle,
      warning: "Utenlandske telefonnummer",
      explanation: "Svindlere bruker ofte utenlandske nummer for å unngå sporing"
    },
    {
      icon: AlertTriangle,
      warning: "Press om rask handel",
      explanation: "Seriøse selgere lar deg ta deg tid til vurdering"
    },
    {
      icon: AlertTriangle,
      warning: "Unnvikende svar på spørsmål",
      explanation: "Ærlige selgere svarer gjerne på alle relevante spørsmål"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#af4c0f]/10">
              <Shield className="h-6 w-6 text-[#af4c0f]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Trygg handel</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            På Kulbruk.no prioriterer vi sikkerhet og trygghet for alle våre brukere. 
            Her finner du informasjon om våre sikkerhetstiltak og tips for trygg handel.
          </p>
        </div>

        {/* Safety Stats */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center border-2 border-[#af4c0f]/20 bg-[#af4c0f]/5">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-[#af4c0f] mb-1">99.8%</div>
                <p className="text-sm text-gray-600">Vellykkede handler</p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 border-[#af4c0f]/20 bg-[#af4c0f]/5">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-[#af4c0f] mb-1">&lt;2min</div>
                <p className="text-sm text-gray-600">Responstid på rapporter</p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 border-[#af4c0f]/20 bg-[#af4c0f]/5">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-[#af4c0f] mb-1">24/7</div>
                <p className="text-sm text-gray-600">Overvåking</p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 border-[#af4c0f]/20 bg-[#af4c0f]/5">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-[#af4c0f] mb-1">100%</div>
                <p className="text-sm text-gray-600">Verifiserte brukere</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Safety Features */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Våre sikkerhetstiltak</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safetyFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-2 hover:border-[#af4c0f]/30">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#af4c0f]/10">
                      <feature.icon className="h-5 w-5 text-[#af4c0f]" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{feature.details}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Trading Tips */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Tips for trygg handel</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {tradingTips.map((section, index) => (
              <Card key={index} className="border-2 hover:border-[#af4c0f]/30 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <section.icon className="h-5 w-5 text-[#af4c0f]" />
                    {section.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-[#af4c0f] mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Warning Signs */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Advarselstegn å se opp for</h2>
          <div className="space-y-3">
            {warningSignsData.map((warning, index) => (
              <Card key={index} className="border-2 border-red-200 hover:border-red-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <warning.icon className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{warning.warning}</h4>
                      <p className="text-sm text-gray-600">{warning.explanation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Special Categories */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Spesielle sikkerhetstiltak</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Car Trading */}
            <Card className="border-2 hover:border-[#af4c0f]/30 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="h-5 w-5 text-[#af4c0f]" />
                  Bilhandel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#af4c0f] mt-0.5" />
                    <span className="text-sm text-gray-600">
                      Automatisk henting av data fra Statens Vegvesen
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#af4c0f] mt-0.5" />
                    <span className="text-sm text-gray-600">
                      AI-basert prisestimering for markedsverdi
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#af4c0f] mt-0.5" />
                    <span className="text-sm text-gray-600">
                      Verifikasjon av eierskap og lånestatus
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#af4c0f] mt-0.5" />
                    <span className="text-sm text-gray-600">
                      Maler for kjøpskontrakter og omregistrering
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real Estate */}
            <Card className="border-2 hover:border-[#af4c0f]/30 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home className="h-5 w-5 text-[#af4c0f]" />
                  Eiendomshandel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#af4c0f] mt-0.5" />
                    <span className="text-sm text-gray-600">
                      Krav om dokumentasjon av eierskap
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#af4c0f] mt-0.5" />
                    <span className="text-sm text-gray-600">
                      Anbefaling om bruk av megler for store transaksjoner
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#af4c0f] mt-0.5" />
                    <span className="text-sm text-gray-600">
                      Informasjon om juridiske krav og avgifter
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#af4c0f] mt-0.5" />
                    <span className="text-sm text-gray-600">
                      Kontakt med sertifiserte eiendomspartnere
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Report Issues */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-2 border-[#af4c0f]/20 bg-[#af4c0f]/5">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Flag className="h-5 w-5 text-[#af4c0f]" />
                Rapporter mistenkelig aktivitet
              </CardTitle>
              <CardDescription>
                Hjelp oss å holde Kulbruk.no trygt for alle brukere
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#af4c0f]/10 mx-auto mb-3">
                    <Flag className="h-6 w-6 text-[#af4c0f]" />
                  </div>
                  <h4 className="font-semibold mb-2">Rapporter annonse</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Mistenkelige eller falske annonser
                  </p>
                  <Button size="sm" className="bg-[#af4c0f] hover:bg-[#af4c0f]/90">
                    Rapporter
                  </Button>
                </div>

                <div className="text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#af4c0f]/10 mx-auto mb-3">
                    <Users className="h-6 w-6 text-[#af4c0f]" />
                  </div>
                  <h4 className="font-semibold mb-2">Rapporter bruker</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Upassende oppførsel eller svindel
                  </p>
                  <Button size="sm" className="bg-[#af4c0f] hover:bg-[#af4c0f]/90">
                    Rapporter
                  </Button>
                </div>

                <div className="text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#af4c0f]/10 mx-auto mb-3">
                    <Phone className="h-6 w-6 text-[#af4c0f]" />
                  </div>
                  <h4 className="font-semibold mb-2">Ring oss</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Akutte sikkerhetssaker
                  </p>
                  <Button size="sm" variant="outline" className="border-[#af4c0f] text-[#af4c0f]">
                    +47 XX XX XX XX
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legal Framework */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-2 hover:border-[#af4c0f]/30 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#af4c0f]" />
                Juridisk rammeverk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Lovgivning</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Forbrukerkjøpsloven</li>
                    <li>• Kjøpsloven</li>
                    <li>• Personopplysningsloven (GDPR)</li>
                    <li>• Markedsføringsloven</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Rettigheter</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 14 dagers returrett (forbrukerkjøp)</li>
                    <li>• Reklamasjonsrett ved mangler</li>
                    <li>• Krav på korrekt produktinformasjon</li>
                    <li>• Beskyttelse mot villedende markedsføring</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help and Support */}
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-2 border-[#af4c0f]/20 bg-[#af4c0f]/5">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Trenger du hjelp?</CardTitle>
              <CardDescription>
                Vårt supportteam er tilgjengelig for å hjelpe deg med sikkerhetsspørsmål
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-[#af4c0f] hover:bg-[#af4c0f]/90">
                  <Link href="/kontakt-oss">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Kontakt support
                  </Link>
                </Button>
                <Button variant="outline" asChild className="border-[#af4c0f] text-[#af4c0f] hover:bg-[#af4c0f]/10">
                  <Link href="/hjelp-og-stotte">
                    <FileText className="h-4 w-4 mr-2" />
                    Les FAQ
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
