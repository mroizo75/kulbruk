import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

const SUPPORT_SESSION_COOKIE = 'kulbruk_support_session'
const MAX_REQUEST_BODY_LENGTH = 8000
const MAX_RESPONSE_PREVIEW_LENGTH = 4000

/** Sjekker om support-sesjon er aktiv via cookie */
export function getSupportSessionId(request: NextRequest): string | null {
  const cookie = request.cookies.get(SUPPORT_SESSION_COOKIE)?.value
  if (!cookie || !cookie.startsWith('SUPPORT-')) return null
  return cookie
}

/** Sanitizer request body - fjerner sensitive felt */
function sanitizeBody(body: unknown): string | null {
  if (body === undefined || body === null) return null
  try {
    const parsed = typeof body === 'string' ? JSON.parse(body) : body
    const keysToRedact = ['password', 'token', 'apiKey', 'secret', 'authorization', 'cardNumber', 'cvc']
    const sanitize = (obj: unknown): unknown => {
      if (obj === null || obj === undefined) return obj
      if (Array.isArray(obj)) return obj.map(sanitize)
      if (typeof obj === 'object') {
        const out: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(obj)) {
          const keyLower = k.toLowerCase()
          if (keysToRedact.some((r) => keyLower.includes(r))) {
            out[k] = '[REDACTED]'
          } else {
            out[k] = sanitize(v)
          }
        }
        return out
      }
      return obj
    }
    const sanitized = sanitize(parsed)
    const str = JSON.stringify(sanitized)
    return str.length > MAX_REQUEST_BODY_LENGTH ? str.slice(0, MAX_REQUEST_BODY_LENGTH) + '...[truncated]' : str
  } catch {
    return String(body).slice(0, MAX_REQUEST_BODY_LENGTH)
  }
}

export interface LogHotelRequestParams {
  supportSessionId: string
  path: string
  method: string
  requestBody: unknown
  responseStatus: number
  responseBody: unknown
  durationMs: number
}

/** Logger en hotel API-forespørsel for support-sesjoner. Kjøres asynkront, feil svelges. */
export async function logHotelRequest(params: LogHotelRequestParams): Promise<void> {
  try {
    const responsePreview =
      typeof params.responseBody === 'string'
        ? params.responseBody.slice(0, MAX_RESPONSE_PREVIEW_LENGTH)
        : JSON.stringify(params.responseBody ?? '').slice(0, MAX_RESPONSE_PREVIEW_LENGTH)

    await prisma.hotelRequestLog.create({
      data: {
        supportSessionId: params.supportSessionId,
        path: params.path,
        method: params.method,
        requestBody: sanitizeBody(params.requestBody),
        responseStatus: params.responseStatus,
        responsePreview: responsePreview + (responsePreview.length >= MAX_RESPONSE_PREVIEW_LENGTH ? '...[truncated]' : ''),
        durationMs: params.durationMs,
      },
    })
  } catch {
    // Svelg feil - logging må ikke påvirke vanlig flyt
  }
}
