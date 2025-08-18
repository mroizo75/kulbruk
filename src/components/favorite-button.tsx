'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useFavorites } from '@/contexts/favorites-context'

interface FavoriteButtonProps {
  listingId: string
  className?: string
}

export default function FavoriteButton({ listingId, className = '' }: FavoriteButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { isFavorited, addFavorite, removeFavorite } = useFavorites()
  const [isLoading, setIsLoading] = useState(false)

  const isListingFavorited = isFavorited(listingId)

  const toggleFavorite = async () => {
    if (!session?.user) {
      toast.error('Du må være logget inn for å lagre favoritter')
      router.push('/sign-in?redirectUrl=' + encodeURIComponent(window.location.pathname))
      return
    }

    setIsLoading(true)
    
    try {
      if (isListingFavorited) {
        const success = await removeFavorite(listingId)
        if (success) {
          toast.success('Fjernet fra favoritter')
        } else {
          toast.error('Kunne ikke fjerne fra favoritter')
        }
      } else {
        const success = await addFavorite(listingId)
        if (success) {
          toast.success('Lagt til i favoritter')
        } else {
          toast.error('Kunne ikke legge til i favoritter')
        }
      }
    } catch (error) {
      console.error('Favoritt-feil:', error)
      toast.error('Noe gikk galt. Prøv igjen.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleFavorite}
      disabled={isLoading}
      className={className}
    >
      <Heart 
        className={`h-4 w-4 ${isListingFavorited ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} 
      />
      <span className="ml-1 hidden sm:inline">
        {isListingFavorited ? 'Favoritt' : 'Favoriser'}
      </span>
    </Button>
  )
}
