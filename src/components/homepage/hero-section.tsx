'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ArrowRight, Star, Users, ShoppingBag, Zap } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [liveStats, setLiveStats] = useState({
    activeListings: '15k+',
    totalUsers: '8k+',
    soldToday: '2.4k+'
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const response = await fetch('/api/stats/homepage')
        if (response.ok) {
          const data = await response.json()
          setLiveStats({
            activeListings: data.activeListings,
            totalUsers: data.totalUsers,
            soldToday: data.todayListings.toString() + ' i dag'
          })
        }
      } catch (error) {
        console.error('Feil ved henting av live stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLiveStats()
    // Oppdater stats hver 30 sekund
    const interval = setInterval(fetchLiveStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/annonser?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-[#af4c0f] via-[#d4621a] to-[#af4c0f] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="text-white">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">Norges raskest voksende markedsplass</span>
              </div>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Kjøp og selg
              <span className="block text-yellow-300">alt du trenger</span>
            </h1>

            <p className="text-xl lg:text-2xl mb-8 text-white/90 leading-relaxed">
              Fra biler og eiendom til hverdagsting - Kulbruk.no er Norges mest 
              <span className="font-semibold text-yellow-300"> innovative markedsplass</span> 
              med AI-powered prisestimering og live auksjoner.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-8">
              <div className="flex gap-3 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Søk etter biler, leiligheter, møbler..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-lg bg-white/95 backdrop-blur-sm border-0 focus:ring-2 focus:ring-yellow-300"
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="h-12 px-6 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button asChild size="lg" className="bg-white text-[#af4c0f] hover:bg-gray-100 font-semibold">
                <Link href="/opprett">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Legg ut annonse
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/annonser">
                  Se alle annonser
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="border-yellow-300/50 text-yellow-300 hover:bg-yellow-300/10">
                <Link href="/registrer-bedrift">
                  <Zap className="h-5 w-5 mr-2" />
                  For bedrifter
                </Link>
              </Button>
            </div>

            {/* Quick Stats - Live Data */}
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className={`text-3xl font-bold text-yellow-300 ${isLoading ? 'animate-pulse' : ''}`}>
                  {liveStats.activeListings}
                </div>
                <div className="text-sm text-white/80">Aktive annonser</div>
              </div>
              <div>
                <div className={`text-3xl font-bold text-yellow-300 ${isLoading ? 'animate-pulse' : ''}`}>
                  {liveStats.totalUsers}
                </div>
                <div className="text-sm text-white/80">Fornøyde brukere</div>
              </div>
              <div>
                <div className={`text-3xl font-bold text-yellow-300 ${isLoading ? 'animate-pulse' : ''}`}>
                  {liveStats.soldToday}
                </div>
                <div className="text-sm text-white/80">Nye annonser i dag</div>
              </div>
            </div>
          </div>

          {/* Right Content - Visual */}
          <div className="relative">
            <div className="relative z-10">
              {/* Main Feature Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#af4c0f] rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI-Powered Prisestimering</h3>
                    <p className="text-sm text-gray-600">Få øyeblikkelig prisanslag på din bil</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-[#af4c0f]/10 to-yellow-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">2020 BMW X5</p>
                      <p className="text-2xl font-bold text-[#af4c0f]">465,000 kr</p>
                      <p className="text-xs text-green-600">✅ 92% sikkerhet</p>
                    </div>
                    <div className="text-right">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#af4c0f] to-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">AI</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">Live auksjoner</p>
                    <p className="text-xs text-gray-600">Real-time budgivning</p>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <ShoppingBag className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">Trygg handel</p>
                    <p className="text-xs text-gray-600">Verifiserte brukere</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-300 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white rounded-full opacity-10 animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-12 fill-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
    </section>
  )
}
