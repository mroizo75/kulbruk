import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId && !user) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    // Sjekk at brukeren er business
    const businessUser = await prisma.user.findUnique({
      where: { clerkId: user?.id || userId || '' },
      select: { 
        id: true, 
        role: true,
        companyName: true
      }
    })

    if (!businessUser || businessUser.role !== 'business') {
      return NextResponse.json(
        { error: 'Kun bedrifter har tilgang' },
        { status: 403 }
      )
    }

    // TODO: Hent faktiske notification settings fra database
    // For nå returnerer vi mock data
    const settings = {
      enabled: true,
      channels: ['email', 'sms'],
      preferences: {
        newAuctions: true,
        bidUpdates: true,
        auctionEnding: true,
        marketReports: false,
        systemUpdates: true
      },
      brandFilters: {
        enabled: true,
        selectedBrands: ['BMW', 'Audi', 'Mercedes-Benz'],
        priceRange: {
          min: 100000,
          max: 1000000
        },
        yearRange: {
          min: 2018,
          max: 2024
        }
      }
    }

    return NextResponse.json({
      success: true,
      settings
    })

  } catch (error) {
    console.error('Feil ved henting av notification settings:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente innstillinger' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId && !user) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    // Sjekk at brukeren er business
    const businessUser = await prisma.user.findUnique({
      where: { clerkId: user?.id || userId || '' },
      select: { 
        id: true, 
        role: true,
        companyName: true
      }
    })

    if (!businessUser || businessUser.role !== 'business') {
      return NextResponse.json(
        { error: 'Kun bedrifter kan oppdatere innstillinger' },
        { status: 403 }
      )
    }

    const settings = await request.json()

    // Valider innstillinger
    if (typeof settings.enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Ugyldig enabled verdi' },
        { status: 400 }
      )
    }

    // TODO: Lagre til database når notification settings model er klar
    // For nå logger vi bare innstillingene
    console.log('🔔 Notification settings oppdatert for:', businessUser.companyName)
    console.log('Settings:', JSON.stringify(settings, null, 2))

    // Oppdater real-time notification subscriptions
    if (settings.enabled && settings.brandFilters.enabled) {
      console.log('📱 Real-time filtering aktivert for merker:', settings.brandFilters.selectedBrands)
      console.log('💰 Prisområde:', settings.brandFilters.priceRange)
      console.log('📅 Årsmodell:', settings.brandFilters.yearRange)
    }

    return NextResponse.json({
      success: true,
      message: 'Varslingsinnstillinger lagret vellykket',
      settings
    })

  } catch (error) {
    console.error('Feil ved lagring av notification settings:', error)
    return NextResponse.json(
      { error: 'Kunne ikke lagre innstillinger' },
      { status: 500 }
    )
  }
}
