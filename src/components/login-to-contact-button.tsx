'use client'

import { Button } from '@/components/ui/button'

export default function LoginToContactButton() {
  const handleClick = () => {
    // Lagre current URL for å returnere hit etter innlogging
    localStorage.setItem('postLoginRedirect', window.location.pathname)
    window.location.href = '/sign-in?redirect=' + encodeURIComponent(window.location.pathname)
  }

  return (
    <Button 
      className="w-full" 
      size="lg"
      onClick={handleClick}
    >
      Logg inn for å kontakte
    </Button>
  )
}
