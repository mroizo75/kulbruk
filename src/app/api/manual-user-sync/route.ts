import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Hent ALLE Clerk brukere og sync dem til DB
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starter manuell synkronisering av alle Clerk brukere...')
    
    const client = await clerkClient()
    
    // Hent alle brukere fra Clerk (pagination støttes automatisk)
    const clerkUsers = await client.users.getUserList({ limit: 100 })
    
    console.log(`📊 Fant ${clerkUsers.totalCount} brukere i Clerk`)
    
    const results = []
    
    for (const clerkUser of clerkUsers.data) {
      try {
        console.log(`👤 Prosesserer bruker: ${clerkUser.id} - ${clerkUser.emailAddresses[0]?.emailAddress}`)
        
        // Sjekk om bruker finnes i DB
        const existingUser = await prisma.user.findUnique({
          where: { clerkId: clerkUser.id }
        })
        
        const userRole = clerkUser.publicMetadata?.role as string || 'customer'
        
        if (existingUser) {
          // Oppdater eksisterende bruker
          const updatedUser = await prisma.user.update({
            where: { clerkId: clerkUser.id },
            data: {
              email: clerkUser.emailAddresses[0]?.emailAddress || '',
              firstName: clerkUser.firstName || '',
              lastName: clerkUser.lastName || '',
              role: userRole,
              avatar: clerkUser.imageUrl,
              phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
              updatedAt: new Date()
            }
          })
          results.push({ action: 'updated', clerkId: clerkUser.id, dbId: updatedUser.id })
          console.log(`✅ Oppdatert: ${clerkUser.id}`)
        } else {
          // Opprett ny bruker
          const newUser = await prisma.user.create({
            data: {
              clerkId: clerkUser.id,
              email: clerkUser.emailAddresses[0]?.emailAddress || '',
              firstName: clerkUser.firstName || '',
              lastName: clerkUser.lastName || '',
              role: userRole,
              avatar: clerkUser.imageUrl,
              phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
          results.push({ action: 'created', clerkId: clerkUser.id, dbId: newUser.id })
          console.log(`🆕 Opprettet: ${clerkUser.id}`)
        }
      } catch (userError) {
        console.error(`❌ Feil med bruker ${clerkUser.id}:`, userError)
        results.push({ action: 'error', clerkId: clerkUser.id, error: userError instanceof Error ? userError.message : 'Ukjent feil' })
      }
    }
    
    // Oppsummering
    const created = results.filter(r => r.action === 'created').length
    const updated = results.filter(r => r.action === 'updated').length
    const errors = results.filter(r => r.action === 'error').length
    
    console.log(`🎉 Synkronisering fullført: ${created} opprettet, ${updated} oppdatert, ${errors} feil`)
    
    return NextResponse.json({
      success: true,
      message: `Synkroniserte ${clerkUsers.totalCount} brukere fra Clerk`,
      summary: {
        total: clerkUsers.totalCount,
        created,
        updated,
        errors
      },
      details: results
    })
    
  } catch (error) {
    console.error('❌ Feil ved manuell synkronisering:', error)
    return NextResponse.json({
      success: false,
      error: 'Kunne ikke synkronisere brukere',
      details: error instanceof Error ? error.message : 'Ukjent feil'
    }, { status: 500 })
  }
}

// GET - Vis status
export async function GET() {
  try {
    const client = await clerkClient()
    const clerkUsers = await client.users.getUserList({ limit: 1 })
    const dbUsers = await prisma.user.count()
    
    return NextResponse.json({
      clerk: {
        total: clerkUsers.totalCount,
        message: `${clerkUsers.totalCount} brukere i Clerk`
      },
      database: {
        total: dbUsers,
        message: `${dbUsers} brukere i database`
      },
      sync: {
        needed: clerkUsers.totalCount !== dbUsers,
        message: clerkUsers.totalCount === dbUsers ? 
          'Antall stemmer overens' : 
          `${Math.abs(clerkUsers.totalCount - dbUsers)} brukere mangler synkronisering`
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Kunne ikke hente status',
      details: error instanceof Error ? error.message : 'Ukjent feil'
    }, { status: 500 })
  }
}