'use client'

import Link from 'next/link'
import { Car, Home, ShoppingBag, Ship, Plane, Tent, Bed } from 'lucide-react'

const items = [
  { href: '/annonser/bil', label: 'Bil', icon: Car },
  { href: '/annonser/eiendom', label: 'Eiendom', icon: Home },
  { href: '/annonser/torget', label: 'Torget', icon: ShoppingBag },
  { href: '/reiser', label: 'Fly', icon: Plane },
  { href: '/hotell', label: 'Hotell', icon: Bed },
  { href: '/annonser/torget?search=båt', label: 'Båt', icon: Ship },
  { href: '/annonser/torget?search=camping', label: 'Camping', icon: Tent },
]

export default function CategoriesStrip() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-3 sm:gap-6 text-center">
          {items.map((i) => {
            const Icon = i.icon
            return (
              <Link key={i.href} href={i.href} className="group">
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:shadow-sm transition">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#af4c0f]/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#af4c0f]" />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-900">{i.label}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}


