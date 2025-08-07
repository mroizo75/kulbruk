import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { estimateVehiclePrice } from '@/lib/ai-price-estimation'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    // Sjekk business tilgang
    const businessUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, companyName: true, id: true }
    })

    if (!businessUser || businessUser.role !== 'business') {
      return NextResponse.json(
        { error: 'Kun bedrifter har tilgang til auksjoner' },
        { status: 403 }
      )
    }

    console.log('📊 Henter auksjoner for:', businessUser.companyName)

    // For nå bruker vi mock data med AI-powered prisestimering
    const mockAuctions = await generateMockAuctionsWithAIPricing(businessUser.id)

    return NextResponse.json({
      success: true,
      auctions: mockAuctions,
      total: mockAuctions.length,
      businessUser: {
        id: businessUser.id,
        companyName: businessUser.companyName
      }
    })

  } catch (error) {
    console.error('❌ Feil ved henting av auksjoner:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente auksjoner' },
      { status: 500 }
    )
  }
}

async function generateMockAuctionsWithAIPricing(businessUserId: string) {
  const mockVehicles = [
    {
      id: 'auction_1',
      title: '2020 BMW X5 xDrive40i - Perfekt stand',
      make: 'BMW',
      model: 'X5',
      variant: 'xDrive40i',
      year: 2020,
      mileage: 45000,
      fuelType: 'Bensin',
      transmission: 'Automat',
      condition: 'EXCELLENT' as const,
      location: 'Oslo',
      features: ['panoramatak', 'lær interiør', 'adaptiv cruise control', 'harman kardon'],
      seller: { firstName: 'Lars', lastName: 'Hansen' }
    },
    {
      id: 'auction_2',
      title: '2019 Audi A6 Avant 45 TDI quattro',
      make: 'Audi',
      model: 'A6',
      variant: 'Avant 45 TDI quattro',
      year: 2019,
      mileage: 68000,
      fuelType: 'Diesel',
      transmission: 'Automat',
      condition: 'GOOD' as const,
      location: 'Bergen',
      features: ['quattro drift', 'adaptive cruise control', 'matrix LED'],
      seller: { firstName: 'Anne', lastName: 'Svendsen' }
    },
    {
      id: 'auction_3',
      title: '2021 Tesla Model 3 Long Range',
      make: 'Tesla',
      model: 'Model 3',
      variant: 'Long Range',
      year: 2021,
      mileage: 25000,
      fuelType: 'Elektrisk',
      transmission: 'Automat',
      condition: 'EXCELLENT' as const,
      location: 'Trondheim',
      features: ['autopilot', 'premium interiør', 'supercharger-tilgang'],
      seller: { firstName: 'Erik', lastName: 'Olsen' }
    },
    {
      id: 'auction_4',
      title: '2022 Mercedes-Benz E-Class AMG Line',
      make: 'Mercedes-Benz',
      model: 'E-Class',
      variant: 'AMG Line',
      year: 2022,
      mileage: 18000,
      fuelType: 'Bensin',
      transmission: 'Automat',
      condition: 'EXCELLENT' as const,
      location: 'Stavanger',
      features: ['AMG styling', 'MBUX infotainment', 'adaptiv demping'],
      seller: { firstName: 'Maria', lastName: 'Johansen' }
    },
    {
      id: 'auction_5',
      title: '2020 Volvo XC90 T6 AWD Inscription',
      make: 'Volvo',
      model: 'XC90',
      variant: 'T6 AWD Inscription',
      year: 2020,
      mileage: 52000,
      fuelType: 'Bensin',
      transmission: 'Automat',
      condition: 'GOOD' as const,
      location: 'Kristiansand',
      features: ['7 seter', 'luftfjæring', 'bowers & wilkins'],
      seller: { firstName: 'Thomas', lastName: 'Andersen' }
    }
  ]

  const auctionsWithAI = await Promise.all(
    mockVehicles.map(async (vehicle) => {
      try {
        // Get AI price estimation
        const priceEstimation = await estimateVehiclePrice({
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          mileage: vehicle.mileage,
          fuelType: vehicle.fuelType,
          transmission: vehicle.transmission,
          condition: vehicle.condition,
          location: vehicle.location,
          features: vehicle.features
        })

        // Generate mock bid data
        const hasBids = Math.random() > 0.4 // 60% chance of having bids
        const bidCount = hasBids ? Math.floor(Math.random() * 8) + 1 : 0
        const currentBid = hasBids ? 
          Math.floor(priceEstimation.estimatedPrice * (0.8 + Math.random() * 0.2)) : 
          null

        // Check if user has bid on this auction (random for demo)
        const userHasBid = Math.random() > 0.7 // 30% chance
        const userBid = userHasBid && currentBid ? 
          currentBid - Math.floor(Math.random() * 20000) - 5000 : 
          null
        const isWinning = userHasBid && userBid && userBid >= (currentBid || 0)

        // Generate end date (7 days from creation)
        const createdAt = new Date(Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000)) // 0-3 days ago
        const endDate = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)

        // Determine status based on time
        const now = new Date()
        const timeLeft = endDate.getTime() - now.getTime()
        let status: 'ACTIVE' | 'ENDING_SOON' | 'ENDED' = 'ACTIVE'
        
        if (timeLeft <= 0) {
          status = 'ENDED'
        } else if (timeLeft <= 2 * 60 * 60 * 1000) { // 2 hours left
          status = 'ENDING_SOON'
        }

        console.log('🤖 AI Price for', vehicle.title, ':', {
          estimated: priceEstimation.estimatedPrice.toLocaleString('no-NO'),
          confidence: priceEstimation.confidence,
          methodology: priceEstimation.methodology
        })

        return {
          id: vehicle.id,
          title: vehicle.title,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          location: vehicle.location,
          
          // AI-powered pricing
          estimatedPrice: priceEstimation.estimatedPrice,
          priceRange: priceEstimation.priceRange,
          priceConfidence: priceEstimation.confidence,
          pricingMethodology: priceEstimation.methodology,
          marketTrend: priceEstimation.marketTrend,
          priceFactors: priceEstimation.factors,
          
          // Auction data
          currentBid,
          bidCount,
          startingPrice: Math.floor(priceEstimation.estimatedPrice * 0.7), // 70% of estimated
          endDate: endDate.toISOString(),
          status,
          
          // User-specific data
          myBid: userBid,
          isWinning,
          
          // Vehicle specs
          vehicleSpec: {
            make: vehicle.make,
            model: vehicle.model,
            variant: vehicle.variant,
            year: vehicle.year,
            mileage: vehicle.mileage,
            fuelType: vehicle.fuelType,
            transmission: vehicle.transmission,
            condition: vehicle.condition,
            features: vehicle.features
          },
          
          // Seller info
          seller: vehicle.seller,
          
          // Timestamps
          createdAt: createdAt.toISOString(),
          updatedAt: new Date().toISOString()
        }
      } catch (error) {
        console.error('❌ AI pricing failed for', vehicle.title, ':', error)
        
        // Fallback to basic pricing
        const fallbackPrice = 400000
        return {
          id: vehicle.id,
          title: vehicle.title,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          location: vehicle.location,
          estimatedPrice: fallbackPrice,
          priceRange: { min: fallbackPrice * 0.8, max: fallbackPrice * 1.2 },
          priceConfidence: 'LOW' as const,
          pricingMethodology: 'BASIC_ALGORITHM' as const,
          marketTrend: 'STABLE' as const,
          currentBid: null,
          bidCount: 0,
          startingPrice: fallbackPrice * 0.7,
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'ACTIVE' as const,
          myBid: null,
          isWinning: false,
          vehicleSpec: vehicle,
          seller: vehicle.seller,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    })
  )

  // Sort by status and creation date
  return auctionsWithAI.sort((a, b) => {
    // Active auctions first, then ending soon, then ended
    const statusOrder = { 'ACTIVE': 0, 'ENDING_SOON': 1, 'ENDED': 2 }
    const statusDiff = statusOrder[a.status] - statusOrder[b.status]
    
    if (statusDiff !== 0) return statusDiff
    
    // Within same status, newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}
