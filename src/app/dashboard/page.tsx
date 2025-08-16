import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/sign-in?callbackUrl=/dashboard')
  }
  

  
  // Hent brukerrolle fra session
  let userRole = (session.user as any).role || 'customer'
  
  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true, email: true, companyName: true, orgNumber: true }
    })
    
    if (dbUser) {
      userRole = dbUser.role

      
      // Spesiell behandling for business brukere som ikke har fullført setup
      if (userRole === 'business' && (!dbUser.companyName || !dbUser.orgNumber)) {

        redirect('/complete-business-setup')
        return null
      }
    } else {

      
      // Opprett ny bruker i database hvis den ikke eksisterer
      await prisma.user.create({
        data: {
          email: session.user.email!,
          name: session.user.name,
          firstName: (session.user as any).firstName,
          lastName: (session.user as any).lastName,
          role: userRole,
          image: session.user.image,
        }
      })
    }
  } catch (error) {
    // Database feil - bruker faller tilbake til session rolle
    // Bruk standard rolle som fallback
    userRole = 'customer'
  }
  

  
  // Redirect basert på rolle
  switch (userRole) {
    case 'admin':
      redirect('/dashboard/admin')
      return null
    case 'moderator':
      redirect('/dashboard/moderator') // Moderator har eget dashboard
      return null
    case 'business':
      redirect('/dashboard/business')
      return null
    default:
      redirect('/dashboard/customer')
      return null
  }
}