'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from './navbar'

export default function ConditionalNavbar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Skjul navbar på dashboard-sider, opprett-side og debug-sider
  const hideNavbar = pathname?.startsWith('/dashboard') || 
                    pathname?.startsWith('/opprett') ||
                    pathname?.startsWith('/debug') ||
                    pathname?.startsWith('/webhook-test') ||
                    pathname?.startsWith('/test-prisestimering')
  
  // Temporary debug
  if (mounted) {
    console.log('ConditionalNavbar - pathname:', pathname, 'hideNavbar:', hideNavbar)
  }
  
  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }
  
  if (hideNavbar) {
    return null
  }
  
  return <Navbar />
}