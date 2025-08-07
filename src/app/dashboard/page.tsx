import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function DashboardPage() {
  const clerkUser = await currentUser()
  
  if (!clerkUser) {
    redirect('/sign-in?redirectUrl=/dashboard')
  }
  
  console.log('=== DASHBOARD ROUTING DEBUG ===')
  console.log('Clerk User ID:', clerkUser.id)
  console.log('Clerk publicMetadata:', clerkUser.publicMetadata)
  console.log('Clerk unsafeMetadata:', clerkUser.unsafeMetadata)
  
  // Prioritet 1: Sjekk database først (mest oppdatert)
  let userRole = 'customer'
  
  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { role: true, email: true, companyName: true, orgNumber: true }
    })
    
    if (dbUser) {
      userRole = dbUser.role
      console.log('Database rolle funnet:', dbUser.role, 'for', dbUser.email)
      console.log('Bedriftsnavn:', dbUser.companyName, 'Org.nr:', dbUser.orgNumber)
    } else {
      console.log('Bruker ikke funnet i database')
      
      // Prioritet 2: Sjekk Clerk metadata (både public og unsafe)
      const clerkRole = clerkUser.publicMetadata?.role as string || clerkUser.unsafeMetadata?.role as string
      const accountType = clerkUser.unsafeMetadata?.accountType as string
      
      if (clerkRole) {
        userRole = clerkRole
        console.log('Clerk rolle funnet:', clerkRole, 'accountType:', accountType)
      }
      
      // Spesiell behandling for business brukere som ikke har fullført setup
      if ((clerkRole === 'business' || accountType === 'business') && !clerkUser.publicMetadata?.businessSetupComplete) {
        console.log('Business bruker som ikke har fullført setup - redirect til complete-business-setup')
        redirect('/complete-business-setup')
        return null
      }
    }
  } catch (error) {
    console.error('Database feil:', error)
    
    // Fallback til Clerk metadata
    const clerkRole = clerkUser.publicMetadata?.role as string || clerkUser.unsafeMetadata?.role as string
    const accountType = clerkUser.unsafeMetadata?.accountType as string
    
    if (clerkRole) {
      userRole = clerkRole
      console.log('Fallback til Clerk rolle:', clerkRole)
    }
    
    // Sjekk business setup også i fallback
    if ((clerkRole === 'business' || accountType === 'business') && !clerkUser.publicMetadata?.businessSetupComplete) {
      console.log('Business fallback - redirect til complete-business-setup')
      redirect('/complete-business-setup')
      return null
    }
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