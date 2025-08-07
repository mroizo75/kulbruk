'use client'

import { useState } from 'react'
import { Save, RefreshCw, Database, Globe, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    siteName: 'Kulbruk.no',
    siteDescription: 'Din lokale markedsplass for bil, eiendom og mer',
    maxImageSize: '10',
    maxImagesPerListing: '8',
    autoApprove: false,
    emailNotifications: true,
    maintenanceMode: false,
    registrationOpen: true
  })

  const [isSaving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    
    try {
      // Mock API call - implementer ekte API senere
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Systeminnstillinger lagret')
    } catch (error) {
      toast.error('Kunne ikke lagre innstillinger')
    } finally {
      setSaving(false)
    }
  }

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="space-y-8">
      {/* Generelle innstillinger */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Generelle innstillinger</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="siteName">Sidenavn</Label>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => handleSettingChange('siteName', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Sidebeskrivelse</Label>
            <Input
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Annonse innstillinger */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Annonse innstillinger</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="maxImageSize">Maks bildestørrelse (MB)</Label>
            <Input
              id="maxImageSize"
              type="number"
              value={settings.maxImageSize}
              onChange={(e) => handleSettingChange('maxImageSize', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxImagesPerListing">Maks bilder per annonse</Label>
            <Input
              id="maxImagesPerListing"
              type="number"
              value={settings.maxImagesPerListing}
              onChange={(e) => handleSettingChange('maxImagesPerListing', e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <div className="text-base font-medium">Automatisk godkjenning</div>
            <div className="text-sm text-gray-600">
              Godkjenn annonser automatisk uten manuell gjennomgang
            </div>
          </div>
          <Switch
            checked={settings.autoApprove}
            onCheckedChange={(checked) => handleSettingChange('autoApprove', checked)}
          />
        </div>
      </div>

      {/* System innstillinger */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">System innstillinger</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="text-base font-medium">E-post notifikasjoner</div>
              <div className="text-sm text-gray-600">
                Send e-post ved viktige hendelser
              </div>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="text-base font-medium">Åpen registrering</div>
              <div className="text-sm text-gray-600">
                Tillat nye brukere å registrere seg
              </div>
            </div>
            <Switch
              checked={settings.registrationOpen}
              onCheckedChange={(checked) => handleSettingChange('registrationOpen', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
            <div className="space-y-0.5">
              <div className="text-base font-medium text-red-800">Vedlikeholdsmodus</div>
              <div className="text-sm text-red-600">
                Deaktiver siden midlertidig for vedlikehold
              </div>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
            />
          </div>
        </div>
      </div>

      {/* API konfigurasjon */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">API konfigurasjon</h3>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-green-600" />
              <span className="font-medium">Vegvesen API</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Tilkoblet</span>
            </div>
            <p className="text-sm text-gray-600">
              API for automatisk henting av kjøretøydata
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="font-medium">E-post tjeneste</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Konfigurert</span>
            </div>
            <p className="text-sm text-gray-600">
              SMTP konfigurasjon for e-post utsending
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Database</span>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">MySQL</span>
            </div>
            <p className="text-sm text-gray-600">
              Hoveddatabase for applikasjonsdata
            </p>
          </div>
        </div>
      </div>

      {/* Lagre knapp */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="min-w-32">
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Lagrer...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Lagre innstillinger
            </>
          )}
        </Button>
      </div>
    </div>
  )
}