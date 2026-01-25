import { NextRequest } from 'next/server'

export interface SecurityConfig {
  requireHttps: boolean
  allowedOrigins: string[]
  maxRequestSize: number
}

export function getSecurityConfig(): SecurityConfig {
  const isProd = process.env.NODE_ENV === 'production'
  
  return {
    requireHttps: isProd,
    allowedOrigins: isProd 
      ? [
          'https://www.kulbruk.no',
          'https://kulbruk.no',
          process.env.NEXT_PUBLIC_BASE_URL || '',
        ].filter(Boolean)
      : ['http://localhost:3008', 'http://localhost:3000'],
    maxRequestSize: 10 * 1024 * 1024,
  }
}

export function validateRequestOrigin(req: NextRequest): boolean {
  const config = getSecurityConfig()
  const origin = req.headers.get('origin')
  
  if (!origin) return true
  
  return config.allowedOrigins.some(allowed => origin.startsWith(allowed))
}

export function enforceHttps(req: NextRequest): boolean {
  const config = getSecurityConfig()
  
  if (!config.requireHttps) return true
  
  const proto = req.headers.get('x-forwarded-proto')
  return proto === 'https'
}
