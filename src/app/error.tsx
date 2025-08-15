'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{ maxWidth: 720, margin: '64px auto', padding: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Noe gikk galt</h1>
          <p style={{ marginBottom: 16 }}>Vi fikk en uventet feil. Prøv igjen, eller gå tilbake til forrige side.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => reset()} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}>Prøv igjen</button>
            <Link href="/" style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}>Til forsiden</Link>
          </div>
          {error?.digest && (
            <p style={{ marginTop: 16, color: '#888', fontSize: 12 }}>Feilkode: {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  )
}

