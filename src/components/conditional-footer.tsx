'use client'

import { usePathname } from 'next/navigation'
import Footer from '@/components/footer'

export default function ConditionalFooter() {
	const pathname = usePathname()
	// Skjul footer på dashboard-ruter (admin/business/customer/moderator)
	if (pathname?.startsWith('/dashboard')) {
		return null
	}
	return <Footer />
}


