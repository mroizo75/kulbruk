'use client'

import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: 'new_listing' | 'new_report' | 'user_registered' | 'listing_approved' | 'listing_rejected' | 'heartbeat' | 'connection'
  title: string
  message: string
  data?: any
  timestamp: string | Date
  targetRoles?: ('admin' | 'moderator')[]
  connectionCount?: number
}

export function useRealtimeNotifications(userRole: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isListening, setIsListening] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup function
  const cleanup = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    setIsListening(false)
    setConnectionStatus('disconnected')
  }

  // Reconnect function
  const reconnect = () => {
    cleanup()
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    reconnectTimeoutRef.current = setTimeout(() => {
      if (userRole === 'admin' || userRole === 'moderator') {
        setupSSE()
      }
    }, 3000) // Prøv igjen etter 3 sekunder
  }

  // Setup Server-Sent Events
  const setupSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    setConnectionStatus('connecting')
    console.log('SSE: Kobler til real-time notifikasjoner...')

    const url = (userRole === 'admin' || userRole === 'moderator')
      ? '/api/admin/notifications/stream'
      : '/api/user/notifications/stream'
    const eventSource = new EventSource(url, { withCredentials: true })

    eventSource.onopen = () => {
      console.log('SSE: Tilkoblet real-time notifikasjoner')
      setIsListening(true)
      setConnectionStatus('connected')
    }

    eventSource.onmessage = (event) => {
      try {
        const notification: Notification = JSON.parse(event.data)
        
        // Skip heartbeat og connection messages for toast
        if (notification.type === 'heartbeat') {
          return
        }

        if (notification.type === 'connection') {
          console.log(`SSE: ${notification.message} (${notification.connectionCount} tilkoblede)`)
          return
        }

        // Legg til i notifications liste
        setNotifications(prev => {
          // Sjekk om notifikasjonen allerede eksisterer
          if (prev.find(n => n.id === notification.id)) {
            return prev
          }
          return [notification, ...prev].slice(0, 50) // Behold maks 50
        })

        // Vis toast for nye notifikasjoner
        switch (notification.type) {
          case 'new_listing':
            toast.info(`📝 Ny annonse: ${notification.title}`, {
              description: notification.message,
              duration: 5000,
              action: {
                label: 'Godkjenn',
                onClick: () => window.location.href = userRole === 'admin' 
                  ? '/dashboard/admin/annonser' 
                  : '/dashboard/moderator/annonser'
              }
            })
            break
          case 'new_report':
            toast.warning(`🚨 Ny rapport: ${notification.title}`, {
              description: notification.message,
              duration: 5000,
              action: {
                label: 'Se rapport',
                onClick: () => window.location.href = userRole === 'admin' 
                  ? '/dashboard/admin/rapporter' 
                  : '/dashboard/moderator/rapporter'
              }
            })
            break
          case 'user_registered':
            if (userRole === 'admin') { // Kun admin ser nye brukere
              toast.success(`👤 Ny bruker: ${notification.title}`, {
                description: notification.message,
                duration: 3000
              })
            }
            break
          case 'listing_approved':
            if (userRole === 'admin') { // Kun admin ser approve/reject
              toast.success(`✅ ${notification.title}`, {
                description: notification.message,
                duration: 4000
              })
            }
            break
          case 'listing_rejected':
            if (userRole === 'admin') { // Kun admin ser approve/reject
              toast.error(`❌ ${notification.title}`, {
                description: notification.message,
                duration: 4000
              })
            }
            break
        }
      } catch (error) {
        console.error('SSE: Feil ved parsing av notifikasjon:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE: Connection error:', error)
      setConnectionStatus('disconnected')
      setIsListening(false)
      
      // Prøv å koble til igjen
      reconnect()
    }

    eventSourceRef.current = eventSource
  }

  useEffect(() => {
    // Start SSE connection kun for admin/moderator
    if (userRole === 'admin' || userRole === 'moderator') {
      setupSSE()
    }

    // Cleanup ved unmount
    return cleanup
  }, [userRole])

  // Cleanup ved component unmount
  useEffect(() => {
    return cleanup
  }, [])

  return {
    notifications,
    isListening,
    connectionStatus,
    clearNotifications: () => setNotifications([]),
    reconnect: () => {
      console.log('SSE: Manuell reconnect...')
      reconnect()
    }
  }
}