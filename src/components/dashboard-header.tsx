import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Shield, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
  userRole?: 'customer' | 'admin' | 'moderator' | 'business'
}

export default function DashboardHeader({ userRole = 'customer' }: DashboardHeaderProps) {
  const [unread, setUnread] = useState<number | null>(null)
  useEffect(() => {
    let active = true
    fetch('/api/messages/unread-count')
      .then(r => r.ok ? r.json() : { count: 0 })
      .then(d => { if (active) setUnread(d.count) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  // Live-oppdater ulest teller via polling for kunder/bedrifter (SSE kun for admin/moderator)
  useEffect(() => {
    if (userRole === 'admin' || userRole === 'moderator') return
    
    // Poll hver 30 sekund i stedet for SSE
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/messages/unread-count')
        if (response.ok) {
          const data = await response.json()
          setUnread(data.count || 0)
        }
      } catch (error) {
        console.log('Kunne ikke hente uleste meldinger')
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [userRole])
  const getRoleDisplay = () => {
    switch (userRole) {
      case 'admin':
        return { text: 'Admin Panel', icon: <Shield className="h-4 w-4" />, color: 'text-red-600' }
      case 'business':
        return { text: 'Bedriftspanel', icon: null, color: 'text-blue-600' }
      default:
        return { text: 'Dashboard', icon: null, color: 'text-gray-600' }
    }
  }

  const roleDisplay = getRoleDisplay()

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo og rolle */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              K
            </div>
            <span className="text-xl font-bold text-gray-900">Kulbruk.no</span>
          </Link>
          
          <div className="hidden sm:flex items-center space-x-2">
            <span className="text-gray-300">|</span>
            <div className={`flex items-center space-x-1 ${roleDisplay.color}`}>
              {roleDisplay.icon}
              <span className="text-sm font-medium">{roleDisplay.text}</span>
            </div>
          </div>
        </div>

        {/* Navigasjon */}
        <div className="flex items-center space-x-4">
          {typeof unread === 'number' && unread > 0 && (
            <div className="text-sm text-blue-600">Uleste meldinger: {unread}</div>
          )}
          <Link href="/" className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Tilbake til forsiden</span>
            <span className="sm:hidden">Forside</span>
          </Link>
        </div>
      </div>
    </div>
  )
}