import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { notifyNewUser } from '@/lib/notification-manager'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId && !user) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Valider påkrevde felt
    const requiredFields = ['companyName', 'orgNumber', 'contactPerson', 'phone', 'email', 'address', 'postalCode', 'city']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} er påkrevd` },
          { status: 400 }
        )
      }
    }

    // Valider organisasjonsnummer (9 siffer)
    const cleanOrgNumber = data.orgNumber.replace(/\s/g, '')
    if (!/^\d{9}$/.test(cleanOrgNumber)) {
      return NextResponse.json(
        { error: 'Organisasjonsnummer må være 9 siffer' },
        { status: 400 }
      )
    }

    // Sjekk om organisasjonsnummer allerede er registrert
    const existingBusiness = await prisma.user.findFirst({
      where: { orgNumber: cleanOrgNumber }
    })

    if (existingBusiness) {
      return NextResponse.json(
        { error: 'Dette organisasjonsnummeret er allerede registrert' },
        { status: 400 }
      )
    }

    // Sjekk om brukeren allerede eksisterer
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user?.id || userId || '' }
    })

    if (dbUser) {
      // Oppdater eksisterende bruker med bedriftsinformasjon
      dbUser = await prisma.user.update({
        where: { clerkId: user?.id || userId || '' },
        data: {
          role: 'business',
          companyName: data.companyName,
          orgNumber: cleanOrgNumber,
          phone: data.phone,
          location: `${data.address}, ${data.postalCode} ${data.city}`,
          website: data.website || null,
          // Lagre ekstra bedriftsinfo i en JSON-struktur (kan utvides senere)
          firstName: data.contactPerson.split(' ')[0] || data.contactPerson,
          lastName: data.contactPerson.split(' ').slice(1).join(' ') || '',
          email: data.email
        }
      })
    } else {
      // Opprett ny bruker
      dbUser = await prisma.user.create({
        data: {
          clerkId: user?.id || userId || '',
          email: data.email,
          firstName: data.contactPerson.split(' ')[0] || data.contactPerson,
          lastName: data.contactPerson.split(' ').slice(1).join(' ') || '',
          phone: data.phone,
          location: `${data.address}, ${data.postalCode} ${data.city}`,
          role: 'business',
          companyName: data.companyName,
          orgNumber: cleanOrgNumber,
          website: data.website || null
        }
      })
    }

    // Oppdater Clerk metadata
    const clerkClient = (await import('@clerk/nextjs/server')).clerkClient
    const client = await clerkClient()
    
    await client.users.updateUserMetadata(user?.id || userId || '', {
      publicMetadata: {
        role: 'business',
        companyName: data.companyName,
        orgNumber: cleanOrgNumber,
        businessType: data.businessType
      }
    })

    // Send notifikasjon til admin om ny bedriftsregistrering
    notifyNewUser({
      id: dbUser.id,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      role: 'business',
      companyName: data.companyName
    })

    console.log('Ny bedrift registrert:', {
      company: data.companyName,
      orgNumber: cleanOrgNumber,
      contact: data.contactPerson,
      type: data.businessType
    })

    return NextResponse.json({
      success: true,
      message: 'Bedrift registrert vellykket! Vi gjennomgår søknaden din.',
      user: {
        id: dbUser.id,
        companyName: dbUser.companyName,
        role: dbUser.role
      }
    })

  } catch (error) {
    console.error('Feil ved bedriftsregistrering:', error)
    return NextResponse.json(
      { error: 'Kunne ikke registrere bedrift' },
      { status: 500 }
    )
  }
}
