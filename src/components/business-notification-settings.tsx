'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { 
  Bell, 
  Car, 
  Mail,
  Smartphone,
  DollarSign,
  Calendar,
  TrendingUp,
  Save,
  Loader,
  Plus,
  X,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'

interface NotificationSettings {
  enabled: boolean
  channels: string[]
  preferences: {
    newAuctions: boolean
    bidUpdates: boolean
    auctionEnding: boolean
    marketReports: boolean
    systemUpdates: boolean
  }
  brandFilters: {
    enabled: boolean
    selectedBrands: string[]
    priceRange: {
      min: number
      max: number
    }
    yearRange: {
      min: number
      max: number
    }
  }
}

interface PopularBrand {
  name: string
  count: number
  trend: string
}

interface BusinessNotificationSettingsProps {
  settings: NotificationSettings
  popularBrands: PopularBrand[]
}

export default function BusinessNotificationSettings({ settings, popularBrands }: BusinessNotificationSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState(settings)
  const [newBrand, setNewBrand] = useState('')

  const handleToggle = (section: string, key?: string) => {
    setNotificationSettings(prev => {
      if (key) {
        return {
          ...prev,
          [section]: {
            ...prev[section as keyof NotificationSettings],
            [key]: !prev[section as keyof NotificationSettings][key as keyof any]
          }
        }
      } else {
        return {
          ...prev,
          [section]: !prev[section as keyof NotificationSettings]
        }
      }
    })
  }

  const handleChannelToggle = (channel: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }))
  }

  const handleBrandToggle = (brand: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      brandFilters: {
        ...prev.brandFilters,
        selectedBrands: prev.brandFilters.selectedBrands.includes(brand)
          ? prev.brandFilters.selectedBrands.filter(b => b !== brand)
          : [...prev.brandFilters.selectedBrands, brand]
      }
    }))
  }

  const addCustomBrand = () => {
    if (newBrand.trim() && !notificationSettings.brandFilters.selectedBrands.includes(newBrand.trim())) {
      setNotificationSettings(prev => ({
        ...prev,
        brandFilters: {
          ...prev.brandFilters,
          selectedBrands: [...prev.brandFilters.selectedBrands, newBrand.trim()]
        }
      }))
      setNewBrand('')
    }
  }

  const removeBrand = (brand: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      brandFilters: {
        ...prev.brandFilters,
        selectedBrands: prev.brandFilters.selectedBrands.filter(b => b !== brand)
      }
    }))
  }

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value.replace(/\s/g, '')) || 0
    setNotificationSettings(prev => ({
      ...prev,
      brandFilters: {
        ...prev.brandFilters,
        priceRange: {
          ...prev.brandFilters.priceRange,
          [type]: numValue
        }
      }
    }))
  }

  const handleYearRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || new Date().getFullYear()
    setNotificationSettings(prev => ({
      ...prev,
      brandFilters: {
        ...prev.brandFilters,
        yearRange: {
          ...prev.brandFilters.yearRange,
          [type]: numValue
        }
      }
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/business/notification-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(notificationSettings)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Varslingsinnstillinger lagret!')
      } else {
        toast.error(data.error || 'Kunne ikke lagre innstillinger')
      }
    } catch (error) {
      console.error('Lagring feilet:', error)
      toast.error('Noe gikk galt. Prøv igjen.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Hovedinnstillinger */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Varslingsinnstillinger
          </CardTitle>
          <CardDescription>
            Administrer hvordan og når du vil motta varsler
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Master toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Aktiver varsler</div>
              <div className="text-sm text-gray-600">
                Motta real-time varsler om nye auksjoner og bud-oppdateringer
              </div>
            </div>
            <Switch
              checked={notificationSettings.enabled}
              onCheckedChange={() => handleToggle('enabled')}
            />
          </div>

          {notificationSettings.enabled && (
            <>
              {/* Varslingskanaler */}
              <div>
                <h4 className="font-medium mb-3">Varslingskanaler</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">E-post</span>
                    </div>
                    <Switch
                      checked={notificationSettings.channels.includes('email')}
                      onCheckedChange={() => handleChannelToggle('email')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">SMS</span>
                    </div>
                    <Switch
                      checked={notificationSettings.channels.includes('sms')}
                      onCheckedChange={() => handleChannelToggle('sms')}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Varseltyper */}
              <div>
                <h4 className="font-medium mb-3">Hva vil du få varsler om?</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Nye auksjoner</div>
                      <div className="text-sm text-gray-600">
                        Få beskjed øyeblikkelig når nye biler legges ut
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.preferences.newAuctions}
                      onCheckedChange={() => handleToggle('preferences', 'newAuctions')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Bud-oppdateringer</div>
                      <div className="text-sm text-gray-600">
                        Varsler når du blir utkonkurrert eller vinner
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.preferences.bidUpdates}
                      onCheckedChange={() => handleToggle('preferences', 'bidUpdates')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auksjoner avslutter snart</div>
                      <div className="text-sm text-gray-600">
                        2 timer før auksjon avsluttes
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.preferences.auctionEnding}
                      onCheckedChange={() => handleToggle('preferences', 'auctionEnding')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Markedsrapporter</div>
                      <div className="text-sm text-gray-600">
                        Ukentlige trender og prisrapporter
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.preferences.marketReports}
                      onCheckedChange={() => handleToggle('preferences', 'marketReports')}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Bilmerke-filtre */}
      {notificationSettings.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Smart filtering
            </CardTitle>
            <CardDescription>
              Velg hvilke bilmerker og prisklasser du vil følge
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Enable filtering */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Aktiver smart filtering</div>
                <div className="text-sm text-gray-600">
                  Få kun varsler for biler som matcher dine kriterier
                </div>
              </div>
              <Switch
                checked={notificationSettings.brandFilters.enabled}
                onCheckedChange={() => handleToggle('brandFilters', 'enabled')}
              />
            </div>

            {notificationSettings.brandFilters.enabled && (
              <>
                {/* Bilmerker */}
                <div>
                  <h4 className="font-medium mb-3">Bilmerker jeg følger</h4>
                  
                  {/* Valgte merker */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {notificationSettings.brandFilters.selectedBrands.map(brand => (
                        <Badge key={brand} variant="outline" className="text-blue-600 border-blue-200 pr-1">
                          {brand}
                          <button
                            onClick={() => removeBrand(brand)}
                            className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {notificationSettings.brandFilters.selectedBrands.length === 0 && (
                        <p className="text-sm text-gray-500 italic">Ingen merker valgt - du får varsler for alle merker</p>
                      )}
                    </div>
                  </div>

                  {/* Populære merker */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Populære merker på plattformen:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {popularBrands.map(brand => (
                        <div
                          key={brand.name}
                          onClick={() => handleBrandToggle(brand.name)}
                          className={`p-3 border rounded cursor-pointer transition-colors ${
                            notificationSettings.brandFilters.selectedBrands.includes(brand.name)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-sm">{brand.name}</div>
                          <div className="text-xs text-gray-600">{brand.count} auksjoner</div>
                          <div className={`text-xs ${brand.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {brand.trend}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legg til eget merke */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Legg til eget bilmerke..."
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCustomBrand()}
                    />
                    <Button onClick={addCustomBrand} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Prisfilter */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Prisområde
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minPrice">Minimum pris</Label>
                      <Input
                        id="minPrice"
                        value={notificationSettings.brandFilters.priceRange.min.toLocaleString('no-NO')}
                        onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                        placeholder="100 000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxPrice">Maksimum pris</Label>
                      <Input
                        id="maxPrice"
                        value={notificationSettings.brandFilters.priceRange.max.toLocaleString('no-NO')}
                        onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                        placeholder="1 000 000"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Årsmodell filter */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Årsmodell
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minYear">Fra år</Label>
                      <Input
                        id="minYear"
                        type="number"
                        value={notificationSettings.brandFilters.yearRange.min}
                        onChange={(e) => handleYearRangeChange('min', e.target.value)}
                        min="2000"
                        max="2024"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxYear">Til år</Label>
                      <Input
                        id="maxYear"
                        type="number"
                        value={notificationSettings.brandFilters.yearRange.max}
                        onChange={(e) => handleYearRangeChange('max', e.target.value)}
                        min="2000"
                        max="2024"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Save button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={isLoading}
          className="min-w-32"
        >
          {isLoading ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
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
