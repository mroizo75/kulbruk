'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface FavoritesContextType {
  favorites: string[] // Array av listing IDs
  isFavorited: (listingId: string) => boolean
  addFavorite: (listingId: string) => Promise<boolean>
  removeFavorite: (listingId: string) => Promise<boolean>
  refreshFavorites: () => Promise<void>
  isLoading: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

interface FavoritesProviderProps {
  children: ReactNode
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const { data: session } = useSession()
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Hent favoritter når session endres
  useEffect(() => {
    if (session?.user && !hasInitialized) {
      refreshFavorites()
    } else if (!session?.user) {
      setFavorites([])
      setHasInitialized(false)
    }
  }, [session, hasInitialized])

  const refreshFavorites = async () => {
    if (!session?.user) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const data = await response.json()
        const favoriteIds = data.favorites?.map((fav: any) => fav.listingId) || []
        setFavorites(favoriteIds)
      }
    } catch (error) {
      console.error('Feil ved henting av favoritter:', error)
    } finally {
      setIsLoading(false)
      setHasInitialized(true)
    }
  }

  const isFavorited = (listingId: string): boolean => {
    return favorites.includes(listingId)
  }

  const addFavorite = async (listingId: string): Promise<boolean> => {
    if (!session?.user) return false
    
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId })
      })
      
      if (response.ok) {
        setFavorites(prev => [...prev, listingId])
        return true
      }
      return false
    } catch (error) {
      console.error('Feil ved adding favoritt:', error)
      return false
    }
  }

  const removeFavorite = async (listingId: string): Promise<boolean> => {
    if (!session?.user) return false
    
    try {
      const response = await fetch(`/api/favorites?listingId=${encodeURIComponent(listingId)}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setFavorites(prev => prev.filter(id => id !== listingId))
        return true
      }
      return false
    } catch (error) {
      console.error('Feil ved removing favoritt:', error)
      return false
    }
  }

  const value: FavoritesContextType = {
    favorites,
    isFavorited,
    addFavorite,
    removeFavorite,
    refreshFavorites,
    isLoading
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
