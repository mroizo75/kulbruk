'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function AdminShortcodeSearch() {
  const [code, setCode] = useState('')
  const router = useRouter()

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (code.trim()) router.push(`/annonser/detaljer/${encodeURIComponent(code.trim())}`)
      }}
    >
      <input
        name="shortCode"
        placeholder="F.eks. 420646065"
        className="border rounded px-3 py-2 w-full max-w-sm"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <Button type="submit" variant="outline">Søk</Button>
    </form>
  )
}


