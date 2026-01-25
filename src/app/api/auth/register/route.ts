import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { validatePassword, validateEmail, sanitizeString } from '@/lib/validation'
import { applyRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await applyRateLimit(request, 5, 60000)
    if (rateLimitResult) return rateLimitResult

    const { name, email, password, role } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Navn, e-post og passord er påkrevd' }, { status: 400 })
    }

    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ 
        error: 'Passord oppfyller ikke sikkerhetskravene',
        details: passwordValidation.errors 
      }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (existing) {
      return NextResponse.json({ error: 'E-post er allerede i bruk' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    
    const sanitizedName = sanitizeString(name, 100)
    const [firstName, ...rest] = sanitizedName.split(' ')
    const lastName = rest.join(' ') || null

    await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: sanitizedName,
        firstName: firstName || null,
        lastName,
        passwordHash,
        role: role === 'business' ? 'business' : 'customer',
        emailVerified: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Kunne ikke registrere bruker' }, { status: 500 })
  }
}


