'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function DashboardFooter() {
	const { data: session } = useSession()
	const role = (session?.user as any)?.role || 'customer'
	return (
		<footer className="mt-8 border-t border-gray-200 bg-white">
			<div className="max-w-7xl mx-auto px-4 py-4 text-xs text-gray-600 flex flex-col md:flex-row items-center justify-between gap-2">
				<div>
					© {new Date().getFullYear()} Kulbruk • Innlogget som {session?.user?.email || 'bruker'} • Rolle: {role}
				</div>
				<nav className="flex items-center gap-4">
					<Link href="/hjelp-og-stotte" className="hover:text-gray-900">Hjelp</Link>
					<Link href="/personvern" className="hover:text-gray-900">Personvern</Link>
					<Link href="/vilkar-og-betingelser" className="hover:text-gray-900">Vilkår</Link>
				</nav>
			</div>
		</footer>
	)
}


