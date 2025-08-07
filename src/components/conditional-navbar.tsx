'use client'

import { usePathname } from 'next/navigation'
import Navbar from './navbar'

export default function ConditionalNavbar() {
  const pathname = usePathname()
  
  // Skjul navbar på dashboard-sider og debug-sider
  const hideNavbar = pathname.startsWith('/dashboard') || 
                    pathname.startsWith('/debug') ||
                    pathname.startsWith('/webhook-test') ||
                    pathname.startsWith('/test-prisestimering')
  
  if (hideNavbar) {
    return null
  }
  
  return <Navbar />
}