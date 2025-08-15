'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'

export default function AdminDeleteListingButton({ listingId }: { listingId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)

  const doDelete = async () => {
    if (!confirm('Er du sikker på at du vil slette denne annonsen?')) return
    try {
      setBusy(true)
      const res = await fetch(`/api/admin/listings/${encodeURIComponent(listingId)}/delete`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data?.error || 'Sletting feilet')
        return
      }
      startTransition(() => router.refresh())
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button variant="outline" size="sm" className="w-full text-red-600 hover:text-red-700" onClick={doDelete} disabled={busy || isPending}>
      <Trash2 className="h-4 w-4 mr-2" />{busy || isPending ? 'Sletter…' : 'Slett'}
    </Button>
  )
}


