'use client'

import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'

interface LiveAuction {
  id: string
  title: string
  make: string
  model: string
  year: number
  location: string
  estimatedPrice: number
  currentBid: number | null
  bidCount: number
  endDate: Date
  status: 'ACTIVE' | 'ENDING_SOON' | 'ENDED'
  isNew?: boolean
  myBid?: number
  isWinning?: boolean
  seller: {
    firstName: string
    lastName: string
  }
}

interface LiveAuctionUpdate {
  type: 'NEW_AUCTION' | 'BID_UPDATE' | 'AUCTION_WON' | 'AUCTION_ENDING' | 'PRICE_UPDATE' | 'HEARTBEAT' | 'CONNECTION_ESTABLISHED'
  auction?: LiveAuction  // Optional since heartbeat/connection messages don't have auction data
  previousBid?: number
  newBid?: number
  bidder?: string
  timeLeft?: string
  message?: string       // For connection/heartbeat messages
  timestamp?: string     // For all message types
  connectionId?: string  // For connection messages
}

export function useLiveAuctions() {
  const [auctions, setAuctions] = useState<LiveAuction[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const addNewAuction = (auction: LiveAuction) => {
    setAuctions(prev => {
      // Sjekk om auksjonen allerede eksisterer
      if (prev.find(a => a.id === auction.id)) {
        return prev
      }
      
      const newAuction = { ...auction, isNew: true }
      
      // Legg til på toppen og marker som ny
      const updated = [newAuction, ...prev]
      
      // Fjern "ny" merket etter 10 sekunder
      setTimeout(() => {
        setAuctions(current => 
          current.map(a => 
            a.id === auction.id ? { ...a, isNew: false } : a
          )
        )
      }, 10000)
      
      return updated
    })
  }

  const updateAuction = (auctionId: string, updates: Partial<LiveAuction>) => {
    setAuctions(prev => 
      prev.map(auction => 
        auction.id === auctionId 
          ? { ...auction, ...updates }
          : auction
      )
    )
  }

  const setupSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    console.log('🔗 Kobler til live auction updates...')
    
    const eventSource = new EventSource('/api/business/live-auctions', {
      withCredentials: true
    })

    eventSource.onopen = () => {
      console.log('✅ Tilkoblet live auction feed')
      setIsConnected(true)
      setLastUpdate(new Date())
    }

    eventSource.onmessage = (event) => {
      try {
        // Sikre at vi har data å parse
        if (!event.data || event.data.trim() === '') {
          console.log('🔍 Tomt SSE event, hopper over')
          return
        }

        const update: LiveAuctionUpdate = JSON.parse(event.data)
        
        // Sikre at update objektet har en type
        if (!update || !update.type) {
          console.error('❌ Invalid SSE update format:', update)
          return
        }
        
        // Sjekk om det er en heartbeat eller connection melding
        if (update.type === 'HEARTBEAT' || update.type === 'CONNECTION_ESTABLISHED') {
          console.log('💓 Heartbeat/Connection:', update.type)
          setLastUpdate(new Date())
          return
        }
        
        // Sikre at auction data eksisterer før logging
        console.log('📡 Live auction update:', update.type, update.auction?.title || 'Unknown auction')
        
        switch (update.type) {
          case 'NEW_AUCTION':
            if (update.auction) {
              const auction = update.auction // Store reference to avoid closure issues
              addNewAuction(auction)
              toast.success(`🚗 Ny auksjon: ${auction.title}`, {
                description: `${auction.make} ${auction.model} - ${auction.location}`,
                duration: 8000,
                action: {
                  label: 'Se auksjon',
                  onClick: () => window.location.href = `/dashboard/business/auksjoner/${auction.id}`
                }
              })
            }
            break
            
          case 'BID_UPDATE':
            if (update.auction) {
              const auction = update.auction // Store reference to avoid closure issues
              updateAuction(auction.id, {
                currentBid: update.newBid,
                bidCount: auction.bidCount,
                isWinning: auction.isWinning
              })
              
              if (auction.isWinning) {
                toast.success(`🎯 Du leder på ${auction.title}!`, {
                  description: `Ditt bud: ${update.newBid?.toLocaleString('no-NO')} kr`,
                  duration: 6000
                })
              } else if (auction.myBid && !auction.isWinning) {
                toast.warning(`⚡ Du er utkonkurrert på ${auction.title}`, {
                  description: `Nytt høyeste bud: ${update.newBid?.toLocaleString('no-NO')} kr`,
                  duration: 6000,
                  action: {
                    label: 'Oppdater bud',
                    onClick: () => window.location.href = `/dashboard/business/auksjoner/${auction.id}`
                  }
                })
              }
            }
            break
            
          case 'AUCTION_WON':
            if (update.auction) {
              const auction = update.auction // Store reference to avoid closure issues
              updateAuction(auction.id, {
                status: 'ENDED',
                isWinning: true
              })
              toast.success(`🏆 Gratulerer! Du vant ${auction.title}!`, {
                description: `Vinnende bud: ${auction.currentBid?.toLocaleString('no-NO')} kr`,
                duration: 10000,
                action: {
                  label: 'Se detaljer',
                  onClick: () => window.location.href = `/dashboard/business/mine-bud`
                }
              })
            }
            break
            
          case 'AUCTION_ENDING':
            if (update.auction) {
              const auction = update.auction // Store reference to avoid closure issues
              updateAuction(auction.id, {
                status: 'ENDING_SOON'
              })
              
              if (auction.myBid) {
                toast.warning(`⏰ ${auction.title} avslutter snart!`, {
                  description: `${update.timeLeft} igjen - ${auction.isWinning ? 'Du leder' : 'Du er ikke høyeste'}`,
                  duration: 8000,
                  action: {
                    label: 'Se auksjon',
                    onClick: () => window.location.href = `/dashboard/business/auksjoner/${auction.id}`
                  }
                })
              }
            }
            break
            
          case 'PRICE_UPDATE':
            if (update.auction) {
              const auction = update.auction // Store reference to avoid closure issues
              updateAuction(auction.id, {
                estimatedPrice: auction.estimatedPrice
              })
            }
            break
        }
        
        setLastUpdate(new Date())
        
      } catch (error) {
        console.error('❌ Feil ved parsing av live auction update:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('❌ Live auction connection error:', error)
      setIsConnected(false)
      
      // Reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Reconnecting to live auctions...')
        setupSSE()
      }, 5000)
    }

    eventSourceRef.current = eventSource
  }

  const cleanup = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    setIsConnected(false)
  }

  // Load initial auctions
  const loadInitialAuctions = async () => {
    try {
      const response = await fetch('/api/business/auctions', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setAuctions(data.auctions || [])
      }
    } catch (error) {
      console.error('❌ Feil ved lasting av auksjoner:', error)
    }
  }

  useEffect(() => {
    loadInitialAuctions()
    setupSSE()
    
    return cleanup
  }, [])

  const refreshAuctions = () => {
    loadInitialAuctions()
  }

  const manualReconnect = () => {
    cleanup()
    setupSSE()
  }

  return {
    auctions,
    isConnected,
    lastUpdate,
    refreshAuctions,
    manualReconnect,
    addNewAuction,
    updateAuction
  }
}
