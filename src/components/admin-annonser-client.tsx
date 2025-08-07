'use client'

import { useAutoRefresh } from '@/hooks/use-auto-refresh'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AdminAnnonserClientProps {
  pendingCount: number
}

export default function AdminAnnonserClient({ pendingCount }: AdminAnnonserClientProps) {
  const { lastRefresh, isRefreshing, refreshPage } = useAutoRefresh(30000, true)

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('no-NO', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></div>
          <span className="text-sm font-medium text-blue-800">
            Live oppdatering aktiv
          </span>
        </div>
        
        <div className="text-sm text-blue-600">
          Sist oppdatert: {formatTime(lastRefresh)}
        </div>

        {pendingCount > 0 && (
          <Badge variant="destructive" className="animate-pulse">
            {pendingCount} ventende annonser
          </Badge>
        )}
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        onClick={refreshPage}
        disabled={isRefreshing}
        className="border-blue-300 text-blue-700 hover:bg-blue-100"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Oppdaterer...' : 'Oppdater nå'}
      </Button>
    </div>
  )
}