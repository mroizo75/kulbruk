import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/sign-in?callbackUrl=/dashboard')
  }
  
  console.log('=== DASHBOARD ROUTING DEBUG ===')
  console.log('Session User ID:', session.user.id)
  console.log('Session User Role:', session.user.role)
  console.log('Session User Email:', session.user.email)
  
  // Hent brukerrolle fra session
  let userRole = session.user.role || 'customer'
  
  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true, email: true, companyName: true, orgNumber: true }
    })
    
    if (dbUser) {
      userRole = dbUser.role
      console.log('Database rolle funnet:', dbUser.role, 'for', dbUser.email)
      console.log('Bedriftsnavn:', dbUser.companyName, 'Org.nr:', dbUser.orgNumber)
      
      // Spesiell behandling for business brukere som ikke har fullført setup
      if (userRole === 'business' && (!dbUser.companyName || !dbUser.orgNumber)) {
        console.log('Business bruker som ikke har fullført setup - redirect til complete-business-setup')
        redirect('/complete-business-setup')
        return null
      }
    } else {
      console.log('Bruker ikke funnet i database - oppretter ny bruker')
      
      // Opprett ny bruker i database hvis den ikke eksisterer
      await prisma.user.create({
        data: {
          email: session.user.email!,
          name: session.user.name,
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          role: userRole,
          image: session.user.image,
        }
      })
    }
  } catch (error) {
    console.error('Database feil:', error)
    // Bruk standard rolle som fallback
    userRole = 'customer'
  }
  
  console.log('Endelig rolle:', userRole)
  console.log('Redirecter til:', `/dashboard/${userRole}`)
  console.log('=== END DEBUG ===')
  
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