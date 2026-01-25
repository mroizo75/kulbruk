import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validatePassword, validateEmail, sanitizeString } from '@/lib/validation'
import { applyRateLimit } from '@/lib/rate-limit'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await applyRateLimit(request, 3, 3600000)
    if (rateLimitResult) return rateLimitResult

    const setupToken = request.headers.get('x-admin-setup-token') || ''
    const expected = process.env.ADMIN_SETUP_TOKEN || ''

    if (!expected || expected.length < 32) {
      return NextResponse.json(
        { error: 'ADMIN_SETUP_TOKEN er ikke konfigurert korrekt' },
        { status: 500 }
      )
    }

    const tokenMatch = crypto.timingSafeEqual(
      Buffer.from(setupToken),
      Buffer.from(expected)
    )

    if (!tokenMatch) {
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

    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Passord oppfyller ikke sikkerhetskravene',
          details: passwordValidation.errors 
        },
        { status: 400 }
      )
    }

    const bcrypt = await import('bcryptjs')
    const passwordHash = await bcrypt.hash(password, 12)

    const normalizedEmail = email.toLowerCase().trim()
    const sanitizedFirstName = firstName ? sanitizeString(firstName, 50) : null
    const sanitizedLastName = lastName ? sanitizeString(lastName, 50) : null

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    if (existing) {
      const updated = await prisma.user.update({
        where: { email: normalizedEmail },
        data: {
          role: 'admin',
          firstName: sanitizedFirstName || existing.firstName,
          lastName: sanitizedLastName || existing.lastName,
          passwordHash,
          updatedAt: new Date(),
        },
        select: { id: true, email: true, role: true, firstName: true, lastName: true },
      })

      return NextResponse.json({ success: true, action: 'updated', user: updated })
    }

    const created = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: [sanitizedFirstName, sanitizedLastName].filter(Boolean).join(' ') || null,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        role: 'admin',
        passwordHash,
        emailVerified: new Date(),
      },
      select: { id: true, email: true, role: true, firstName: true, lastName: true },
    })

    return NextResponse.json({ success: true, action: 'created', user: created })
  } catch (error) {
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 })
  }
}


