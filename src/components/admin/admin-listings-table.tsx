'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-react'
import Link from 'next/link'

export interface AdminListingRow {
	id: string
	title: string
	price: number
	location: string
	createdAt: string
	categoryName: string
	status: string
	shortCode?: string | null
	imageUrl?: string | null
}

export default function AdminListingsTable({ rows }: { rows: AdminListingRow[] }) {
	const [selected, setSelected] = useState<Record<string, boolean>>({})
	const allSelected = useMemo(() => rows.length > 0 && rows.every(r => selected[r.id]), [rows, selected])
	const someSelected = useMemo(() => rows.some(r => selected[r.id]), [rows, selected])

	function toggleAll() {
		if (allSelected) {
			const cleared: Record<string, boolean> = {}
			setSelected(cleared)
		} else {
			const next: Record<string, boolean> = {}
			rows.forEach(r => { next[r.id] = true })
			setSelected(next)
		}
	}

	function toggleOne(id: string) {
		setSelected(prev => ({ ...prev, [id]: !prev[id] }))
	}

	async function bulk(action: 'APPROVE' | 'REJECT' | 'DELETE') {
		const ids = rows.filter(r => selected[r.id]).map(r => r.id)
		if (ids.length === 0) return
		if (action === 'DELETE' && !confirm('Slette valgte annonser?')) return
		const res = await fetch('/api/admin/listings/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ids }) })
		if (res.ok) location.reload()
	}

	if (rows.length === 0) {
		return (
			<div className="border rounded bg-white p-8 text-center">
				<h3 className="text-lg font-semibold text-gray-900 mb-2">Ingen annonser funnet</h3>
				<p className="text-gray-600">Juster filtrene eller søk etter kortkode for å finne annonser.</p>
			</div>
		)
	}

	return (
		<div className="border rounded bg-white">
			<div className="flex items-center gap-2 p-3 border-b">
				<input type="checkbox" checked={allSelected} onChange={toggleAll} aria-checked={allSelected} />
				<span className="text-sm text-gray-600">Velg alle</span>
				<div className="ml-auto flex items-center gap-2">
					<Button size="sm" onClick={() => bulk('APPROVE')} disabled={!someSelected}>Godkjenn</Button>
					<Button size="sm" variant="secondary" onClick={() => bulk('REJECT')} disabled={!someSelected}>Avslå</Button>
					<Button size="sm" variant="outline" className="text-red-600" onClick={() => bulk('DELETE')} disabled={!someSelected}>Slett</Button>
				</div>
			</div>
			<table className="w-full text-sm">
				<thead>
					<tr className="text-left border-b">
						<th className="p-2"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
						<th className="p-2">Tittel</th>
						<th className="p-2">Pris</th>
						<th className="p-2">Sted</th>
						<th className="p-2">Tid</th>
						<th className="p-2">Kategori</th>
						<th className="p-2">Status</th>
						<th className="p-2">Handling</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((r) => (
						<tr key={r.id} className="border-b last:border-0">
							<td className="p-2 align-top"><input type="checkbox" checked={!!selected[r.id]} onChange={() => toggleOne(r.id)} /></td>
							<td className="p-2">
								<div className="font-medium truncate max-w-[360px]">{r.title}</div>
								{r.shortCode && (<div className="text-xs text-gray-500">#{r.shortCode}</div>)}
							</td>
							<td className="p-2 whitespace-nowrap">{r.price.toLocaleString('no-NO')} kr</td>
							<td className="p-2">{r.location}</td>
							<td className="p-2 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString('no-NO')}</td>
							<td className="p-2"><Badge variant="outline">{r.categoryName}</Badge></td>
							<td className="p-2"><Badge variant="outline">{r.status}</Badge></td>
							<td className="p-2">
								<Link href={`/annonser/detaljer/${r.id}`}>
									<Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" /> Se</Button>
								</Link>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}


