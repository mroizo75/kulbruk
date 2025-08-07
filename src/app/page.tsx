import { Suspense } from 'react'
import HeroSection from '@/components/homepage/hero-section'
import ListingCard, { ListingGrid, ListingCardSkeleton } from '@/components/listing-card'
import LiveListings from '@/components/live-listings'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
    </div>
  )
}