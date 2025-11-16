'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-8">
          <div className="max-w-md w-full space-y-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Noe gikk galt</h1>
            <p className="text-gray-600">
              En uventet feil oppstod. Vi har blitt varslet og jobber med å fikse problemet.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <p className="text-sm font-semibold text-red-900 mb-2">Feilmelding:</p>
                <p className="text-xs text-red-800 font-mono">{error.message}</p>
                {error.digest && (
                  <p className="text-xs text-red-600 mt-2">Digest: {error.digest}</p>
                )}
              </div>
            )}
            <div className="flex gap-3 justify-center mt-6">
              <Button onClick={reset} className="bg-green-600 hover:bg-green-700">
                Prøv igjen
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Gå til forsiden
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

