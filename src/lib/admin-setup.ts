import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Hardkodede admin e-poster (Metode 2)
const ADMIN_EMAILS = [
  'kenneth@kksas.no',       // Din e-post
  'admin@kulbruk.no',       // Standard admin
  'kenneth@kulbruk.no'      // Ekstra admin
]

// Sjekk om en e-post skal være admin
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

// Sjekk om dette er den første brukeren (Metode 1)
export async function isFirstUser(): Promise<boolean> {
  const userCount = await prisma.user.count()
  return userCount === 0
}

// Bestem rolle for ny bruker
export async function determineUserRole(email: string): Promise<string> {
  // Metode 1: Første bruker blir admin
  if (await isFirstUser()) {
    console.log('🎉 Første bruker registrert - gir admin rolle!')
    return 'admin'
  }
  
  // Metode 2: Hardkodede admin e-poster
  if (isAdminEmail(email)) {
    console.log(`🔧 Admin e-post gjenkjent: ${email}`)
    return 'admin'
  }
  
  // Standard: customer
  return 'customer'
}

// Promover eksisterende bruker til admin (Metode 3)
export async function promoteUserToAdmin(userId: string, promotedBy: string): Promise<boolean> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: 'admin' }
    })
    
    console.log(`🎖️ Bruker ${user.email} promovere til admin av ${promotedBy}`)
    return true
  } catch (error) {
    console.error('Feil ved promotering til admin:', error)
    return false
  }
}

// Degrader admin til customer
export async function demoteUserFromAdmin(userId: string, demotedBy: string): Promise<boolean> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: 'customer' }
    })
    
    console.log(`📉 Bruker ${user.email} degradert fra admin av ${demotedBy}`)
    return true
  } catch (error) {
    console.error('Feil ved degradering fra admin:', error)
    return false
  }
}