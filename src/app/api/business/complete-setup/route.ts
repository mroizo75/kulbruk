import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { notifyNewUser } from '@/lib/notification-manager'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Valider påkrevde felt
    const requiredFields = ['companyName', 'orgNumber', 'phone', 'address', 'postalCode', 'city']
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
      where: { id: session.user.id }
    })

    if (dbUser) {
      // Oppdater eksisterende bruker med bedriftsinformasjon
      dbUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          role: 'business',
          companyName: data.companyName,
          orgNumber: cleanOrgNumber,
          phone: data.phone,
          location: `${data.address}, ${data.postalCode} ${data.city}`,
          website: data.website || null,
          firstName: data.contactPerson.split(' ')[0] || session.user.name?.split(' ')[0] || '',
          lastName: data.contactPerson.split(' ').slice(1).join(' ') || session.user.name?.split(' ')[1] || '',
          email: data.email || session.user.email || ''
        }
      })
    } else {
      // Opprett ny bruker
      dbUser = await prisma.user.create({
        data: {
          id: session.user.id,
          email: data.email || session.user.email || '',
          firstName: data.contactPerson.split(' ')[0] || session.user.name?.split(' ')[0] || '',
          lastName: data.contactPerson.split(' ').slice(1).join(' ') || session.user.name?.split(' ')[1] || '',
          phone: data.phone,
          location: `${data.address}, ${data.postalCode} ${data.city}`,
          role: 'business',
          companyName: data.companyName,
          orgNumber: cleanOrgNumber,
          website: data.website || null
        }
      })
    }


    // Send notifikasjon til admin om ny bedriftsregistrering
    notifyNewUser({
      id: dbUser.id,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      role: 'business',
      companyName: data.companyName
    })

    console.log('✅ Bedrift setup fullført:', {
      company: data.companyName,
      orgNumber: cleanOrgNumber,
      contact: data.contactPerson || `${session.user.name?.split(' ')[0]} ${session.user.name?.split(' ')[1]}`,
      type: data.businessType,
      userId: dbUser.id
    })

    return NextResponse.json({
      success: true,
      message: 'Bedrift registrert vellykket! Velkommen til Kulbruk Business.',
      user: {
        id: dbUser.id,
        companyName: dbUser.companyName,
        role: dbUser.role,
        orgNumber: dbUser.orgNumber
      }
    })

  } catch (error) {
    console.error('❌ Feil ved business setup:', error)
    return NextResponse.json(
      { error: 'Kunne ikke fullføre bedriftsregistrering' },
      { status: 500 }
    )
  }
}
