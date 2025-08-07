'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Bedriftsinformasjon */}
          <div className="space-y-4">
            <div>
              <Image src="/logo-white.svg" alt="Kulbruk.no" width={100} height={100} />
              <p className="text-gray-300 text-sm leading-relaxed">
                Norges mest innovative markedsplass for kjøp og salg. Vi gjør handel enklere med AI-teknologi og trygg betaling.
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Buskerud, Norge</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <a href="mailto:support@kulbruk.no" className="hover:text-[#af4c0f] transition-colors">
                  support@kulbruk.no
                </a>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="h-4 w-4" />
                <a href="tel:+4721234567" className="hover:text-[#af4c0f] transition-colors">
                  +47 21 23 45 67
                </a>
              </div>
            </div>
          </div>

          {/* Tjenester */}
          <div>
            <h4 className="font-semibold text-white mb-4">Tjenester</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/annonser/bil" className="text-gray-400 hover:text-[#af4c0f] transition-colors">
                  Bil og transport
                </Link>
              </li>
              <li>
                <Link href="/annonser/eiendom" className="text-gray-400 hover:text-[#af4c0f] transition-colors">
                  Eiendom
                </Link>
              </li>
              <li>
                <Link href="/annonser/torget" className="text-gray-400 hover:text-[#af4c0f] transition-colors">
                  Torget
                </Link>
              </li>
              <li>
                <Link href="/reiser" className="text-gray-400 hover:text-[#af4c0f] transition-colors">
                  Reiser
                </Link>
              </li>
              <li>
                <Link href="/registrer" className="text-gray-400 hover:text-[#af4c0f] transition-colors">
                  For bedrifter
                </Link>
              </li>
              <li>
                <Link href="/test-prisestimering" className="text-gray-400 hover:text-[#af4c0f] transition-colors">
                  AI Prisestimering
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Informasjon */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/om-kulbruk" className="text-gray-400 hover:text-[#af4c0f] transition-colors">
                  Om oss
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-400 hover:text-[#af4c0f] transition-colors">
                  Hjelp og støtte
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-[#af4c0f] transition-colors">
                  Kontakt oss
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-[#af4c0f] transition-colors">
                  Personvern
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-[#af4c0f] transition-colors">
                  Vilkår og betingelser
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-gray-400 hover:text-[#af4c0f] transition-colors">
                  Trygg handel
                </Link>
              </li>
            </ul>
          </div>

          {/* Nyhetsbrev og sosiale medier */}
          <div>
            <h4 className="font-semibold text-white mb-4">Hold deg oppdatert</h4>
            <p className="text-gray-400 text-sm mb-4">
              Få de nyeste tilbudene og nyheter direkte i innboksen din.
            </p>
            
            {/* Nyhetsbrev */}
            <form className="space-y-3 mb-6">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Din e-postadresse"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-[#af4c0f] focus:ring-[#af4c0f]"
                />
                <Button 
                  type="submit"
                  className="bg-[#af4c0f] hover:bg-[#af4c0f]/90 text-white px-4 shrink-0"
                >
                  Meld på
                </Button>
              </div>
            </form>

            {/* Sosiale medier */}
            <div>
              <h5 className="font-medium text-white mb-3">Følg oss</h5>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com/kulbruk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#af4c0f] transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com/kulbruk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#af4c0f] transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com/kulbruk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#af4c0f] transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://youtube.com/kulbruk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#af4c0f] transition-colors"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Ekstra funksjoner seksjon */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-[#af4c0f]/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-[#af4c0f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h5 className="font-medium text-white">Trygg handel</h5>
              <p className="text-gray-400 text-sm">Sikker betaling og verifiserte brukere</p>
            </div>
            
            <div className="space-y-2">
              <div className="w-12 h-12 bg-[#af4c0f]/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-[#af4c0f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h5 className="font-medium text-white">AI-teknologi</h5>
              <p className="text-gray-400 text-sm">Smart prisestimering og anbefaling</p>
            </div>
            
            <div className="space-y-2">
              <div className="w-12 h-12 bg-[#af4c0f]/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-[#af4c0f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h5 className="font-medium text-white">24/7 støtte</h5>
              <p className="text-gray-400 text-sm">Alltid her når du trenger hjelp</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-400">
              <p>&copy; 2025 Kulbruk.no AS. Alle rettigheter forbeholdt.</p>
              <div className="flex gap-4">
                <Link href="/privacy" className="hover:text-[#af4c0f] transition-colors">
                  Personvern
                </Link>
                <Link href="/terms" className="hover:text-[#af4c0f] transition-colors">
                  Vilkår
                </Link>
                <Link href="/cookies" className="hover:text-[#af4c0f] transition-colors">
                  Cookies
                </Link>
              </div>
            </div>
            
            {/* Scroll to top button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollToTop}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <ArrowUp className="h-4 w-4 mr-1" />
              Til toppen
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}
