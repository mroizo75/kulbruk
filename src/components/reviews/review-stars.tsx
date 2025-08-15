'use client'

import { Star } from 'lucide-react'

export default function ReviewStars({ value, size = 16 }: { value: number; size?: number }) {
	const full = Math.floor(value)
	const half = value - full >= 0.5
	const total = 5
	return (
		<div className="inline-flex items-center gap-0.5">
			{Array.from({ length: total }).map((_, i) => {
				const active = i < full || (i === full && half)
				return <Star key={i} width={size} height={size} className={active ? 'fill-yellow-400 text-yellow-500' : 'text-gray-300'} />
			})}
		</div>
	)
}


