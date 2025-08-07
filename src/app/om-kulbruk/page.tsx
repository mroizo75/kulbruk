import Link from 'next/link'
import { 
  CheckCircle, 
  Zap, 
  Shield, 
  Users, 
  TrendingUp, 
  Clock, 
  Car, 
  Home, 
  ShoppingBag,
  ArrowRight,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#af4c0f] to-[#d4621a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Om Kulbruk.no
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto">
              Norges mest innovative markedsplass med AI-teknologi, 
              live auksjoner og trygg handel for alle kategorier.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Vår misjon
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Kulbruk.no ble grunnlagt med en enkel visjon: å lage Norges beste 
                markedsplass som kombinerer moderne teknologi med trygg handel.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Vi bruker kunstig intelligens for å gjøre kjøp og salg enklere, 
                raskere og mer transparent enn noen gang før.
              </p>
              <Button asChild className="bg-[#af4c0f] hover:bg-[#af4c0f]/90">
                <Link href="/opprett">
                  Kom i gang
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card className="text-center p-6">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-[#af4c0f] rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">8,000+</h3>
                  <p className="text-gray-600">Fornøyde brukere</p>
                </CardContent>
              </Card>
              <Card className="text-center p-6">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">12,000+</h3>
                  <p className="text-gray-600">Aktive annonser</p>
                </CardContent>
              </Card>
              <Card className="text-center p-6">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">24/7</h3>
                  <p className="text-gray-600">Tilgjengelig</p>
                </CardContent>
              </Card>
              <Card className="text-center p-6">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">4.8/5</h3>
                  <p className="text-gray-600">Bruker-rating</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Hva gjør oss unike?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Vi kombinerer avansert teknologi med brukeropplevelse for å skape 
              den beste markedsplassen i Norge.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Pricing */}
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#af4c0f] to-[#d4621a] rounded-full flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Prisestimering</h3>
                <p className="text-gray-600 mb-4">
                  Få øyeblikkelig og nøyaktig prisanslag på biler basert på markedsdata,
                  kilometerstand og tekniske spesifikasjoner.
                </p>
                <Badge className="bg-[#af4c0f]/10 text-[#af4c0f]">Kun for biler</Badge>
              </CardContent>
            </Card>

            {/* Live Auctions */}
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Live Auksjoner</h3>
                <p className="text-gray-600 mb-4">
                  Sanntids budgivning med automatiske oppdateringer. 
                  Perfekt for bedrifter som vil kjøpe inn varer til videresalg.
                </p>
                <Badge className="bg-blue-500/10 text-blue-600">For bedrifter</Badge>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Trygg Handel</h3>
                <p className="text-gray-600 mb-4">
                  Verifiserte brukere, sikre betalinger og rapporteringssystem 
                  som sørger for trygg handel for alle parter.
                </p>
                <Badge className="bg-green-500/10 text-green-600">100% Sikkert</Badge>
              </CardContent>
            </Card>

            {/* Vehicle Integration */}
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                  <Car className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Vegvesen-integrasjon</h3>
                <p className="text-gray-600 mb-4">
                  Automatisk utfylling av kjøretøydata direkte fra Statens Vegvesen. 
                  Ingen mer manuell inntasting av tekniske spesifikasjoner.
                </p>
                <Badge className="bg-purple-500/10 text-purple-600">Automatisk</Badge>
              </CardContent>
            </Card>

            {/* Smart Search */}
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Intelligent Søk</h3>
                <p className="text-gray-600 mb-4">
                  Avanserte filtere tilpasset norske forhold med fylker, byer, 
                  og kategori-spesifikke søkekriterier.
                </p>
                <Badge className="bg-yellow-500/10 text-yellow-600">Norge-tilpasset</Badge>
              </CardContent>
            </Card>

            {/* Real-time */}
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-6">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Sanntids Oppdateringer</h3>
                <p className="text-gray-600 mb-4">
                  Live varsler for nye annonser, budoppdateringer og 
                  admin-meldinger uten å måtte oppdatere siden.
                </p>
                <Badge className="bg-red-500/10 text-red-600">Live</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Våre kategorier
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tre hovedkategorier med spesialtilpassede funksjoner for optimal brukeropplevelse.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Car className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Biler</h3>
                <p className="text-gray-600 mb-6">
                  Komplett løsning for bilsalg med AI-prisestimering, 
                  Vegvesen-data og avanserte søkefiltre.
                </p>
                <Button asChild className="bg-blue-500 hover:bg-blue-600">
                  <Link href="/annonser/bil">
                    Utforsk biler
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Home className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Eiendom</h3>
                <p className="text-gray-600 mb-6">
                  Leiligheter, hus, hytter og tomter med områdespesifikke 
                  filtre og visningsbestilling.
                </p>
                <Button asChild className="bg-green-500 hover:bg-green-600">
                  <Link href="/annonser/eiendom">
                    Utforsk eiendom
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <ShoppingBag className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Torget</h3>
                <p className="text-gray-600 mb-6">
                  Alt annet - fra møbler og elektronikk til klær og hobbyartikler. 
                  Rask salg og lokale oppgjør.
                </p>
                <Button asChild className="bg-purple-500 hover:bg-purple-600">
                  <Link href="/annonser/torget">
                    Utforsk torget
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#af4c0f] to-[#d4621a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Klar for å komme i gang?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Bli med på Norges mest innovative markedsplass. 
            Registrer deg i dag og opplev fremtiden for handel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-[#af4c0f] hover:bg-gray-100">
              <Link href="/opprett">
                Legg ut annonse
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/annonser">
                Se alle annonser
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
