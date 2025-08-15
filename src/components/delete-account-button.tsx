'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

export default function DeleteAccountButton() {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    const ok = confirm('Er du sikker på at du vil slette kontoen? Dette kan ikke angres.')
    if (!ok) return
    
    setIsDeleting(true)
    try {
      const res = await fetch('/api/user/delete-account', { method: 'POST' })
      if (res.ok) {
        // Vis toast og redirect hjem
        if (typeof window !== 'undefined') {
          try { (window as any).sonner?.toast?.success?.('Kontoen er slettet') } catch {}
        }
        window.location.href = '/sign-out?callbackUrl=/'
      } else {
        alert('Kunne ikke slette kontoen. Prøv igjen senere.')
      }
    } catch {
      alert('Nettverksfeil. Prøv igjen senere.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4 mr-2" /> 
      {isDeleting ? 'Sletter...' : 'Slett konto'}
    </button>
  )
}
