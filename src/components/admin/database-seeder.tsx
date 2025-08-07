'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Play, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface DatabaseStatus {
  isSeeded: boolean
  statistics: {
    totalUsers: number
    totalListings: number
    totalCategories: number
    totalAuctions: number
    totalBids: number
  }
}

export default function DatabaseSeeder() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin/seed-database')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Feil ved henting av database status:', error)
      toast.error('Kunne ikke hente database status')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleSeedDatabase = async () => {
    setIsSeeding(true)
    try {
      const response = await fetch('/api/admin/seed-database', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Database seeding fullført!', {
          description: `Opprettet: ${data.result.categories} kategorier, ${data.result.users} brukere, ${data.result.listings} annonser`
        })
        await fetchStatus() // Oppdater status
      } else {
        toast.error('Database seeding feilet', {
          description: data.error || 'Ukjent feil'
        })
      }
    } catch (error) {
      console.error('Feil ved database seeding:', error)
      toast.error('Database seeding feilet', {
        description: 'Nettverksfeil eller server utilgjengelig'
      })
    } finally {
      setIsSeeding(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Henter status...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status?.isSeeded ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <Badge className="bg-green-100 text-green-800">Seeded</Badge>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <Badge variant="outline">Ikke seeded</Badge>
            </>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchStatus}
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Current Statistics */}
      {status && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Nåværende database innhold:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Brukere:</span>
              <span className="font-medium">{status.statistics.totalUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Annonser:</span>
              <span className="font-medium">{status.statistics.totalListings}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Kategorier:</span>
              <span className="font-medium">{status.statistics.totalCategories}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Auksjoner:</span>
              <span className="font-medium">{status.statistics.totalAuctions}</span>
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Seeding Information */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">Database seeding vil opprette:</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span><strong>6 kategorier:</strong> Bil, Eiendom, Elektronikk, Møbler, Klær, Sport</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span><strong>4 testbrukere:</strong> Customer, Business, Admin roller</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span><strong>8+ testannonser:</strong> BMW X5, Tesla, iPhone, MacBook, etc.</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span><strong>Live auksjoner:</strong> Med AI-prisestimering og aktive bud</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleSeedDatabase}
          disabled={isSeeding}
          className="w-full"
        >
          {isSeeding ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Seeder database...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Seed database med testdata
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          ⚠️ Dette vil legge til testdata uten å overskrive eksisterende data.
          Kan kjøres flere ganger trygt.
        </p>
      </div>
    </div>
  )
}
