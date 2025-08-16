'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SmartCustomerRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Sjekk om det er en lagret redirect URL for kunder
    const postLoginRedirect = localStorage.getItem('postLoginRedirect')
    
    if (postLoginRedirect && postLoginRedirect !== '/dashboard') {
      // Fjern fra localStorage
      localStorage.removeItem('postLoginRedirect')
      
      // Redirect til original side
      router.replace(postLoginRedirect)
    } else {
      // Ingen spesifikk redirect - bare bli på kunde dashboard
      router.replace('/dashboard/customer')
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Sender deg tilbake...</p>
      </div>
    </div>
  )
}
