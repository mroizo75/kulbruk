import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { UserRole } from './types'

const prisma = new PrismaClient()

// Hent brukerrolle fra Clerk eller database
export async function getUserRole(): Promise<UserRole> {
  try {
    const user = await currentUser()
    
    if (!user) {
      return 'customer' // Standard rolle for ikke-innloggede
    }

    // Først prøv å hente rolle fra Clerk metadata
    const clerkRole = user.publicMetadata?.role as UserRole
    if (clerkRole) {
      return clerkRole
    }

    // Hvis ikke i Clerk, hent fra database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { role: true }
    })

    return (dbUser?.role as UserRole) || 'customer'
  } catch (error) {
    console.error('Feil ved henting av brukerrolle:', error)
    return 'customer'
  }
}

// Hent komplett brukerinformasjon
export async function getUserInfo() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return null
    }

    // Hent ekstra informasjon fra database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    })

    return {
      id: user.id,
      firstName: user.firstName || dbUser?.firstName || '',
      lastName: user.lastName || dbUser?.lastName || '',
      email: user.emailAddresses[0]?.emailAddress || dbUser?.email || '',
      role: (user.publicMetadata?.role as UserRole) || (dbUser?.role as UserRole) || 'customer',
      avatar: user.imageUrl || dbUser?.avatar,
      phone: user.phoneNumbers[0]?.phoneNumber || dbUser?.phone,
      createdAt: dbUser?.createdAt || new Date(),
      companyName: dbUser?.companyName || null, // For bedriftsbrukere
      orgNumber: dbUser?.orgNumber || null, // Organisasjonsnummer
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

// Sett brukerrolle i Clerk metadata
export async function setUserRole(userId: string, role: UserRole) {
  try {
    const client = await clerkClient()
    
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role
      }
    })
    
    // Oppdater også i database
    await prisma.user.updateMany({
      where: { clerkId: userId },
      data: { role: role }
    })
    
    return true
  } catch (error) {
    console.error('Feil ved setting av rolle:', error)
    return false
  }
}