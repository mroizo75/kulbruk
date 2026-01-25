import { NextRequest, NextResponse } from 'next/server'

const MIN_PASSWORD_LENGTH = 12
const PASSWORD_REGEX = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
}

export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Passord må være minst ${MIN_PASSWORD_LENGTH} tegn`)
  }

  if (!PASSWORD_REGEX.uppercase.test(password)) {
    errors.push('Passord må inneholde minst én stor bokstav')
  }

  if (!PASSWORD_REGEX.lowercase.test(password)) {
    errors.push('Passord må inneholde minst én liten bokstav')
  }

  if (!PASSWORD_REGEX.number.test(password)) {
    errors.push('Passord må inneholde minst ett tall')
  }

  if (!PASSWORD_REGEX.special.test(password)) {
    errors.push('Passord må inneholde minst ett spesialtegn')
  }

  const commonPasswords = [
    'password', 'passord', '123456', 'qwerty', 'abc123', 
    'password123', 'admin', 'letmein', 'welcome', '12345678'
  ]
  
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Passord er for vanlig eller lett å gjette')
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  const checks = [
    password.length >= MIN_PASSWORD_LENGTH,
    PASSWORD_REGEX.uppercase.test(password),
    PASSWORD_REGEX.lowercase.test(password),
    PASSWORD_REGEX.number.test(password),
    PASSWORD_REGEX.special.test(password),
  ].filter(Boolean).length

  if (checks >= 5 && password.length >= 16) strength = 'strong'
  else if (checks >= 4 && password.length >= MIN_PASSWORD_LENGTH) strength = 'medium'

  return {
    valid: errors.length === 0,
    errors,
    strength,
  }
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email) {
    return { valid: false, error: 'E-post er påkrevd' }
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Ugyldig e-postformat' }
  }

  if (email.length > 254) {
    return { valid: false, error: 'E-post er for lang' }
  }

  const disposableDomains = [
    '10minutemail.com', 'guerrillamail.com', 'tempmail.com',
    'throwaway.email', 'mailinator.com'
  ]
  
  const domain = email.split('@')[1]?.toLowerCase()
  if (domain && disposableDomains.includes(domain)) {
    return { valid: false, error: 'Engangsepost er ikke tillatt' }
  }

  return { valid: true }
}

export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input) return ''
  
  let sanitized = input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, '') // Fjern potensielle HTML tags
  
  return sanitized
}

export function validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
  if (!phone) return { valid: true } // Valgfritt felt
  
  const phoneRegex = /^[\d\s\+\-\(\)]+$/
  
  if (!phoneRegex.test(phone)) {
    return { valid: false, error: 'Ugyldig telefonnummer format' }
  }
  
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 8 || digits.length > 15) {
    return { valid: false, error: 'Telefonnummer må ha 8-15 siffer' }
  }
  
  return { valid: true }
}

export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url) return { valid: true }
  
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL må bruke http eller https' }
    }
    return { valid: true }
  } catch {
    return { valid: false, error: 'Ugyldig URL format' }
  }
}
