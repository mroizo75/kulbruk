'use client'

import { useEffect, useState } from 'react'

type Consent = {
	version: number
	acceptedAt: number
	categories: { necessary: boolean; preferences: boolean }
}

const CONSENT_KEY = 'kulbruk:consent'
const CONSENT_VERSION = 1

export function getConsent(): Consent | null {
	if (typeof window === 'undefined') return null
	try {
		const raw = localStorage.getItem(CONSENT_KEY)
		if (!raw) return null
		const parsed = JSON.parse(raw) as Consent
		if (!parsed.version || parsed.version !== CONSENT_VERSION) return null
		return parsed
	} catch {
		return null
	}
}

export default function CookieConsent() {
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		const existing = getConsent()
		if (!existing) setVisible(true)
	}, [])

	function acceptAll() {
		const consent: Consent = {
			version: CONSENT_VERSION,
			acceptedAt: Date.now(),
			categories: { necessary: true, preferences: true },
		}
		localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
		setVisible(false)
	}

	function acceptNecessary() {
		const consent: Consent = {
			version: CONSENT_VERSION,
			acceptedAt: Date.now(),
			categories: { necessary: true, preferences: false },
		}
		localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
		setVisible(false)
	}

	if (!visible) return null

	return (
		<div className="fixed inset-x-0 bottom-0 z-50">
			<div className="mx-auto max-w-5xl m-4 p-4 rounded-md border bg-white shadow-md">
				<p className="text-sm text-gray-700">
					Vi bruker kun nødvendige lagringer for at nettsiden skal fungere. Med ditt samtykke lagrer vi også søkehistorikk lokalt på din enhet for bedre opplevelse. Dette kan slettes når som helst i nettleseren din.
				</p>
				<div className="mt-3 flex items-center gap-2">
					<button onClick={acceptNecessary} className="px-3 py-1.5 border rounded text-sm">Kun nødvendige</button>
					<button onClick={acceptAll} className="px-3 py-1.5 rounded text-sm bg-blue-600 text-white">Godta alle</button>
				</div>
			</div>
		</div>
	)
}


