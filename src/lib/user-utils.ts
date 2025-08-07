import { auth } from './auth'
import { PrismaClient } from '@prisma/client'
import { UserRole } from './types'

const prisma = new PrismaClient()

// Hent brukerrolle fra NextAuth session eller database
export async function getUserRole(): Promise<UserRole> {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return 'customer' // Standard rolle for ikke-innloggede
    }

    return session.user.role || 'customer'
  } catch (error) {
    console.error('Feil ved henting av brukerrolle:', error)
    return 'customer'
  }
}

// Hent komplett brukerinformasjon
export async function getUserInfo() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return null
    }

    // Hent ekstra informasjon fra database
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    return {
      id: session.user.id,
      firstName: session.user.firstName || dbUser?.firstName || '',
      lastName: session.user.lastName || dbUser?.lastName || '',
      email: session.user.email || '',
      role: session.user.role || 'customer',
      avatar: session.user.image || dbUser?.avatar,
      phone: session.user.phone || dbUser?.phone,
      createdAt: dbUser?.createdAt || new Date(),
      companyName: session.user.companyName || dbUser?.companyName || null,
      orgNumber: session.user.orgNumber || dbUser?.orgNumber || null,
    }
  } catch (error) {
    console.error('Feil ved henting av brukerinformasjon:', error)
    return null
  }
}

// Sjekk om bruker har tilgang til spesifikk rolle
export async function hasRoleAccess(requiredRole: UserRole): Promise<boolean> {
  try {
    const userRole = await getUserRole()
    
    // Admin har tilgang til alt
    if (userRole === 'admin') {
      return true
    }
    
    // Moderator har tilgang til customer-områder
    if (userRole === 'moderator' && requiredRole === 'customer') {
      return true
    }
    
    // Ellers må rollene matche
    return userRole === requiredRole
  } catch (error) {
    console.error('Feil ved rollesjekk:', error)
    return false
  }
}

// Sett brukerrolle i database
export async function setUserRole(userId: string, role: UserRole) {
  try {
    // Oppdater rolle i database
    await prisma.user.update({
      where: { id: userId },
      data: { role: role }
    })
    
    return true
  } catch (error) {
    console.error('Feil ved setting av rolle:', error)
    return false
  }
}