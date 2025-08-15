'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Footer from '@/components/footer'

export default function ConditionalFooter() {
	const pathname = usePathname()
	const [mounted, setMounted] = useState(false)
	
	useEffect(() => {
		setMounted(true)
	}, [])
	
	// Temporary debug
	if (mounted) {
		console.log('ConditionalFooter - pathname:', pathname, 'hideFooter:', pathname?.startsWith('/dashboard'))
	}
	
	// Prevent hydration mismatch
	if (!mounted) {
		return null
	}
	
	// Skjul footer på dashboard-ruter og opprett-side (admin/business/customer/moderator)
	if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/opprett')) {
		return null
	}
	return <Footer />
}


