import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Settings, User, Bell, Shield, CreditCard, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import DashboardLayout from '@/components/dashboard-layout'

export default async function SettingsPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in?redirectUrl=/dashboard/customer/innstillinger')
  }

  // Mock brukerdata
  const userData = {
    firstName: 'Test',
    lastName: 'Bruker',
    email: 'test@kulbruk.no',
    phone: '12345678',
    location: 'Oslo',
    bio: 'Jeg er interessert i vintage møbler og elektronikk.',
    avatar: null
  }

  return (
    <DashboardLayout userRole="customer">
      <div className="space-y-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">Innstillinger</h1>
          </div>
          <p className="text-gray-600">Administrer din profil og preferanser.</p>
        </div>

        {/* Tab navigasjon istedenfor sidebar */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Innstillinger">
            <a
              href="#profil"
              className="py-4 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600"
            >
              <User className="mr-2 h-4 w-4 inline" />
              Profil
            </a>
            <a
              href="#varsler"
              className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              <Bell className="mr-2 h-4 w-4 inline" />
              Varsler
            </a>
            <a
              href="#sikkerhet"
              className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              <Shield className="mr-2 h-4 w-4 inline" />
              Sikkerhet
            </a>
          </nav>
        </div>

        {/* Hovedinnhold */}
        <div className="space-y-8">
            {/* Profil */}
            <Card id="profil">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profilinformasjon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personlige opplysninger */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Fornavn</Label>
                    <Input id="firstName" defaultValue={userData.firstName} />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Etternavn</Label>
                    <Input id="lastName" defaultValue={userData.lastName} />
                  </div>
                  <div>
                    <Label htmlFor="email">E-post</Label>
                    <Input id="email" type="email" defaultValue={userData.email} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" defaultValue={userData.phone} />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="location">Lokasjon</Label>
                    <Input id="location" defaultValue={userData.location} placeholder="By, fylke" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="bio">Om meg</Label>
                    <Textarea 
                      id="bio" 
                      defaultValue={userData.bio} 
                      placeholder="Fortell litt om deg selv..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Lagre endringer</Button>
                </div>
              </CardContent>
            </Card>

            {/* Varsler */}
            <Card id="varsler">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Varslingsinnstillinger
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">E-postvarsler</h3>
                      <p className="text-sm text-gray-600">Motta varsler på e-post</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">Nye meldinger</h3>
                      <p className="text-sm text-gray-600">Varsler når du får nye meldinger om annonser</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">Prisendringer på favoritter</h3>
                      <p className="text-sm text-gray-600">Varsler når prisen endres på annonser du følger</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sikkerhet */}
            <Card id="sikkerhet">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Sikkerhet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="text-base font-medium mb-2">Passord</h3>
                    <p className="text-sm text-gray-600 mb-3">Sist endret: Aldri</p>
                    <Button variant="outline">Endre passord</Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="text-base font-medium mb-2">To-faktor autentisering</h3>
                    <p className="text-sm text-gray-600 mb-3">Legg til ekstra sikkerhet til kontoen din</p>
                    <Button variant="outline">Aktiver 2FA</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}