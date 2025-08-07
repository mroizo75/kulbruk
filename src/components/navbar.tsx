"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Plus, User } from 'lucide-react'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.svg" alt="Kulbruk.no" width={80} height={80} />
            </Link>

            {/* Hovednavigasjon - skjult på mobile */}
            <div className="hidden md:flex items-center space-x-6">
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
          </div>

          {/* Søkebar - midt */}
          <div className="flex-1 max-w-md mx-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Søk etter varer, biler, møbler..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#af4c0f] bg-white text-gray-900 placeholder:text-gray-500"
                type="search"
              />
            </div>
          </div>

          {/* Høyre side - Knapper og bruker */}
          <div className="flex items-center space-x-4">
            {/* Legg ut annonse - kun for innlogget brukere */}
            <SignedIn>
              <Link 
                href="/opprett"
                className="hidden sm:flex items-center bg-[#af4c0f] text-white px-4 py-2 rounded hover:bg-[#af4c0f]/90 transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                Legg ut annonse
              </Link>
              <Link 
                href="/opprett"
                className="sm:hidden bg-[#af4c0f] text-white p-2 rounded hover:bg-[#af4c0f]/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </Link>
              
              {/* Dashboard link */}
              <Link 
                href="/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <User className="h-4 w-4 mr-1" />
                <span className="hidden sm:block">Dashboard</span>
              </Link>
              
              {/* User button */}
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8"
                  }
                }}
                userProfileProps={{
                  appearance: {
                    elements: {
                      rootBox: "bg-white"
                    }
                  }
                }}
              />
            </SignedIn>

            {/* Auth knapper for ikke-innlogget */}
            <SignedOut>
              <div className="flex items-center space-x-2">
                <Link 
                  href="/sign-in"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Logg inn
                </Link>
                <Link 
                  href="/registrer"
                  className="bg-[#af4c0f] text-white px-4 py-2 rounded hover:bg-[#af4c0f]/90 transition-colors"
                >
                  Registrer deg
                </Link>
              </div>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  )
}