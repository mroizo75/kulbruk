'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ConversationInput({ conversationId }: { conversationId: string }) {
	const [value, setValue] = useState('')
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	async function send() {
		if (!value.trim()) return
		setLoading(true)
		try {
			const res = await fetch(`/api/messages/${conversationId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: value.trim() }),
			})
			if (!res.ok) throw new Error('Kunne ikke sende melding')
			setValue('')
			router.refresh()
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="mt-3 flex items-center gap-2">
			<input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder="Skriv en melding..."
				className="flex-1 border rounded px-3 py-2 text-sm"
				onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
			/>
			<button
				onClick={send}
				disabled={loading || !value.trim()}
				className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
			>
				Send
			</button>
		</div>
	)
}


