import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  // Hent webhook secret fra miljø
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Legg til CLERK_WEBHOOK_SECRET til .env.local')
  }

  // Hent headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // Hvis ingen headers, returner error
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Hent body
  const payload = await request.json()
  const body = JSON.stringify(payload)

  // Opprett ny Svix instans med secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: any

  // Verifiser webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Håndter forskjellige event typer
  const { id } = evt.data
  const eventType = evt.type

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`)
  console.log('Webhook body:', body)

  try {
    switch (eventType) {
      case 'user.created':
        // Opprett bruker i database når ny bruker registrerer seg
        const userRole = evt.data.public_metadata?.role || 'customer' // Standard rolle
        
        // Sjekk først om bruker allerede eksisterer (unngå duplikater)
        const existingUser = await prisma.user.findUnique({
          where: { clerkId: evt.data.id }
        })
        
        if (existingUser) {
          console.log('Bruker eksisterer allerede:', evt.data.id)
          break
        }
        
        const newUser = await prisma.user.create({
          data: {
            clerkId: evt.data.id,
            email: evt.data.email_addresses[0]?.email_address || '',
            firstName: evt.data.first_name || '',
            lastName: evt.data.last_name || '',
            role: userRole,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        console.log('✅ Bruker opprettet i database via webhook:', newUser.id, 'med rolle:', userRole)
        break

      case 'user.updated':
        // Oppdater bruker i database
        const updatedRole = evt.data.public_metadata?.role
        
        await prisma.user.updateMany({
          where: { clerkId: evt.data.id },
          data: {
            email: evt.data.email_addresses[0]?.email_address || '',
            firstName: evt.data.first_name || '',
            lastName: evt.data.last_name || '',
            ...(updatedRole && { role: updatedRole }), // Oppdater rolle hvis den finnes
            updatedAt: new Date()
          }
        })
        console.log('Bruker oppdatert i database:', evt.data.id)
        break

      case 'user.deleted':
        // Slett bruker fra database
        await prisma.user.deleteMany({
          where: { clerkId: evt.data.id }
        })
        console.log('Bruker slettet fra database:', evt.data.id)
        break

      default:
        console.log(`Unhandled webhook type: ${eventType}`)
    }
  } catch (error) {
    console.error('Feil ved håndtering av webhook:', error)
    return new Response('Database error', { status: 500 })
  }

  return new Response('', { status: 200 })
}