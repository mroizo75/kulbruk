// Brukerroller i systemet
export type UserRole = 'customer' | 'admin' | 'moderator' | 'business'

// Bruker-interface som synkroniseres med Clerk
export interface AppUser {
  id: string
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  location?: string
  role: UserRole
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

// Clerk metadata interface
export interface ClerkUserMetadata {
  role?: UserRole
  approved?: boolean
}

// Navigasjons-interface for dashboards
export interface DashboardNavItem {
  title: string
  href: string
  icon: string
  description?: string
  badge?: string | number
}

// RateHawk Hotel API Types
export interface RateHawkHotelSearchParams {
  destination: string
  checkIn: string
  checkOut: string
  adults: number
  children?: number[]
  rooms?: number
  currency?: string
}

export interface RateHawkHotel {
  id: string
  name: string
  address: string
  rating: number
  price: {
    amount: number
    currency: string
    perNight: boolean
  }
  image: string
  amenities: string[]
  distance: string
}

export interface RateHawkHotelSearchResponse {
  success: boolean
  hotels: RateHawkHotel[]
  searchId: string
  totalResults: number
  error?: string
}

export interface RateHawkDestination {
  id: string
  name: string
  type: 'city' | 'hotel' | 'landmark'
}