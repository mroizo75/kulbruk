import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { estimateVehiclePrice } from '@/lib/ai-price-estimation'

const prisma = new PrismaClient()

// Store active connections for live updates
const liveConnections = new Map<string, WritableStreamDefaultController<Uint8Array>>()

export async function GET(request: NextRequest) {
  const { userId } = auth()
  const user = await currentUser()

  if (!userId && !user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Sjekk business tilgang
  const businessUser = await prisma.user.findUnique({
    where: { clerkId: user?.id || userId },
    select: { role: true, companyName: true, id: true }
  })

  if (!businessUser || businessUser.role !== 'business') {
    return new NextResponse('Forbidden - Business access required', { status: 403 })
  }

  console.log('🔗 New live auction connection from:', businessUser.companyName)

  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  }

  const stream = new ReadableStream({
    start(controller) {
      const connectionId = `${businessUser.id}_${Date.now()}`
      liveConnections.set(connectionId, controller)

      console.log('✅ Live auction connection established:', connectionId)

      // Send initial connection confirmation
      const welcome = {
        type: 'CONNECTION_ESTABLISHED',
        message: 'Live auction feed connected',
        timestamp: new Date().toISOString(),
        connectionId
      }

      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(welcome)}\n\n`))

      // Send heartbeat every 30 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = {
            type: 'HEARTBEAT',
            timestamp: new Date().toISOString()
          }
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(heartbeat)}\n\n`))
        } catch (error) {
          console.log('❌ Heartbeat failed, cleaning up connection:', connectionId)
          clearInterval(heartbeatInterval)
          liveConnections.delete(connectionId)
        }
      }, 30000)

      // Simulate live auction updates every 15 seconds (for demo)
      const updateInterval = setInterval(async () => {
        try {
          await simulateLiveAuctionUpdate(controller, businessUser.id)
        } catch (error) {
          console.error('❌ Simulation error:', error)
          clearInterval(updateInterval)
          liveConnections.delete(connectionId)
        }
      }, 15000)

      // Cleanup on connection close
      request.signal.onabort = () => {
        console.log('🔌 Live auction connection closed:', connectionId)
        clearInterval(heartbeatInterval)
        clearInterval(updateInterval)
        liveConnections.delete(connectionId)
      }
    },

    cancel() {
      console.log('📡 Live auction stream cancelled')
    }
  })

  return new NextResponse(stream, { headers })
}

// Simulate live auction updates for demo
async function simulateLiveAuctionUpdate(
  controller: WritableStreamDefaultController<Uint8Array>, 
  businessUserId: string
) {
  const updateTypes = ['NEW_AUCTION', 'BID_UPDATE', 'AUCTION_ENDING', 'PRICE_UPDATE']
  const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)]

  console.log('📡 Simulating live update:', randomType)

  let update: any

  switch (randomType) {
    case 'NEW_AUCTION':
      update = await generateNewAuctionUpdate()
      break
    case 'BID_UPDATE':
      update = generateBidUpdate()
      break
    case 'AUCTION_ENDING':
      update = generateAuctionEndingUpdate()
      break
    case 'PRICE_UPDATE':
      update = await generatePriceUpdate()
      break
  }

  if (update) {
    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(update)}\n\n`))
  }
}

async function generateNewAuctionUpdate() {
  const vehicles = [
    { make: 'BMW', model: 'X5 xDrive40i', year: 2021, mileage: 35000, location: 'Oslo' },
    { make: 'Audi', model: 'A6 Avant', year: 2020, mileage: 45000, location: 'Bergen' },
    { make: 'Mercedes-Benz', model: 'E-Class', year: 2022, mileage: 28000, location: 'Trondheim' },
    { make: 'Tesla', model: 'Model S', year: 2021, mileage: 40000, location: 'Stavanger' },
    { make: 'Volvo', model: 'XC90', year: 2020, mileage: 55000, location: 'Kristiansand' }
  ]

  const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)]
  
  // Get AI price estimation
  let estimatedPrice = 450000 // fallback
  try {
    const estimation = await estimateVehiclePrice({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      mileage: vehicle.mileage,
      fuelType: 'Bensin',
      transmission: 'Automat',
      condition: 'GOOD',
      location: vehicle.location
    })
    estimatedPrice = estimation.estimatedPrice
  } catch (error) {
    console.error('AI price estimation failed, using fallback:', error)
  }

  const auctionId = `auction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

  return {
    type: 'NEW_AUCTION',
    auction: {
      id: auctionId,
      title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      location: vehicle.location,
      estimatedPrice,
      currentBid: null,
      bidCount: 0,
      endDate: endDate.toISOString(),
      status: 'ACTIVE',
      seller: {
        firstName: 'Lars',
        lastName: 'Hansen'
      }
    }
  }
}

function generateBidUpdate() {
  const auctionIds = ['auction_1', 'auction_2', 'auction_3']
  const auctionId = auctionIds[Math.floor(Math.random() * auctionIds.length)]
  
  const previousBid = Math.floor(Math.random() * 200000) + 300000
  const newBid = previousBid + Math.floor(Math.random() * 50000) + 5000
  
  return {
    type: 'BID_UPDATE',
    auction: {
      id: auctionId,
      title: '2020 BMW X5 xDrive40i',
      currentBid: newBid,
      bidCount: Math.floor(Math.random() * 10) + 1,
      isWinning: Math.random() > 0.7, // 30% chance user is winning
      myBid: Math.random() > 0.5 ? newBid - 10000 : null
    },
    previousBid,
    newBid,
    bidder: 'Konkurrent AS'
  }
}

function generateAuctionEndingUpdate() {
  const timeOptions = ['2 timer', '1 time', '30 minutter', '15 minutter']
  const timeLeft = timeOptions[Math.floor(Math.random() * timeOptions.length)]
  
  return {
    type: 'AUCTION_ENDING',
    auction: {
      id: 'auction_ending_1',
      title: '2019 Audi A6 Avant',
      status: 'ENDING_SOON',
      isWinning: Math.random() > 0.5,
      myBid: 350000,
      currentBid: 365000
    },
    timeLeft
  }
}

async function generatePriceUpdate() {
  // Simulate AI-powered price re-estimation
  const priceChange = (Math.random() - 0.5) * 20000 // ±10k change
  const newPrice = 450000 + priceChange
  
  return {
    type: 'PRICE_UPDATE',
    auction: {
      id: 'auction_price_1',
      title: '2021 Tesla Model 3',
      estimatedPrice: Math.round(newPrice)
    },
    priceChange: Math.round(priceChange),
    reason: priceChange > 0 ? 'Markedet stiger' : 'Markedet synker'
  }
}

// Function to broadcast updates to all connected businesses
export function broadcastToBusinesses(update: any) {
  console.log('📢 Broadcasting to', liveConnections.size, 'business connections')
  
  liveConnections.forEach((controller, connectionId) => {
    try {
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(update)}\n\n`))
    } catch (error) {
      console.error('❌ Failed to send to connection:', connectionId, error)
      liveConnections.delete(connectionId)
    }
  })
}

// Function to get connection count
export function getActiveConnectionCount(): number {
  return liveConnections.size
}
