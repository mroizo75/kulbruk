'use client'

import { useEffect, useState } from 'react'

type Consent = {
  version: number
  acceptedAt: number
  categories: { necessary: boolean; preferences: boolean }
}

const CONSENT_KEY = 'kulbruk:consent'
const CONSENT_VERSION = 1

function readConsent(): Consent | null {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(CONSENT_KEY) : null
    if (!raw) return null
    const parsed = JSON.parse(raw) as Consent
    if (!parsed.version || parsed.version !== CONSENT_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

function writeConsent(consent: Consent) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
}

export default function CookiePreferences() {
  const [preferences, setPreferences] = useState<boolean>(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  useEffect(() => {
    const existing = readConsent()
    if (existing) {
      setPreferences(!!existing.categories.preferences)
      setSavedAt(existing.acceptedAt)
    }
  }, [])

  const savePreferences = () => {
    const consent: Consent = {
      version: CONSENT_VERSION,
      acceptedAt: Date.now(),
      categories: { necessary: true, preferences },
    }
    writeConsent(consent)
    setSavedAt(consent.acceptedAt)
  }

  const acceptNecessaryOnly = () => {
    const consent: Consent = {
      version: CONSENT_VERSION,
      acceptedAt: Date.now(),
      categories: { necessary: true, preferences: false },
    }
    writeConsent(consent)
    setPreferences(false)
    setSavedAt(consent.acceptedAt)
  }

  const clearLocalData = () => {
    try {
      // Kjente nøkler brukt av appen
      localStorage.removeItem('kulbruk:lastSearch')
      // Behold consent-innstillingen, eller fjern den hvis ønskelig
    } catch {}
  }

  return (
    <div className="mt-6 border rounded-lg bg-white">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Administrer cookie‑preferanser</h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-start gap-3">
          <input
            id="pref"
            type="checkbox"
            checked={preferences}
            onChange={(e) => setPreferences(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="pref" className="text-sm text-gray-700">
            Jeg samtykker til funksjonelle/ytelsesrelaterte lagringer (for eksempel siste søk og preferanser på min enhet).
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={savePreferences} className="px-3 py-1.5 rounded text-sm bg-blue-600 text-white">Lagre valg</button>
          <button onClick={acceptNecessaryOnly} className="px-3 py-1.5 rounded text-sm border">Kun nødvendige</button>
          <button onClick={clearLocalData} className="px-3 py-1.5 rounded text-sm border">Slett lokal søkehistorikk</button>
        </div>
        {savedAt && (
          <p className="text-xs text-gray-500">Sist oppdatert: {new Date(savedAt).toLocaleString('nb-NO')}</p>
        )}
      </div>
    </div>
  )
}


