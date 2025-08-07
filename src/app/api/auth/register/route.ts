import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Navn, e-post og passord er påkrevd' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'E-post er allerede i bruk' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const [firstName, ...rest] = name.trim().split(' ')
    const lastName = rest.join(' ') || null

    await prisma.user.create({
      data: {
        email,
        name,
        firstName: firstName || null,
        lastName,
        passwordHash,
        role: role === 'business' ? 'business' : 'customer',
        emailVerified: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Registreringsfeil:', error)
    return NextResponse.json({ error: 'Kunne ikke registrere bruker' }, { status: 500 })
  }
}


