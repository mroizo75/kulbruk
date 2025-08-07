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