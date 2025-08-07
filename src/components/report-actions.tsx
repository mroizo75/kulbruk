'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Flag, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ReportActionsProps {
  reportId: string
  listingId: string
  severity: string
}

export default function ReportActions({ reportId, listingId, severity }: ReportActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleAction = async (action: 'resolve' | 'dismiss' | 'escalate') => {
    setIsProcessing(true)
    
    try {
      // Mock API call - implementer ekte API senere
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      switch (action) {
        case 'resolve':
          toast.success('Rapport markert som løst')
          break
        case 'dismiss':
          toast.success('Rapport avvist')
          break
        case 'escalate':
          toast.success('Rapport eskalert til høy prioritet')
          break
      }
      
      router.refresh()
      
    } catch (error) {
      toast.error('Kunne ikke behandle rapport')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemoveListing = async () => {
    if (!confirm('Er du sikker på at du vil fjerne denne annonsen?')) {
      return
    }

    setIsProcessing(true)
    
    try {
      // Mock API call til å fjerne annonsen
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Annonse fjernet og rapport løst')
      router.refresh()
    } catch (error) {
      toast.error('Kunne ikke fjerne annonse')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isProcessing}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Behandle rapport</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => handleAction('resolve')}
          disabled={isProcessing}
          className="cursor-pointer"
        >
          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
          Marker som løst
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleAction('dismiss')}
          disabled={isProcessing}
          className="cursor-pointer"
        >
          <XCircle className="h-4 w-4 mr-2 text-gray-600" />
          Avvis rapport
        </DropdownMenuItem>
        
        {severity !== 'HIGH' && (
          <DropdownMenuItem
            onClick={() => handleAction('escalate')}
            disabled={isProcessing}
            className="cursor-pointer"
          >
            <Flag className="h-4 w-4 mr-2 text-red-600" />
            Eskaler til høy prioritet
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={handleRemoveListing}
          disabled={isProcessing}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Fjern annonse
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}