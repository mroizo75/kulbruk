import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Opprett eller oppgrader en bruker til admin via Postman.
// Sikres med ADMIN_SETUP_TOKEN i headers: x-admin-setup-token
export async function POST(request: NextRequest) {
  try {
    const setupToken = request.headers.get('x-admin-setup-token') || ''
    const expected = process.env.ADMIN_SETUP_TOKEN || ''

    if (!expected) {
      return NextResponse.json(
        { error: 'ADMIN_SETUP_TOKEN er ikke satt i miljøvariabler' },
        { status: 500 }
      )
    }

    if (setupToken !== expected) {
      return NextResponse.json(
        { error: 'Ugyldig eller manglende x-admin-setup-token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email, password, firstName, lastName } = body as {
      email?: string
      password?: string
      firstName?: string
      lastName?: string
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-post og passord er påkrevd' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Passord må være minst 6 tegn' },
        { status: 400 }
      )
    }

    const bcrypt = await import('bcryptjs')
    const passwordHash = await bcrypt.hash(password, 12)

    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing) {
      const updated = await prisma.user.update({
        where: { email },
        data: {
          role: 'admin',
          firstName: typeof firstName === 'string' ? firstName : existing.firstName,
          lastName: typeof lastName === 'string' ? lastName : existing.lastName,
          passwordHash,
          updatedAt: new Date(),
        },
        select: { id: true, email: true, role: true, firstName: true, lastName: true },
      })

      return NextResponse.json({ success: true, action: 'updated', user: updated })
    }

    const created = await prisma.user.create({
      data: {
        email,
        name: [firstName, lastName].filter(Boolean).join(' ') || null,
        firstName: firstName || null,
        lastName: lastName || null,
        role: 'admin',
        passwordHash,
        emailVerified: new Date(),
      },
      select: { id: true, email: true, role: true, firstName: true, lastName: true },
    })

    return NextResponse.json({ success: true, action: 'created', user: created })
  } catch (error) {
    console.error('create-admin error:', error)
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 })
  }
}


