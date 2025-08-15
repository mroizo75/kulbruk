import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Scale, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  CreditCard,
  Shield,
  Car,
  Home,
  Building2,
  Gavel,
  Mail,
  Clock
} from 'lucide-react'

export const metadata = {
  title: 'Vilkår og betingelser – Kulbruk',
  description: 'Vilkår for bruk av Kulbruk.no',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#af4c0f]/10">
              <FileText className="h-6 w-6 text-[#af4c0f]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Vilkår og betingelser</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Disse vilkårene regulerer din bruk av Kulbruk.no. Ved å bruke tjenesten samtykker du til disse betingelsene.
          </p>
          <div className="mt-4">
            <Badge className="bg-[#af4c0f] text-white">
              Gjeldende fra: {new Date().toLocaleDateString('nb-NO')}
            </Badge>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Quick Info */}
          <Card className="border-2 border-[#af4c0f]/20 bg-[#af4c0f]/5">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Scale className="h-5 w-5 text-[#af4c0f]" />
                Viktig informasjon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#af4c0f]" />
                  <span>Norsk lov gjelder</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#af4c0f]" />
                  <span>Gratis for privatpersoner</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#af4c0f]" />
                  <span>Ansvar ved misbruk</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#af4c0f]" />
                  <span>Modererte annonser</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* General Terms */}
          <Card className="border-2 hover:border-[#af4c0f]/30 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5 text-[#af4c0f]" />
                1. Generelle bestemmelser
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">1.1 Tjenestens formål</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Kulbruk.no er en digital markedsplass som forbinder kjøpere og selgere av brukte produkter, 
                  med spesialisering innen biler, eiendom og reiser. Vi tilbyr også AI-drevne verktøy for 
                  prisestimering og auksjonsløsninger for bedrifter.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">1.2 Brukertyper</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-[#af4c0f]" />
                      <span className="font-medium">Privatpersoner</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Gratis bruk av alle grunnleggende funksjoner inkludert annonser og AI-prisestimering.
                    </p>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-[#af4c0f]" />
                      <span className="font-medium">Bedrifter</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Tilgang til auksjoner, profit-kalkulatorer og avanserte business-verktøy.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">1.3 Aldersgrense</h4>
                <p className="text-gray-600 text-sm">
                  Du må være minst 18 år for å bruke Kulbruk.no. Mindreårige kan bruke tjenesten 
                  under foreldres eller foresattes tilsyn og ansvar.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card className="border-2 hover:border-[#af4c0f]/30 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#af4c0f]" />
                2. Brukeransvar og regler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">2.1 Forbudte aktiviteter</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    <span className="text-sm text-gray-600">Salg av ulovlige, stjålne eller falske produkter</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    <span className="text-sm text-gray-600">Falske eller villedende annonser</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    <span className="text-sm text-gray-600">Spam, trakassering eller misbruk av andre brukere</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    <span className="text-sm text-gray-600">Manipulering av auksjoner eller bud-systemer</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    <span className="text-sm text-gray-600">Bruk av automatiserte systemer uten tillatelse</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">2.2 Krav til annonser</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#af4c0f] mt-0.5" />
                    <span className="text-sm text-gray-600">Ærlige og nøyaktige beskrivelser</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#af4c0f] mt-0.5" />
                    <span className="text-sm text-gray-600">Egne bilder av produktet</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#af4c0f] mt-0.5" />
                    <span className="text-sm text-gray-600">Korrekt kategorisering</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#af4c0f] mt-0.5" />
                    <span className="text-sm text-gray-600">Respektfull kommunikasjon</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments and Fees */}
          <Card className="border-2 hover:border-[#af4c0f]/30 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#af4c0f]" />
                3. Betaling og gebyrer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">3.1 Gratis tjenester</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Privatpersoner kan gratis legge ut annonser, søke etter produkter, bruke AI-prisestimering 
                  og delta i kommunikasjon med andre brukere.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">3.2 Bedriftsabonnement</h4>
                <div className="p-4 border border-[#af4c0f]/20 rounded-lg bg-[#af4c0f]/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>PRO-funksjoner:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600">
                        <li>Tilgang til bil-auksjoner</li>
                        <li>AI profit-kalkulator</li>
                        <li>Avansert business dashboard</li>
                        <li>Prioritert support</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Priser:</strong>
                      <p className="text-gray-600 mt-1">
                        Månedlig eller årlig abonnement. Priser fremgår av registreringsscreenene 
                        og kan endres med 30 dagers varsel.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">3.3 Transaksjonsgebyrer</h4>
                <p className="text-gray-600 text-sm">
                  Vi krever ingen transaksjonsebyrer for salg mellom privatpersoner. For bedriftstransaksjoner 
                  kan det påløpe gebyrer som beskrives i bedriftsavtalen.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Platform Specific */}
          <Card className="border-2 hover:border-[#af4c0f]/30 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Car className="h-5 w-5 text-[#af4c0f]" />
                4. Spesielle bestemmelser
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Car className="h-4 w-4 text-[#af4c0f]" />
                  4.1 Bilsalg
                </h4>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 ml-4">
                  <li>Korrekte opplysninger fra Statens Vegvesen må oppgis</li>
                  <li>AI-prisestimering er kun veiledende, ikke bindende</li>
                  <li>Selger er ansvarlig for å oppgi kjente feil og mangler</li>
                  <li>Omregistrering følger Vegvesenets regler</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Home className="h-4 w-4 text-[#af4c0f]" />
                  4.2 Eiendomsannonser
                </h4>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 ml-4">
                  <li>Kun lovlige eiendomstransaksjoner tillatt</li>
                  <li>Selger må ha rett til å selge eiendommen</li>
                  <li>Alle avgifter og gebyrer er mellom kjøper og selger</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#af4c0f]" />
                  4.3 Bedriftsauksjoner
                </h4>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 ml-4">
                  <li>Kun verifiserte bedrifter kan delta i auksjoner</li>
                  <li>Bud er bindende når de er akseptert</li>
                  <li>Brudd på auksjonsregler kan føre til utestengelse</li>
                  <li>Separate avtaler gjelder for bedriftskunder</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Liability */}
          <Card className="border-2 hover:border-[#af4c0f]/30 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Gavel className="h-5 w-5 text-[#af4c0f]" />
                5. Ansvar og garanti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">5.1 Plattformansvar</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Kulbruk.no er en plattform som formidler kontakt mellom kjøpere og selgere. 
                  Vi er ikke part i transaksjonene og tar ikke ansvar for:
                </p>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 ml-4">
                  <li>Kvalitet, tilstand eller lovlighet av produkter</li>
                  <li>Selgers evne til å levere som avtalt</li>
                  <li>Kjøpers betalingsevne</li>
                  <li>Tvister mellom brukere</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">5.2 AI-tjenester</h4>
                <p className="text-gray-600 text-sm">
                  Våre AI-drevne funksjoner (som prisestimering) er verktøy som gir anslag basert på 
                  tilgjengelige data. Disse er ikke garanterte verdier og skal ikke erstatte profesjonell vurdering.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">5.3 Teknisk drift</h4>
                <p className="text-gray-600 text-sm">
                  Vi streber etter høy oppetid, men kan ikke garantere at tjenesten alltid er tilgjengelig. 
                  Planlagt vedlikehold varsles i god tid.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Changes and Termination */}
          <Card className="border-2 hover:border-[#af4c0f]/30 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#af4c0f]" />
                6. Endringer og oppsigelse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">6.1 Endringer i vilkår</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Vi kan oppdatere disse vilkårene ved behov. Vesentlige endringer vil bli kommunisert 
                  minst 30 dager i forveien via e-post eller varsel på plattformen.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">6.2 Oppsigelse av konto</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong className="text-sm">Fra din side:</strong>
                    <p className="text-gray-600 text-sm mt-1">
                      Du kan når som helst slette din konto gjennom kontoinnstillinger eller ved å kontakte oss.
                    </p>
                  </div>
                  <div>
                    <strong className="text-sm">Fra vår side:</strong>
                    <p className="text-gray-600 text-sm mt-1">
                      Vi kan suspendere eller avslutte kontoer som bryter våre retningslinjer.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal */}
          <Card className="border-2 hover:border-[#af4c0f]/30 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Scale className="h-5 w-5 text-[#af4c0f]" />
                7. Lovvalg og verneting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">7.1 Gjeldende lov</h4>
                <p className="text-gray-600 text-sm">
                  Disse vilkårene er underlagt norsk lov. Eventuelle tvister løses i henhold til norsk lovgivning.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">7.2 Verneting</h4>
                <p className="text-gray-600 text-sm">
                  Buskerud tingrett er verneting for tvister som ikke kan løses i minnelighet.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">7.3 Forbrukerrettigheter</h4>
                <p className="text-gray-600 text-sm">
                  Disse vilkårene begrenser ikke dine rettigheter som forbruker etter gjeldende norsk lov.
                </p>
              </div>
              <div>
                <h4 className="text-gray-900 font-semibold mb-2">7.4 Cookies og preferanser</h4>
                <p className="text-gray-600 text-sm">
                  For informasjon om cookies og for å endre dine preferanser, se vår dedikerte side <a className="text-blue-600 underline" href="/cookies">/cookies</a>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-2 border-[#af4c0f]/20 bg-[#af4c0f]/5">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#af4c0f]" />
                Spørsmål om vilkårene?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Kontaktinformasjon:</h4>
                  <p className="text-gray-600 text-sm mb-1">E-post: juridisk@kulbruk.no</p>
                  <p className="text-gray-600 text-sm mb-1">Telefon: +47 XX XX XX XX</p>
                  <p className="text-gray-600 text-sm">Svar innen 5 virkedager</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Postadresse:</h4>
                  <p className="text-gray-600 text-sm">
                    Kulbruk AS<br />
                    Juridisk avdeling<br />
                    Buskerud, Norge
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
