'use client'

import { useEffect, useState } from 'react'
import ReviewStars from './review-stars'

export default function ReviewSummary({ userId }: { userId: string }) {
	const [avg, setAvg] = useState<number>(0)
	const [count, setCount] = useState<number>(0)
	useEffect(() => {
		let isMounted = true
		fetch(`/api/reviews?userId=${encodeURIComponent(userId)}`)
			.then(r => r.json())
			.then(d => { if (!isMounted) return; setAvg(d.average || 0); setCount(Array.isArray(d.reviews) ? d.reviews.length : 0) })
			.catch(() => {})
		return () => { isMounted = false }
	}, [userId])
	return (
		<div className="flex items-center gap-2 text-sm">
			<ReviewStars value={avg} />
			<span className="text-gray-600">{avg.toFixed(1)} ({count})</span>
		</div>
	)
}


