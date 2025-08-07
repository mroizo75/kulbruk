import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Building2, 
  User, 
  CreditCard, 
  Bell, 
  Shield,
  Settings,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Crown,
  CheckCircle
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import BusinessProfileForm from '@/components/business-profile-form'
import BusinessSubscriptionCard from '@/components/business-subscription-card'

const prisma = new PrismaClient()

export default async function BusinessSettingsPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in?redirectUrl=/dashboard/business/innstillinger')
  }

  // Sjekk business tilgang og hent data
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { 
      role: true, 
      companyName: true,
      orgNumber: true,
      phone: true,
      location: true,
      website: true,
      firstName: true,
      lastName: true,
      email: true,
      createdAt: true
    }
  })

  if (!dbUser || dbUser.role !== 'business') {
    redirect('/registrer-bedrift')
  }

  // Mock abonnement data
  const subscription = {
    plan: 'Professional',
    status: 'active',
    nextBilling: new Date('2024-02-20T00:00:00'),
    price: 1999,
    features: [
      'Ubegrenset auksjons-tilgang',
      'Profit-kalkulator og analyser',
      'Prioritert kundesupport',
      'Avanserte søkefiltre',
      'Export av data'
    ]
  }

  // Mock statistikk
  const accountStats = {
    memberSince: dbUser.createdAt,
    totalBids: 28,
    wonAuctions: 5,
    totalSpent: 1250000,
    avgMargin: 18.5
  }

  return (
    <DashboardLayout userRole="business">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Bedriftsinnstillinger
          </h1>
          <p className="text-gray-600">
            Administrer din bedriftsprofil, abonnement og innstillinger
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Bedriftsprofil
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Konto
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Abonnement
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Varsler
            </TabsTrigger>
          </TabsList>

          {/* Bedriftsprofil */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BusinessProfileForm 
                  company={{
                    name: dbUser.companyName || '',
                    orgNumber: dbUser.orgNumber || '',
                    phone: dbUser.phone || '',
                    location: dbUser.location || '',
                    website: dbUser.website || '',
                    contactPerson: `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim()
                  }}
                />
              </div>
              
              {/* Bedriftsinfo kort */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bedriftsoversikt</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-8 w-8 text-blue-600" />
                      <div>
                        <div className="font-semibold">{dbUser.companyName}</div>
                        <div className="text-sm text-gray-600">Org.nr: {dbUser.orgNumber}</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{dbUser.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{dbUser.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{dbUser.location}</span>
                      </div>
                      {dbUser.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <a href={dbUser.website} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:underline">
                            {dbUser.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Kontostatistikk</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-600">Medlem siden</div>
                        <div className="font-semibold">
                          {new Date(accountStats.memberSince).toLocaleDateString('no-NO')}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Totale bud</div>
                        <div className="font-semibold">{accountStats.totalBids}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Vunne auksjoner</div>
                        <div className="font-semibold text-green-600">{accountStats.wonAuctions}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Suksessrate</div>
                        <div className="font-semibold">
                          {Math.round((accountStats.wonAuctions / accountStats.totalBids) * 100)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Konto */}
          <TabsContent value="account">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kontoinformasjon</CardTitle>
                  <CardDescription>
                    Oppdater dine personlige kontaktdetaljer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Fornavn</Label>
                      <Input 
                        id="firstName" 
                        defaultValue={dbUser.firstName || ''} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Etternavn</Label>
                      <Input 
                        id="lastName" 
                        defaultValue={dbUser.lastName || ''} 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">E-post</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      defaultValue={dbUser.email} 
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      E-post kan ikke endres. Kontakt support hvis nødvendig.
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      defaultValue={dbUser.phone || ''} 
                    />
                  </div>
                  
                  <Button>Lagre endringer</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sikkerhet</CardTitle>
                  <CardDescription>
                    Administrer passord og sikkerheitsinnstillinger
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">To-faktor autentisering</span>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Aktivert
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">E-post bekreftet</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      Endre passord
                    </Button>
                    <Button variant="outline" className="w-full">
                      Last ned mine data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Abonnement */}
          <TabsContent value="subscription">
            <BusinessSubscriptionCard subscription={subscription as any} />
          </TabsContent>

          {/* Varsler */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Varslingsinnstillinger</CardTitle>
                <CardDescription>
                  Velg hvilke varsler du vil motta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Nye auksjoner</div>
                      <div className="text-sm text-gray-600">
                        Få beskjed når nye biler legges ut til auksjon
                      </div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Bud-status</div>
                      <div className="text-sm text-gray-600">
                        Varsler når du blir utkonkurrert eller vinner
                      </div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auksjoner avslutter snart</div>
                      <div className="text-sm text-gray-600">
                        Påminnelse 2 timer før auksjon avsluttes
                      </div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Markedsrapporter</div>
                      <div className="text-sm text-gray-600">
                        Ukentlige rapporter om bilmarkedet
                      </div>
                    </div>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-3">Varslingskanal</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="channel" value="email" defaultChecked />
                      <span className="text-sm">E-post</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="channel" value="sms" />
                      <span className="text-sm">SMS</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="channel" value="both" />
                      <span className="text-sm">Både e-post og SMS</span>
                    </label>
                  </div>
                </div>
                
                <Button>Lagre innstillinger</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
