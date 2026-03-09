'use client'

import Link from 'next/link'
import { Car, Home, ShoppingBag, Ship, Plane, Tent, Bed } from 'lucide-react'

const items = [
  { href: '/annonser/bil',                   label: 'Bil',     icon: Car,         color: '#2563EB', bg: '#EFF6FF' },
  { href: '/annonser/eiendom',               label: 'Eiendom', icon: Home,        color: '#059669', bg: '#ECFDF5' },
  { href: '/annonser/torget',                label: 'Torget',  icon: ShoppingBag, color: '#AF4C0F', bg: '#FFF7ED' },
  { href: '/reiser',                         label: 'Fly',     icon: Plane,       color: '#7C3AED', bg: '#F5F3FF' },
  { href: '/hotell',                         label: 'Hotell',  icon: Bed,         color: '#DB2777', bg: '#FDF2F8' },
  { href: '/annonser/torget?search=båt',     label: 'Båt',     icon: Ship,        color: '#0284C7', bg: '#F0F9FF' },
  { href: '/annonser/torget?search=camping', label: 'Camping', icon: Tent,        color: '#65A30D', bg: '#F7FEE7' },
]

export default function CategoriesStrip() {
  return (
    <div style={{ backgroundColor: '#FAF6EF', borderBottom: '1px solid #EDE0D2' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-3 sm:gap-4 text-center">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className="group">
                <div
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #EDE0D2',
                  }}
                >
                  <div
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                    style={{ backgroundColor: item.bg }}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: item.color }} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium" style={{ color: '#3D2010' }}>
                    {item.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
