"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Plus, User, Menu, X } from 'lucide-react'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.svg" 
                alt="Kulbruk.no" 
                width={50} 
                height={50} 
                className="sm:w-16 sm:h-16 lg:w-20 lg:h-20" 
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link 
              href="/annonser" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Alle annonser
            </Link>
            <Link 
              href="/reiser" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              🛫 Reiser
            </Link>
            <Link 
              href="/annonser/bil" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Biler
            </Link>
            <Link 
              href="/annonser/eiendom" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Eiendom
            </Link>
            <Link 
              href="/annonser/torget" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Torget
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
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop: Full button */}
            <Link
              href="/opprett"
              className="hidden lg:flex items-center space-x-2 bg-[#af4c0f] text-white px-4 py-2 rounded-lg hover:bg-[#af4c0f]/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Legg ut annonse</span>
            </Link>

            {/* Tablet: Shortened button */}
            <Link
              href="/opprett"
              className="hidden md:lg:hidden md:flex items-center space-x-1 bg-[#af4c0f] text-white px-3 py-2 rounded-lg hover:bg-[#af4c0f]/90 transition-colors text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Legg ut</span>
            </Link>

            {/* Mobile: Icon only */}
            <Link
              href="/opprett"
              className="md:hidden bg-[#af4c0f] text-white p-2 rounded-lg hover:bg-[#af4c0f]/90 transition-colors"
              aria-label="Legg ut annonse"
            >
              <Plus className="h-5 w-5" />
            </Link>

            {/* Auth section */}
            <SignedIn>
              {/* Dashboard link - hidden on mobile */}
              <Link 
                href="/dashboard"
                className="hidden sm:flex items-center text-gray-600 hover:text-gray-900 transition-colors px-2 py-1"
              >
                <User className="h-4 w-4 mr-1" />
                <span className="hidden lg:block">Dashboard</span>
              </Link>
              
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8"
                  }
                }}
                userProfileMode="navigation"
                userProfileUrl="/dashboard"
              />
            </SignedIn>

            <SignedOut>
              {/* Desktop auth buttons */}
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  href="/sign-in"
                  className="text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 text-sm lg:text-base"
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

              {/* Mobile auth button */}
              <Link
                href="/sign-in"
                className="md:hidden text-gray-600 hover:text-gray-900 transition-colors p-2"
                aria-label="Logg inn"
              >
                <User className="h-5 w-5" />
              </Link>
            </SignedOut>

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Search Bar */}
        <div className="lg:hidden px-4 pb-3">
          <form onSubmit={handleSearch}>
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/annonser" 
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Alle annonser
              </Link>
              <Link 
                href="/reiser" 
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🛫 Reiser
              </Link>
              <Link 
                href="/annonser/bil" 
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Biler
              </Link>
              <Link 
                href="/annonser/eiendom" 
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Eiendom
              </Link>
              <Link 
                href="/annonser/torget" 
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Torget
              </Link>
              
              <SignedIn>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📊 Dashboard
                  </Link>
                </div>
              </SignedIn>
              
              <SignedOut>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <Link
                    href="/sign-in"
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Logg inn
                  </Link>
                  <Link
                    href="/registrer"
                    className="block px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors mt-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Registrer deg
                  </Link>
                </div>
              </SignedOut>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}