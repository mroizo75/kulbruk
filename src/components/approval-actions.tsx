'use client'

import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ApprovalActionsProps {
  listingId: string
}

export default function ApprovalActions({ listingId }: ApprovalActionsProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const router = useRouter()

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      const response = await fetch(`/api/admin/listings/${listingId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Kunne ikke godkjenne annonse')
      }

      toast.success('Annonse godkjent!')
      router.refresh()
      
    } catch (error: any) {
      console.error('Feil ved godkjenning:', error)
      toast.error(error.message || 'Kunne ikke godkjenne annonse')
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    setIsRejecting(true)
    try {
      const response = await fetch(`/api/admin/listings/${listingId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Kunne ikke avslå annonse')
      }

      toast.success('Annonse avslått')
      router.refresh()
      
    } catch (error: any) {
      console.error('Feil ved avslag:', error)
      toast.error(error.message || 'Kunne ikke avslå annonse')
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={handleApprove}
        disabled={isApproving || isRejecting}
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white w-full"
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        {isApproving ? 'Godkjenner...' : 'Godkjenn'}
      </Button>
      
      <Button 
        onClick={handleReject}
        disabled={isApproving || isRejecting}
        variant="destructive"
        size="sm"
        className="w-full"
      >
        <XCircle className="h-4 w-4 mr-2" />
        {isRejecting ? 'Avslår...' : 'Avslå'}
      </Button>
    </div>
  )
}