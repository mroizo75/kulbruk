'use client'

import { useState } from 'react'
import { Bell, X, Eye, CheckCircle, FileText, AlertTriangle, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuHeader,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications'
import Link from 'next/link'

interface AdminNotificationBellProps {
  userRole: string
}

export default function AdminNotificationBell({ userRole }: AdminNotificationBellProps) {
  const { notifications, isListening, connectionStatus, clearNotifications, reconnect } = useRealtimeNotifications(userRole)
  const [isOpen, setIsOpen] = useState(false)

  if (userRole !== 'admin' && userRole !== 'moderator') return null

  const unreadCount = notifications.filter(n => 
    new Date().getTime() - new Date(n.timestamp).getTime() < 5 * 60 * 1000 // Siste 5 minutter
  ).length

  const handleNotificationClick = (notification: any) => {
    const basePath = userRole === 'admin' ? '/dashboard/admin' : '/dashboard/moderator'
    
    switch (notification.type) {
      case 'new_listing':
        window.location.href = `${basePath}/annonser`
        break
      case 'new_report':
        window.location.href = `${basePath}/rapporter`
        break
      case 'user_registered':
        // Kun admin kan se brukere
        window.location.href = userRole === 'admin' ? '/dashboard/admin/brukere' : basePath
        break
      default:
        window.location.href = basePath
    }
    setIsOpen(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_listing': return '📝'
      case 'new_report': return '🚨'
      case 'user_registered': return '👤'
      default: return '📢'
    }
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / 60000)

    if (diffInMinutes < 1) return 'Akkurat nå'
    if (diffInMinutes < 60) return `${diffInMinutes} min siden`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} timer siden`
    return `${Math.floor(diffInMinutes / 1440)} dager siden`
  }

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" title="Real-time tilkoblet"></div>
      case 'connecting':
        return <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="Kobler til..."></div>
      case 'disconnected':
        return <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" title="Frakoblet"></div>
    }
  }

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className={`h-5 w-5 ${connectionStatus === 'connected' ? 'text-blue-600' : 'text-gray-600'}`} />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
            {getConnectionIcon()}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifikasjoner</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                }`}></div>
                <span className={`text-xs ${
                  connectionStatus === 'connected' ? 'text-green-600' : 
                  connectionStatus === 'connecting' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {connectionStatus === 'connected' ? 'Real-time' : 
                   connectionStatus === 'connecting' ? 'Kobler...' : 'Frakoblet'}
                </span>
                {connectionStatus === 'disconnected' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={reconnect}
                    className="text-xs h-5 px-2 text-blue-600"
                  >
                    Koble til
                  </Button>
                )}
              </div>
            </div>
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearNotifications}
                className="text-xs mt-2"
              >
                <X className="h-3 w-3 mr-1" />
                Tøm alle
              </Button>
            )}
          </div>

          {notifications.length > 0 ? (
            <div className="max-h-64 overflow-y-auto">
              {notifications.slice(0, 10).map((notification) => (
                <div 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {getTimeAgo(new Date(notification.timestamp))}
                      </p>
                    </div>
                    {new Date().getTime() - new Date(notification.timestamp).getTime() < 5 * 60 * 1000 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Ingen nye notifikasjoner</p>
            </div>
          )}

          <div className="p-3 border-t bg-gray-50">
            <div className="grid grid-cols-3 gap-2 text-center">
              <Link href="/dashboard/admin/annonser">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  Annonser
                </Button>
              </Link>
              <Link href="/dashboard/admin/rapporter">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Rapporter
                </Button>
              </Link>
              <Link href="/dashboard/admin/brukere">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Brukere
                </Button>
              </Link>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}