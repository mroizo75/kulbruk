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

  // Hvis ingen headers, returner error (skip validering for test)
  if (!svix_id || !svix_timestamp || !svix_signature) {
    // Hvis det er en test-webhook, skip validering
    if (svix_id?.startsWith('test_')) {
      console.log('⚠️ Test webhook - skipper signatur validering')
    } else {
      return new Response('Error occured -- no svix headers', {
        status: 400,
      })
    }
  }

  // Hent body
  const payload = await request.json()
  const body = JSON.stringify(payload)

  // Opprett ny Svix instans med secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: any

  // Verifiser webhook (skip for test)
  if (svix_id?.startsWith('test_')) {
    // Test webhook - bruk payload direkte
    evt = payload
    console.log('⚠️ Test webhook - bruker payload direkte')
  } else {
    // Produksjon webhook - valider signatur
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id!,
        'svix-timestamp': svix_timestamp!,
        'svix-signature': svix_signature!,
      }) as any
    } catch (err) {
      console.error('Error verifying webhook:', err)
      return new Response('Error occured', {
        status: 400,
      })
    }
  }

  // Håndter forskjellige event typer
  const { id } = evt.data
  const eventType = evt.type

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`)
  console.log('Webhook body:', body)

  try {
    console.log(`🔄 Prosesserer webhook: ${eventType} for bruker: ${evt.data.id}`)
    
    switch (eventType) {
      case 'user.created':
        // Opprett bruker i database når ny bruker registrerer seg
        const userRole = evt.data.public_metadata?.role || 'customer' // Standard rolle
        
        // Sjekk først om bruker allerede eksisterer (unngå duplikater)
        const existingUser = await prisma.user.findUnique({
          where: { clerkId: evt.data.id }
        })
        
        if (existingUser) {
          console.log('⚠️ Bruker eksisterer allerede:', evt.data.id)
          return new Response('User already exists', { status: 200 })
        }
        
        // Sjekk at vi har nødvendig data for user.created
        if (!evt.data.email_addresses || evt.data.email_addresses.length === 0) {
          console.error('❌ Mangler email_addresses i user.created event')
          return new Response('Missing email data', { status: 400 })
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
        
        // Sjekk at brukeren eksisterer før oppdatering
        const userToUpdate = await prisma.user.findUnique({
          where: { clerkId: evt.data.id }
        })
        
        if (!userToUpdate) {
          console.log('⚠️ Kan ikke oppdatere - bruker finnes ikke:', evt.data.id)
          return new Response('User not found for update', { status: 404 })
        }
        
        await prisma.user.update({
          where: { clerkId: evt.data.id },
          data: {
            email: evt.data.email_addresses?.[0]?.email_address || userToUpdate.email,
            firstName: evt.data.first_name || userToUpdate.firstName,
            lastName: evt.data.last_name || userToUpdate.lastName,
            ...(updatedRole && { role: updatedRole }), // Oppdater rolle hvis den finnes
            updatedAt: new Date()
          }
        })
        console.log('✅ Bruker oppdatert i database:', evt.data.id)
        break

      case 'user.deleted':
        // Sjekk om brukeren eksisterer før sletting
        const userToDelete = await prisma.user.findUnique({
          where: { clerkId: evt.data.id }
        })
        
        if (!userToDelete) {
          console.log('⚠️ Kan ikke slette - bruker finnes ikke i database:', evt.data.id)
          return new Response('User not found for deletion', { status: 200 }) // 200 fordi det er OK at den ikke finnes
        }
        
        await prisma.user.delete({
          where: { clerkId: evt.data.id }
        })
        console.log('✅ Bruker slettet fra database:', evt.data.id)
        break

      default:
        console.log(`⚠️ Unhandled webhook type: ${eventType}`)
        return new Response(`Unhandled event type: ${eventType}`, { status: 200 })
    }
  } catch (error) {
    console.error('Feil ved håndtering av webhook:', error)
    return new Response('Database error', { status: 500 })
  }

  return new Response('', { status: 200 })
}