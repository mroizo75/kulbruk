'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'

export default function ReviewForm({ revieweeId, listingId }: { revieweeId: string; listingId?: string }) {
	const [rating, setRating] = useState<number>(0)
	const [hover, setHover] = useState<number>(0)
	const [comment, setComment] = useState<string>('')
	const [submitting, setSubmitting] = useState<boolean>(false)
	const [error, setError] = useState<string>('')
	const [success, setSuccess] = useState<boolean>(false)

	async function submit() {
		if (rating < 1) { setError('Velg antall stjerner'); return }
		setSubmitting(true)
		setError('')
		try {
			const res = await fetch('/api/reviews', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ revieweeId, listingId, rating, comment }),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data?.error || 'Kunne ikke sende vurdering')
			setSuccess(true)
		} catch (e: any) {
			setError(e.message)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-1">
				{Array.from({ length: 5 }).map((_, i) => {
					const idx = i + 1
					const active = (hover || rating) >= idx
					return (
						<button
							key={idx}
							type="button"
							className="p-1"
							onMouseEnter={() => setHover(idx)}
							onMouseLeave={() => setHover(0)}
							onClick={() => setRating(idx)}
							aria-label={`${idx} stjerner`}
						>
							<Star className={active ? 'fill-yellow-400 text-yellow-500' : 'text-gray-300'} />
						</button>
					)
				})}
			</div>
			<Textarea placeholder="Skriv en kort vurdering (valgfritt)" value={comment} onChange={e => setComment(e.target.value)} />
			<div className="flex items-center gap-2">
				<Button onClick={submit} disabled={submitting}>Send vurdering</Button>
				{success && <span className="text-green-600 text-sm">Takk for vurderingen!</span>}
				{error && <span className="text-red-600 text-sm">{error}</span>}
			</div>
		</div>
	)
}


