'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Eye, 
  Lock, 
  Database, 
  Users, 
  FileText,
  CheckCircle,
  AlertTriangle,
  Mail,
  Cookie,
  Globe,
  Settings
} from 'lucide-react'

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Personvernerklæring</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Vi tar ditt personvern på alvor. Denne erklæringen forklarer hvordan vi samler inn, 
            bruker og beskytter dine personopplysninger på Kulbruk.no.
          </p>
          <div className="mt-4">
            <Badge className="bg-[#af4c0f] text-white">
              Sist oppdatert: {new Date().toLocaleDateString('nb-NO')}
            </Badge>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Quick Overview */}
          <Card className="border-2 border-[#af4c0f]/20 bg-[#af4c0f]/5">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#af4c0f]" />
                Kort oversikt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#af4c0f]" />
                  <span>GDPR-kompatibel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#af4c0f]" />
                  <span>Krypterte data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#af4c0f]" />
                  <span>Ingen deling med tredjeparter</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-[#af4c0f]" />
                  <span>Du har full kontroll</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card className="border-2 hover:border-[#af4c0f]/30 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Database className="h-5 w-5 text-[#af4c0f]" />
                Hvilke opplysninger samler vi inn?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Kontoopplysninger:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Navn, e-postadresse og telefonnummer</li>
                  <li>Profilbilde (valgfritt)</li>
                  <li>Kontotype (privat eller bedrift)</li>
                  <li>Autentiseringsopplysninger via Clerk</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Annonsedata:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Produktinformasjon og bilder du laster opp</li>
                  <li>Bildata fra Statens Vegvesen (ved bilsalg)</li>
                  <li>AI-genererte prisestimeringer</li>
                  <li>Meldinger mellom kjøper og selger</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Teknisk informasjon:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>IP-adresse og nettleserinformasjon</li>
                  <li>Søkehistorikk og brukeradferd</li>
                  <li>Cookies og lokal lagring</li>
                  <li>Feilrapporter og ytelsesdata</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card className="border-2 hover:border-[#af4c0f]/30 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#af4c0f]" />
                Hvordan bruker vi opplysningene?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#af4c0f]" />
                    Tjenestens drift:
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 ml-4">
                    <li>Opprette og administrere din konto</li>
                    <li>Vise annonser og søkeresultater</li>
                    <li>Behandle betalinger og transaksjoner</li>
                    <li>Kundestøtte og teknisk support</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#af4c0f]" />
                    Forbedringer:
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 ml-4">
                    <li>AI-baserte anbefalinger</li>
                    <li>Personaliserte søkeresultater</li>
                    <li>Analyser og statistikk</li>
                    <li>Produktutvikling og testing</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card className="border-2 hover:border-[#af4c0f]/30 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Lock className="h-5 w-5 text-[#af4c0f]" />
                Hvordan beskytter vi dine data?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-[#af4c0f] mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Kryptering</h4>
                      <p className="text-sm text-gray-600">
                        Alle data krypteres i transit og hvilke med TLS/SSL
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Database className="h-5 w-5 text-[#af4c0f] mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Sikker lagring</h4>
                      <p className="text-sm text-gray-600">
                        Database med tilgangskontroll og regelmessige sikkerhetskopier
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-[#af4c0f] mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Begrenset tilgang</h4>
                      <p className="text-sm text-gray-600">
                        Kun autorisert personell har tilgang til persondata
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-[#af4c0f] mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Norske servere</h4>
                      <p className="text-sm text-gray-600">
                        Data lagres innenfor EU/EØS-området
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card className="border-2 hover:border-[#af4c0f]/30 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Cookie className="h-5 w-5 text-[#af4c0f]" />
                Cookies og sporing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-[#af4c0f]/20 rounded-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#af4c0f]/10 mx-auto mb-2">
                    <CheckCircle className="h-4 w-4 text-[#af4c0f]" />
                  </div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">Nødvendige</h4>
                  <p className="text-xs text-gray-600">Pålogging og grunnleggende funksjonalitet</p>
                </div>

                <div className="text-center p-4 border border-[#af4c0f]/20 rounded-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#af4c0f]/10 mx-auto mb-2">
                    <Settings className="h-4 w-4 text-[#af4c0f]" />
                  </div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">Funksjons</h4>
                  <p className="text-xs text-gray-600">Søkepreferanser og brukerinnstillinger</p>
                </div>

                <div className="text-center p-4 border border-[#af4c0f]/20 rounded-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#af4c0f]/10 mx-auto mb-2">
                    <Eye className="h-4 w-4 text-[#af4c0f]" />
                  </div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">Analytiske</h4>
                  <p className="text-xs text-gray-600">Anonymiserte data for forbedringer</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card className="border-2 hover:border-[#af4c0f]/30 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5 text-[#af4c0f]" />
                Dine rettigheter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#af4c0f] mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Tilgang til data</h4>
                      <p className="text-sm text-gray-600">
                        Be om en kopi av alle data vi har om deg
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#af4c0f] mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Retting av data</h4>
                      <p className="text-sm text-gray-600">
                        Oppdater eller korriger unøyaktige opplysninger
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#af4c0f] mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Sletting av data</h4>
                      <p className="text-sm text-gray-600">
                        Be om at dine personopplysninger slettes
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#af4c0f] mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Portabilitet</h4>
                      <p className="text-sm text-gray-600">
                        Få dine data i maskinlesbart format
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#af4c0f] mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Begrensning</h4>
                      <p className="text-sm text-gray-600">
                        Begrens hvordan vi behandler dine data
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#af4c0f] mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Motsette seg</h4>
                      <p className="text-sm text-gray-600">
                        Motsett deg automatisert behandling
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-2 border-[#af4c0f]/20 bg-[#af4c0f]/5">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#af4c0f]" />
                Kontakt oss angående personvern
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Personvernansvarlig:</h4>
                  <p className="text-gray-600 text-sm mb-1">E-post: personvern@kulbruk.no</p>
                  <p className="text-gray-600 text-sm">Telefon: +47 XX XX XX XX</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Postadresse:</h4>
                  <p className="text-gray-600 text-sm">
                    Kulbruk AS<br />
                    Buskerud, Norge
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    Hvis du ikke er fornøyd med vårt svar, kan du klage til Datatilsynet.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card className="border-2 hover:border-[#af4c0f]/30 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#af4c0f]" />
                Endringer i personvernerklæringen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Vi kan oppdatere denne personvernerklæringen fra tid til annen. Vesentlige endringer 
                vil bli kommunisert til deg via e-post eller gjennom varsler på nettsiden.
              </p>
              <p className="text-sm text-gray-500">
                Ved å fortsette å bruke Kulbruk.no etter endringer er publisert, samtykker du til den oppdaterte erklæringen.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
