'use client'

import { Search, Plus, TrendingUp, Flame, Sparkles } from 'lucide-react'
import CategoriesStrip from '@/components/homepage/categories-strip'
import RecommendedListings from '@/components/homepage/recommended-listings'
import RecentlyViewedStrip from '@/components/homepage/recently-viewed-strip'
import Link from 'next/link'
import { useState } from 'react'

const POPULAR_SEARCHES = ['Tesla', 'iPhone', 'Leilighet Oslo', 'IKEA sofa']

const STATS = [
  { value: '12,624', label: 'Aktive annonser', color: '#F5A45D' },
  { value: '486', label: 'Nye i dag', color: '#6EE7B7' },
  { value: '2.4M+', label: 'Månedlige søk', color: '#93C5FD' },
  { value: '95%', label: 'Fornøyde brukere', color: '#FCA5A5' },
]

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/annonser?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <div style={{ backgroundColor: '#FAF6EF' }}>

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(140deg, #180D06 0%, #2C1508 55%, #1A0E07 100%)',
        }}
      >
        {/* ambient glow blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[640px] w-[640px] rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, #AF4C0F 0%, transparent 65%)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-32 h-[480px] w-[480px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #E8892A 0%, transparent 65%)' }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-0 sm:pt-20 sm:pb-0 text-center">

          {/* badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
            style={{
              backgroundColor: 'rgba(175,76,15,0.25)',
              color: '#F5A45D',
              border: '1px solid rgba(175,76,15,0.45)',
            }}
          >
            <Flame className="h-3.5 w-3.5" />
            486 nye annonser lagt ut i dag
          </div>

          {/* headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-bold text-white leading-tight tracking-tight mb-4">
            Finn det du leter etter
            <br />
            <span style={{ color: '#F5A45D' }}>på Kulbruk.no</span>
          </h1>
          <p className="text-base sm:text-lg mb-8 max-w-lg mx-auto" style={{ color: '#B89F8A' }}>
            Norges markedsplass for trygg kjøp og salg
          </p>

          {/* search */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-5 px-2 sm:px-0">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-5 z-10 h-5 w-5 text-stone-400" />
              <input
                type="text"
                placeholder="Søk etter biler, leiligheter, møbler..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl pl-14 pr-36 h-[3.75rem] text-base text-stone-900 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-orange-400"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
                }}
              />
              <button
                type="submit"
                className="absolute right-2 h-11 px-7 rounded-xl font-semibold text-white text-sm transition-all hover:brightness-110 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #AF4C0F, #D0660F)' }}
              >
                Søk
              </button>
            </div>
          </form>

          {/* popular searches */}
          <div className="flex flex-wrap justify-center gap-2 mb-9">
            <span className="text-sm self-center" style={{ color: '#7A6355' }}>Populære:</span>
            {POPULAR_SEARCHES.map((s) => (
              <button
                key={s}
                onClick={() => { window.location.href = `/annonser?search=${encodeURIComponent(s)}` }}
                className="text-sm px-3 py-1 rounded-full transition-all hover:brightness-110"
                style={{
                  backgroundColor: 'rgba(245,164,93,0.12)',
                  color: '#F5A45D',
                  border: '1px solid rgba(245,164,93,0.28)',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/opprett"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white text-base mb-12 transition-all hover:brightness-110 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #AF4C0F, #D0660F)',
              boxShadow: '0 8px 32px rgba(175,76,15,0.45)',
            }}
          >
            <Plus className="h-5 w-5" />
            Legg ut annonse
          </Link>
        </div>

        {/* stats bar */}
        <div
          className="relative grid grid-cols-2 sm:grid-cols-4 text-center"
          style={{
            backgroundColor: 'rgba(0,0,0,0.35)',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {STATS.map((s, i) => (
            <div key={i} className="py-4 px-2">
              <div className="text-xl sm:text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#7A6355' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES STRIP ── */}
      <CategoriesStrip />

      {/* ── ANBEFALTE ANNONSER ── */}
      <section className="py-8 sm:py-10" style={{ backgroundColor: '#FAF6EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#1A0F08' }}>Anbefalte annonser</h2>
              <p className="text-sm mt-0.5" style={{ color: '#7A6355' }}>Basert på dine tidligere søk og interesser</p>
            </div>
            <Link
              href="/annonser"
              className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border transition-colors hover:bg-orange-50 w-fit"
              style={{ color: '#AF4C0F', borderColor: '#AF4C0F' }}
            >
              Se alle annonser
            </Link>
          </div>
          <RecommendedListings />
        </div>
      </section>

      {/* ── DU SÅ NYLIG ── */}
      <RecentlyViewedStrip />

    </div>
  )
}
