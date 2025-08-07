import HeroSection from '@/components/homepage/hero-section'
import CategoriesSection from '@/components/homepage/categories-section'
import FeaturesSection from '@/components/homepage/features-section'
import TestimonialsSection from '@/components/homepage/testimonials-section'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Categories Section */}
      <CategoriesSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Testimonials & Stats Section */}
      <TestimonialsSection />
    </div>
  )
}