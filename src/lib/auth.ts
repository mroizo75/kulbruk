import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { UserRole } from './types'

// Hent nåværende bruker med rolle fra Clerk metadata
export async function getCurrentUser() {
  const { userId } = auth()
  
  if (!userId) {
    return null
  }

  try {
    // Hent bruker fra Clerk med metadata
    const user = await clerkClient.users.getUser(userId)
    const role = (user.publicMetadata?.role as UserRole) || 'customer'
    
    return {
      id: userId,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: role
    }
  } catch (error) {
    console.error('Feil ved henting av bruker:', error)
    return {
      id: userId,
      role: 'customer' as UserRole // Fallback
    }
  }
}

// Sjekk om bruker har spesifikk rolle
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const user = await getCurrentUser()
  
  if (!user) return false
  
  // Admin har tilgang til alt
  if (user.role === 'admin') return true
  
  // Moderator har tilgang til customer-ting
  if (user.role === 'moderator' && requiredRole === 'customer') return true
  
  return user.role === requiredRole
}

// Redirect hvis ikke riktig rolle
export async function requireRole(requiredRole: UserRole) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  const hasAccess = await hasRole(requiredRole)
  
  if (!hasAccess) {
    redirect('/unauthorized')
  }
  
  return user
}

// Middleware hjelpefunksjon for å sjekke roller
export function checkRole(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false
  
  // Admin har tilgang til alt
  if (userRole === 'admin') return true
  
  // Moderator har tilgang til customer-ting
  if (userRole === 'moderator' && requiredRole === 'customer') return true
  
  return userRole === requiredRole
}