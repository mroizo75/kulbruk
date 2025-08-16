'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type CategoryOption = { id: string; name: string }

interface AdminListingsFiltersProps {
	initialStatus?: string
	initialQuery?: string
	initialCategoryId?: string
	initialPageSize?: number
	categories: CategoryOption[]
}

const STATUSES = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SOLD', 'EXPIRED', 'SUSPENDED'] as const

export default function AdminListingsFilters({
	initialStatus = 'ALL',
	initialQuery = '',
	initialCategoryId = '',
	initialPageSize = 20,
	categories,
}: AdminListingsFiltersProps) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [status, setStatus] = useState<string>(initialStatus)
	const [q, setQ] = useState<string>(initialQuery)
	const [categoryId, setCategoryId] = useState<string>(initialCategoryId)
	const [pageSize, setPageSize] = useState<number>(initialPageSize)

	useEffect(() => {
		setStatus(initialStatus)
		setQ(initialQuery)
		setCategoryId(initialCategoryId)
		setPageSize(initialPageSize)
	}, [initialStatus, initialQuery, initialCategoryId, initialPageSize])

	function applyFilters() {
		const params = new URLSearchParams(searchParams?.toString() || '')
		if (status && status !== 'ALL') params.set('status', status); else params.delete('status')
		if (q && q.trim().length > 0) params.set('q', q.trim()); else params.delete('q')
		if (categoryId && categoryId !== 'alle-kategorier') params.set('categoryId', categoryId); else params.delete('categoryId')
		params.set('page', '1')
		params.set('pageSize', String(pageSize))
		router.push(`/dashboard/admin/annonser?${params.toString()}`)
	}

	function clearFilters() {
		router.push('/dashboard/admin/annonser')
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-5 gap-3">
			<div className="md:col-span-2">
				<Input placeholder="Søk tittel/annonsenr" value={q} onChange={(e) => setQ(e.target.value)} />
			</div>
			<div>
				<Select value={status} onValueChange={(v) => setStatus(v)}>
					<SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
					<SelectContent>
						{STATUSES.map((s) => (
							<SelectItem key={s} value={s}>{s}</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div>
				<Select value={categoryId} onValueChange={(v) => setCategoryId(v)}>
					<SelectTrigger><SelectValue placeholder="Kategori" /></SelectTrigger>
					<SelectContent>
						<SelectItem value="alle-kategorier">Alle kategorier</SelectItem>
						{categories.map(c => (
							<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="flex items-center gap-2">
				<Select value={String(pageSize)} onValueChange={(v) => setPageSize(parseInt(v))}>
					<SelectTrigger className="w-28"><SelectValue placeholder="Per side" /></SelectTrigger>
					<SelectContent>
						{[10, 20, 50, 100].map(n => (
							<SelectItem key={n} value={String(n)}>{n}/side</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button onClick={applyFilters}>Bruk</Button>
				<Button variant="outline" onClick={clearFilters}>Nullstill</Button>
			</div>
		</div>
	)
}


