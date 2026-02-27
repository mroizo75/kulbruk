'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const SUPPORT_SESSION_COOKIE = 'kulbruk_support_session'
const COOKIE_MAX_AGE_DAYS = 1

function setSupportSessionCookie(value: string) {
  const maxAge = COOKIE_MAX_DAYS * 24 * 60 * 60
  document.cookie = `${SUPPORT_SESSION_COOKIE}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export function SupportSessionInitializer() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const sessionId = searchParams?.get('supportSession')
    if (!sessionId || !sessionId.startsWith('SUPPORT-')) return
    setSupportSessionCookie(sessionId)
  }, [searchParams])

  return null
}
