'use client'

import { useState } from 'react'
import { Share2, Copy, Facebook, MessageCircle, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface ShareButtonProps {
  listing: {
    id: string
    title: string
    price: number
    shortCode?: string
  }
  className?: string
}

export default function ShareButton({ listing, className = '' }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Bruk shortCode hvis tilgjengelig, ellers fall tilbake til ID
  const listingIdentifier = listing.shortCode || listing.id
  const shareUrl = `${window.location.origin}/annonser/detaljer/${listingIdentifier}`
  const shareTitle = `${listing.title} - ${Number(listing.price).toLocaleString('no-NO')} kr`
  const shareText = `Sjekk ut denne annonsen på Kulbruk.no: ${shareTitle}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Lenke kopiert til utklippstavle!')
      setIsOpen(false)
    } catch (error) {
      console.error('Kunne ikke kopiere lenke:', error)
      toast.error('Kunne ikke kopiere lenke')
    }
  }

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
    setIsOpen(false)
  }

  const shareViaWhatsApp = () => {
    const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
    window.open(whatsAppUrl, '_blank')
    setIsOpen(false)
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Interessant annonse: ${listing.title}`)
    const body = encodeURIComponent(`Hei!\n\nJeg fant denne interessante annonsen på Kulbruk.no:\n\n${shareTitle}\n\n${shareUrl}\n\nMvh`)
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`
    window.location.href = mailtoUrl
    setIsOpen(false)
  }

  const shareViaNativeAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
        setIsOpen(false)
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Native share feilet:', error)
          // Fallback til kopiering
          copyToClipboard()
        }
      }
    } else {
      // Fallback til kopiering hvis native share ikke støttes
      copyToClipboard()
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Share2 className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Del</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={copyToClipboard}>
          <Copy className="h-4 w-4 mr-2" />
          Kopier lenke
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={shareOnFacebook}>
          <Facebook className="h-4 w-4 mr-2" />
          Del på Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareViaWhatsApp}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Del på WhatsApp
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareViaEmail}>
          <Mail className="h-4 w-4 mr-2" />
          Del via e-post
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={shareViaNativeAPI}>
          <Share2 className="h-4 w-4 mr-2" />
          {navigator.share ? 'Mer...' : 'Hurtigdeling'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
