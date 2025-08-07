'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  Clock, 
  Users, 
  Search,
  Star,
  Smartphone,
  Eye,
  Bell,
  BarChart3,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: Zap,
    title: 'AI-Powered Prisestimering',
    description: 'Få øyeblikkelig og nøyaktig prisanslag på biler med vår avanserte AI-teknologi.',
    benefits: ['92% nøyaktighet', '15+ faktorer analysert', 'Markedstrend-analyse'],
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50',
    demo: {
      input: '2020 BMW X5',
      output: '465,000 kr',
      confidence: '92% sikkerhet'
    }
  },
  {
    icon: Clock,
    title: 'Live Auksjoner',
    description: 'Delta i spennende live auksjoner med real-time budgivning og øyeblikkelige oppdateringer.',
    benefits: ['Real-time oppdateringer', 'Automatiske varsler', 'Trygg betaling'],
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    demo: {
      input: 'Live auksjon',
      output: '3 aktive bud',
      confidence: 'Avslutter om 2t'
    }
  },
  {
    icon: Shield,
    title: 'Trygg Handel',
    description: 'Verifiserte brukere, sikre betalinger og omfattende beskyttelse for alle transaksjoner.',
    benefits: ['Verifiserte profiler', 'Sikker escrow', '24/7 support'],
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    demo: {
      input: 'Trygg handel',
      output: '99.8% rating',
      confidence: '8,432 transaksjoner'
    }
  },
  {
    icon: Search,
    title: 'Smart Søk',
    description: 'Avansert søkefunksjon med AI-powered anbefalinger og personlige forslag.',
    benefits: ['AI-anbefalinger', 'Lagrede søk', 'Instant varsler'],
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    demo: {
      input: 'BMW X5 Oslo',
      output: '127 resultater',
      confidence: '12 nye i dag'
    }
  },
  {
    icon: Smartphone,
    title: 'Mobil-Optimalisert',
    description: 'Perfekt brukeropplevelse på alle enheter med native app-følelse.',
    benefits: ['Responsive design', 'Offline funksjoner', 'Push varsler'],
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-50',
    demo: {
      input: 'Mobil app',
      output: '4.8★ rating',
      confidence: '50k+ nedlastinger'
    }
  },
  {
    icon: BarChart3,
    title: 'Markedsanalyse',
    description: 'Dyptgående markedsstatistikk og trender for informerte kjøps- og salgsbeslutninger.',
    benefits: ['Prishistorikk', 'Trend-analyse', 'Konkurranseinfo'],
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-50',
    demo: {
      input: 'Markedsdata',
      output: '+12% verdiøkning',
      confidence: 'Siste 6 måneder'
    }
  }
]

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#af4c0f]/10 text-[#af4c0f] hover:bg-[#af4c0f]/20">
            <Star className="h-3 w-3 mr-1" />
            Markedsledende teknologi
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Hvorfor velge
            <span className="text-[#af4c0f]"> Kulbruk.no?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Vi revolusjonerer online handel med cutting-edge teknologi, 
            AI-powered verktøy og en brukeropplevelse som setter nye standarder.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden">
              <CardContent className="p-0">
                
                {/* Feature Header */}
                <div className={`${feature.bgColor} p-6 relative overflow-hidden`}>
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                  
                  {/* Background decoration */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                </div>

                {/* Feature Demo */}
                <div className="p-6 bg-gray-50">
                  <div className="bg-white rounded-lg p-4 mb-4 border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Demo</p>
                        <p className="font-medium text-gray-900">{feature.demo.input}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#af4c0f]">{feature.demo.output}</p>
                        <p className="text-xs text-green-600">{feature.demo.confidence}</p>
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Interactive Demo Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 lg:p-12 text-white">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div>
              <Badge className="mb-4 bg-[#af4c0f] hover:bg-[#af4c0f]/90">
                <Zap className="h-3 w-3 mr-1" />
                Live demo
              </Badge>
              <h3 className="text-3xl lg:text-4xl font-bold mb-6">
                Se AI-teknologien
                <span className="text-yellow-400"> i aksjon</span>
              </h3>
              <p className="text-xl text-gray-300 mb-8">
                Opplev hvordan vår AI-powered prisestimering gir deg nøyaktige 
                verdivurderinger på sekunder, ikke dager.
              </p>
              
              {/* Live stats */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <div className="text-3xl font-bold text-yellow-400">92%</div>
                  <p className="text-gray-400">Presisjonsrate</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-400">2.3s</div>
                  <p className="text-gray-400">Gj.snitt responstid</p>
                </div>
              </div>

              <Button asChild size="lg" className="bg-[#af4c0f] hover:bg-[#af4c0f]/90">
                <Link href="/opprett">
                  <Eye className="h-5 w-5 mr-2" />
                  Test AI-estimering nå
                </Link>
              </Button>
            </div>

            {/* Right Content - Interactive Demo */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-6 text-gray-900">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#af4c0f] rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">AI Bilpris-estimering</h4>
                    <p className="text-sm text-gray-600">Powered by machine learning</p>
                  </div>
                </div>

                {/* Demo Input */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">
                    Registreringsnummer
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white rounded border px-3 py-2">
                      <span className="font-mono">AB 12345</span>
                    </div>
                    <Button size="sm" className="bg-[#af4c0f] hover:bg-[#af4c0f]/90">
                      Analyser
                    </Button>
                  </div>
                </div>

                {/* Demo Output */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-700">Estimert verdi:</span>
                    <span className="font-bold text-green-700">465,000 kr</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-700">Konfidensgrad:</span>
                    <span className="font-bold text-blue-700">92% sikkerhet</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm text-gray-700">Markedstrend:</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-yellow-600" />
                      <span className="font-bold text-yellow-700">Stabil</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
                AI
              </div>
              <div className="absolute -bottom-2 -left-2 bg-yellow-400 text-gray-900 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                ⚡
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Klar til å oppleve fremtiden innen online handel?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Bli med på Kulbruk.no og få tilgang til Norges mest avanserte 
            marketplace med AI-teknologi som gjør handel enklere, tryggere og mer lønnsomt.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-[#af4c0f] hover:bg-[#af4c0f]/90">
              <Link href="/opprett">
                <Zap className="h-5 w-5 mr-2" />
                Legg ut din første annonse
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/annonser">
                <Search className="h-5 w-5 mr-2" />
                Utforsk markedsplassen
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
