'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

type Props = {
  id: string
  name?: string | null
  createdAt: string | Date
  queryJson: string
  frequency?: string | null
}

export default function SavedSearchRow({ id, name, createdAt, queryJson, frequency }: Props) {
  const [currentFrequency, setCurrentFrequency] = useState((frequency || 'daily').toLowerCase())
  const [isSaving, setIsSaving] = useState(false)

  const useSearch = () => {
    try {
      const q = JSON.parse(queryJson || '{}')
      const params = new URLSearchParams()
      if (q.category) params.set('category', q.category)
      if (q.sortBy) params.set('sort', q.sortBy)
      if (q.filters) {
        Object.entries(q.filters).forEach(([k, v]) => {
          if (v) params.set(String(k), String(v as any))
        })
      }
      window.location.href = `/annonser?${params.toString()}`
    } catch {
      window.location.href = '/annonser'
    }
  }

  const deleteSearch = async () => {
    await fetch(`/api/saved-searches?id=${id}`, { method: 'DELETE' })
    window.location.reload()
  }

  const changeFrequency = async (value: string) => {
    setCurrentFrequency(value)
    setIsSaving(true)
    try {
      await fetch('/api/saved-searches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, frequency: value }),
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <li className="py-3 flex items-center justify-between">
      <div>
        <div className="font-medium">{name || 'Uten navn'}</div>
        <div className="text-xs text-gray-500">Lagret {new Date(createdAt).toLocaleString('no-NO')}</div>
      </div>
      <div className="flex items-center gap-3">
        <Select value={currentFrequency} onValueChange={changeFrequency}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Varslingsfrekvens" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daglig e‑post</SelectItem>
            <SelectItem value="weekly">Ukentlig e‑post</SelectItem>
            <SelectItem value="off">Av (ingen e‑post)</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={useSearch} disabled={isSaving} className="text-blue-600">Bruk søk</Button>
        <Button variant="ghost" size="sm" onClick={deleteSearch} disabled={isSaving} className="text-red-600">Slett</Button>
      </div>
    </li>
  )
}


