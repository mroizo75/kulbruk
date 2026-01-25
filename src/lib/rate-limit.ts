import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  interval: number
  uniqueTokenPerInterval: number
}

interface RateLimitStore {
  [key: string]: number[]
}

const store: RateLimitStore = {}

export function rateLimit(config: RateLimitConfig = { interval: 60000, uniqueTokenPerInterval: 100 }) {
  const { interval, uniqueTokenPerInterval } = config

  return {
    check: (identifier: string, limit: number): { success: boolean; remaining: number } => {
      const now = Date.now()
      const windowStart = now - interval

      if (!store[identifier]) {
        store[identifier] = []
      }

      store[identifier] = store[identifier].filter(timestamp => timestamp > windowStart)

      if (store[identifier].length >= limit) {
        return {
          success: false,
          remaining: 0,
        }
      }

      store[identifier].push(now)

      return {
        success: true,
        remaining: limit - store[identifier].length,
      }
    },
  }
}

export function getIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'
  return ip
}

export function rateLimitMiddleware(limit: number = 10, interval: number = 60000) {
  const limiter = rateLimit({ interval, uniqueTokenPerInterval: 500 })

  return (req: NextRequest): NextResponse | null => {
    const identifier = getIdentifier(req)
    const result = limiter.check(identifier, limit)

    if (!result.success) {
      return NextResponse.json(
        { error: 'For mange forespørsler. Prøv igjen senere.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'Retry-After': (interval / 1000).toString(),
          },
        }
      )
    }

    return null
  }
}

export async function applyRateLimit(
  req: NextRequest,
  limit: number = 10,
  interval: number = 60000
): Promise<NextResponse | null> {
  const middleware = rateLimitMiddleware(limit, interval)
  return middleware(req)
}
