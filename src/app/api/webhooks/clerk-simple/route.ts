import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Enkel webhook UTEN svix-verifisering for testing og utvikling
// VIKTIG: I produksjon bør du bruke /api/webhooks/clerk med svix-verifisering
export async function POST(request: NextRequest) {
  console.log('\n🔗 CLERK WEBHOOK KALT:', new Date().toISOString())
  console.log('🌐 Request URL:', request.url)
  console.log('🔍 Headers:', Object.fromEntries(request.headers.entries()))
  
  try {
    // Hent body uten verifisering
    const payload = await request.json()
    console.log('📦 Webhook payload:', JSON.stringify(payload, null, 2))
    
    const eventType = payload.type
    const userData = payload.data
    
    console.log('🎯 Event type:', eventType)
    console.log('👤 User data:', userData?.id, userData?.email_addresses?.[0]?.email_address)

    switch (eventType) {
      case 'user.created':
        console.log('✅ Oppretter bruker i database...')
        
        const userRole = userData.public_metadata?.role || 'customer'
        
        const newUser = await prisma.user.create({
          data: {
            clerkId: userData.id,
            email: userData.email_addresses[0]?.email_address || '',
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            role: userRole,
            avatar: userData.image_url || null,
            phone: userData.phone_numbers?.[0]?.phone_number || null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        
        console.log('🎉 Bruker opprettet i database:', newUser.id, 'Clerk ID:', newUser.clerkId)
        break

      case 'user.updated':
        console.log('🔄 Oppdaterer bruker i database...')
        
        const updatedRole = userData.public_metadata?.role
        
        const updatedUser = await prisma.user.updateMany({
          where: { clerkId: userData.id },
          data: {
            email: userData.email_addresses[0]?.email_address || '',
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            avatar: userData.image_url || null,
            phone: userData.phone_numbers?.[0]?.phone_number || null,
            ...(updatedRole && { role: updatedRole }),
            updatedAt: new Date()
          }
        })
        
        console.log('🔄 Bruker oppdatert i database:', userData.id, 'Rows affected:', updatedUser.count)
        break

      case 'user.deleted':
        console.log('🗑️ Sletter bruker fra database...')
        
        const deletedUser = await prisma.user.deleteMany({
          where: { clerkId: userData.id }
        })
        
        console.log('🗑️ Bruker slettet fra database:', userData.id, 'Rows affected:', deletedUser.count)
        break

      default:
        console.log('❓ Ukjent webhook type:', eventType)
    }

    console.log('✅ Webhook behandlet uten feil\n')
    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('❌ WEBHOOK FEIL:', error)
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'Unknown error')
    
    // Returner 200 likevel for å unngå retry
    return new Response('Error logged', { status: 200 })
  }
}

// GET for testing
export async function GET() {
  return NextResponse.json({
    message: 'Clerk webhook endpoint (simple) - kun POST tillatt',
    status: 'active',
    timestamp: new Date().toISOString()
  })
}