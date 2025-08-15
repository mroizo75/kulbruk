import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ maxWidth: 720, margin: '64px auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Siden ble ikke funnet</h1>
      <p style={{ marginBottom: 16 }}>Beklager, vi finner ikke siden du leter etter.</p>
      <Link href="/" style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}>Til forsiden</Link>
    </div>
  )
}

