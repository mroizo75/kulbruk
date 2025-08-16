"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Plus, User, Menu, X, Bell, MessageSquare } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { data: session, status } = useSession()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/annonser?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Forbedret for mobil */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.svg" 
                alt="Kulbruk.no" 
                width={75} 
                height={75} 
                className="md:w-12 md:h-12 lg:w-16 lg:h-16" 
              />
            </Link>
          </div>

          {/* Desktop Search - Hidden on mobile/tablet */}
          <div className="hidden lg:flex flex-1 max-w-md mx-6">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Søk etter varer, biler, møbler..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#af4c0f] bg-white text-gray-900 placeholder:text-gray-500"
                  type="search"
                />
              </div>
            </form>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Ny annonse knapp - fjernet fra mobil */}
            <Link
              href="/opprett"
              className="hidden md:flex items-center space-x-2 bg-[#af4c0f] text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-[#af4c0f]/90 transition-colors text-sm lg:text-base"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden lg:block">Ny annonse</span>
              <span className="lg:hidden">Legg ut</span>
            </Link>

            {/* Auth section */}
            {session ? (
              <>
                {/* Meldinger og varsler - kun desktop */}
                <Link href="/dashboard/customer/meldinger" className="hidden lg:flex items-center text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-50" title="Meldinger">
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <Link href="/dashboard/business/varsler" className="hidden lg:flex items-center text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-50" title="Varsler">
                  <Bell className="h-5 w-5" />
                </Link>
                
                {/* Brukermeny - forbedret */}
                <Link 
                  href="/dashboard"
                  className="hidden md:flex items-center text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-50"
                  title="Min side"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'Bruker'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-[#af4c0f] to-orange-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <span className="hidden lg:block ml-2 font-medium">Min side</span>
                </Link>
              </>
            ) : (
              <>
                {/* Desktop auth buttons */}
                <div className="hidden md:flex items-center space-x-2">
                  <Link
                    href="/sign-in"
                    className="text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 text-sm lg:text-base rounded-lg hover:bg-gray-50"
                  >
                    Logg inn
                  </Link>
                  <Link
                    href="/registrer"
                    className="bg-gray-900 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm lg:text-base"
                  >
                    Registrer
                  </Link>
                </div>

                {/* Mobile auth icon */}
                <Link
                  href="/sign-in"
                  className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
                  aria-label="Logg inn"
                >
                  <User className="h-6 w-6" />
                </Link>
              </>
            )}

            {/* Mobile menu button - forbedret design */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
              aria-label="Meny"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div> 
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-4 py-4 space-y-3">
              
              {/* Legg ut annonse - prioritert øverst for mobil */}
              <Link
                href="/opprett"
                className="flex items-center space-x-3 bg-[#af4c0f] text-white px-4 py-3 rounded-lg hover:bg-[#af4c0f]/90 transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Plus className="h-5 w-5" />
                <span>Legg ut annonse</span>
              </Link>

              {/* Søk - tilgjengelig på mobil */}
              <form onSubmit={(e) => { handleSearch(e); setIsMobileMenuOpen(false) }} className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Søk etter varer, biler, møbler..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#af4c0f] bg-white text-gray-900 placeholder:text-gray-500"
                    type="search"
                  />
                </div>
              </form>

              {/* Brukerområde */}
              {session ? (
                <div className="space-y-2 pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'Bruker'}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-[#af4c0f] to-orange-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{session.user?.name || 'Bruker'}</p>
                      <p className="text-sm text-gray-500">{session.user?.email}</p>
                    </div>
                  </div>
                  
                  <Link
                    href="/dashboard/customer/meldinger"
                    className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Meldinger</span>
                  </Link>
                  <Link
                    href="/dashboard/business/varsler"
                    className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Bell className="h-5 w-5" />
                    <span>Varsler</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Min side</span>
                  </Link>
                  <button
                    onClick={() => {
                      signOut()
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-3 w-full text-left px-3 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <span>🚪</span>
                    <span>Logg ut</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-3 border-t border-gray-200">
                  <Link
                    href="/sign-in"
                    className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Logg inn</span>
                  </Link>
                  <Link
                    href="/registrer"
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>✨</span>
                    <span>Registrer deg</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
