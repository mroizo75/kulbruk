'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface AddressMapProps {
  address: string
  className?: string
  zoom?: number
}

// Fix default icon paths for Leaflet in bundlers
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function AddressMap({ address, className = '', zoom = 14 }: AddressMapProps) {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchCoords = async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
        const res = await fetch(url, { headers: { 'Accept-Language': 'nb-NO' } })
        const json = await res.json()
        if (!cancelled && Array.isArray(json) && json.length > 0) {
          setCoords({ lat: parseFloat(json[0].lat), lon: parseFloat(json[0].lon) })
        }
      } catch {
        // noop
      }
    }
    fetchCoords()
    return () => { cancelled = true }
  }, [address])

  useEffect(() => {
    if (!coords) return
    const map = L.map('address-map-container', { zoomControl: true })
    const { lat, lon } = coords
    map.setView([lat, lon], zoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap-bidragsytere',
      maxZoom: 19,
    }).addTo(map)

    L.marker([lat, lon]).addTo(map)

    return () => {
      map.remove()
    }
  }, [coords, zoom])

  return (
    <div className={className}>
      <div id="address-map-container" className="w-full h-64 rounded-md border" />
      {!coords && (
        <div className="text-xs text-gray-500 mt-2">Laster kart…</div>
      )}
    </div>
  )
}


