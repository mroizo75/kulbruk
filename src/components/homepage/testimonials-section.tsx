'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, Quote, CheckCircle, TrendingUp, Users, ShoppingBag, Zap } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const testimonials = [
  {
    name: 'Lars Andersen',
    role: 'Bilentusiast',
    location: 'Oslo',
    rating: 5,
    text: 'Solgte min BMW på Kulbruk.no og fikk 25,000 kr mer enn forventet! AI-prisestimeringen var spot on, og hele prosessen var smidig fra start til slutt.',
    avatar: '👨‍💼',
    verified: true,
    category: 'Bil',
    amount: '465,000 kr'
  },
  {
    name: 'Maria Johansen',
    role: 'Eiendomsmegler',
    location: 'Bergen',
    rating: 5,
    text: 'Som megler bruker jeg Kulbruk.no til å finne investeringsmuligheter. Markedsanalysen og AI-verktøyene gir meg konkurransefortrinn.',
    avatar: '👩‍💼',
    verified: true,
    category: 'Eiendom',
    amount: '2.8M kr'
  },
  {
    name: 'Erik Svendsen',
    role: 'Bedriftseier',
    location: 'Trondheim',
    rating: 5,
    text: 'Live auksjonene er fantastiske! Kjøpte 3 firmabiler til lavere priser enn forventet. Real-time oppdateringene gjør det enkelt å følge med.',
    avatar: '👨‍💻',
    verified: true,
    category: 'Business',
    amount: '890,000 kr'
  },
  {
    name: 'Anna Nielsen',
    role: 'Privatperson',
    location: 'Stavanger',
    rating: 5,
    text: 'Fant den perfekte leiligheten på Kulbruk.no! Søkefunksjonene er så smarte, og jeg fikk varsler med en gang noe passende kom på markedet.',
    avatar: '👩‍🎓',
    verified: true,
    category: 'Eiendom',
    amount: '3.2M kr'
  },
  {
    name: 'Thomas Berg',
    role: 'Bilhandler',
    location: 'Kristiansand',
    rating: 5,
    text: 'Som bilhandler har Kulbruk.no revolusjonert hvordan jeg opererer. AI-prisene hjelper meg å gjøre smarte innkjøp og optimalisere marginer.',
    avatar: '👨‍🔧',
    verified: true,
    category: 'Business',
    amount: '1.2M kr'
  },
  {
    name: 'Sofie Hansen',
    role: 'Student',
    location: 'Tromsø',
    rating: 5,
    text: 'Kjøpte min første bil gjennom Kulbruk.no. Trygg handel-systemet ga meg trygghet, og jeg visste jeg fikk en rettferdig pris takket være AI-estimering.',
    avatar: '👩‍🎓',
    verified: true,
    category: 'Bil',
    amount: '185,000 kr'
  }
]

export default function TestimonialsSection() {
  const [liveStats, setLiveStats] = useState({
    totalUsers: '127,000+',
    dailyVolume: '2.4M kr',
    customerSatisfaction: '98.7%',
    aiPrecision: '92%'
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const response = await fetch('/api/stats/homepage')
        if (response.ok) {
          const data = await response.json()
          setLiveStats({
            totalUsers: data.totalUsers,
            dailyVolume: data.dailyVolume,
            customerSatisfaction: data.customerSatisfaction,
            aiPrecision: data.aiPrecision
          })
        }
      } catch (error) {
        console.error('Feil ved henting av testimonial stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLiveStats()
    // Oppdater stats hver 60 sekund
    const interval = setInterval(fetchLiveStats, 60000)
    return () => clearInterval(interval)
  }, [])

  const stats = [
    {
      icon: Users,
      value: liveStats.totalUsers,
      label: 'Aktive brukere',
      description: 'Voksende fellesskap',
      color: 'text-blue-600'
    },
    {
      icon: ShoppingBag,
      value: liveStats.dailyVolume,
      label: 'Handelsvolum/dag',
      description: 'Gjennomsnittlig daglig volum',
      color: 'text-green-600'
    },
    {
      icon: TrendingUp,
      value: liveStats.customerSatisfaction,
      label: 'Kundetilfredshet',
      description: 'Basert på ekte brukeranmeldelser',
      color: 'text-purple-600'
    },
    {
      icon: Zap,
      value: liveStats.aiPrecision,
      label: 'AI-presisjon',
      description: 'Prisestimering nøyaktighet',
      color: 'text-orange-600'
    }
  ]
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Stats Section */}
        <div className="text-center mb-20">
          <Badge className="mb-4 bg-[#af4c0f]/10 text-[#af4c0f] hover:bg-[#af4c0f]/20">
            <TrendingUp className="h-3 w-3 mr-1" />
            Live statistikk
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Tallene som
            <span className="text-[#af4c0f]"> beviser kvaliteten</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Kulbruk.no vokser raskt og setter nye standarder for online handel i Norge. 
            Se hva som gjør oss til landets mest populære markedsplass.
          </p>

          {/* Live Stats Grid */}
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center`}>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className={`text-3xl lg:text-4xl font-bold mb-2 ${stat.color} ${isLoading ? 'animate-pulse' : ''}`}>
                    {stat.value}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{stat.label}</h3>
                  <p className="text-sm text-gray-600">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>SSL-sikret</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>GDPR-kompatibel</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Norsk kundeservice</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="text-center mb-16">
          <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Hva våre brukere
            <span className="text-[#af4c0f]"> sier om oss</span>
          </h3>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Over 15,000 fornøyde kunder har allerede opplevd fremtidens markedsplass. 
            Her er noen av deres historier.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                
                {/* Quote Icon */}
                <div className="flex justify-between items-start mb-4">
                  <Quote className="h-8 w-8 text-[#af4c0f]/30" />
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Transaction Info */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {testimonial.category}
                    </Badge>
                    <span className="font-bold text-[#af4c0f]">{testimonial.amount}</span>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      {testimonial.verified && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{testimonial.role} • {testimonial.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Social Proof Section */}
        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div>
              <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-200">
                <Star className="h-3 w-3 mr-1" />
                4.9/5 stjerner
              </Badge>
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Bli med i Norges
                <span className="text-[#af4c0f]"> raskest voksende</span>
                <br />markedsplass
              </h3>
              <p className="text-xl text-gray-600 mb-8">
                Over 127,000 nordmenn stoler allerede på Kulbruk.no for sine kjøp og salg. 
                Opplev selv hvorfor vi er den foretrukne plattformen for smart handel.
              </p>

              {/* Quick Benefits */}
              <div className="space-y-3 mb-8">
                {[
                  'Gratis å legge ut annonser',
                  'AI-powered prisestimering',
                  'Trygg handel garantert',
                  'Live auksjoner og budgivning',
                  'Norge-fokusert service'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-[#af4c0f] hover:bg-[#af4c0f]/90">
                  <Link href="/opprett">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Start din første annonse
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/annonser">
                    Se alle annonser
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Content - Visual */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {/* Top Row */}
                <div className="bg-gradient-to-br from-[#af4c0f] to-yellow-500 rounded-2xl p-6 text-white transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <Users className="h-8 w-8 mb-3" />
                  <div className={`text-2xl font-bold ${isLoading ? 'animate-pulse' : ''}`}>{liveStats.totalUsers}</div>
                  <div className="text-sm opacity-90">Aktive brukere</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                  <Star className="h-8 w-8 mb-3" />
                  <div className="text-2xl font-bold">4.9★</div>
                  <div className="text-sm opacity-90">Brukerrating</div>
                </div>

                {/* Bottom Row */}
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <ShoppingBag className="h-8 w-8 mb-3" />
                  <div className={`text-2xl font-bold ${isLoading ? 'animate-pulse' : ''}`}>{liveStats.dailyVolume.replace(' kr', '')}</div>
                  <div className="text-sm opacity-90">kr/dag volum</div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <Zap className="h-8 w-8 mb-3" />
                  <div className={`text-2xl font-bold ${isLoading ? 'animate-pulse' : ''}`}>{liveStats.aiPrecision}</div>
                  <div className="text-sm opacity-90">AI-presisjon</div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900 rounded-full px-4 py-2 text-sm font-bold shadow-lg animate-bounce">
                🚀 #1 i Norge
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
