import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CreditCard, 
  Calendar, 
  Package, 
  AlertCircle,
  CheckCircle,
  Crown,
  Zap
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import SubscriptionPlans from '@/components/subscription-plans'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function BusinessSubscriptionPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in?redirectUrl=/dashboard/business/abonnement')
  }

  // Hent brukerdata med abonnement
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: { 
      subscription: true,
      listings: {
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Denne måneden
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!dbUser || dbUser.role !== 'business') {
    redirect('/registrer-bedrift')
  }

  const subscription = dbUser.subscription
  const thisMonthListings = dbUser.listings.length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Abonnement</h1>
          <p className="text-gray-600 mt-2">
            Administrer ditt business-abonnement og få tilgang til avanserte funksjoner
          </p>
        </div>

        {/* Current Subscription Status */}
        {subscription ? (
          <Card className={`border-2 ${
            subscription.status === 'ACTIVE' 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                    {subscription.plan === 'STANDARD' ? (
                      <Crown className="h-5 w-5 text-[#af4c0f]" />
                    ) : (
                      <Package className="h-5 w-5 text-[#af4c0f]" />
                    )}
                  </div>
                  <div>
                    <CardTitle>
                      {subscription.plan === 'BASIC' ? 'Basic Business' : 'Standard Business'}
                    </CardTitle>
                    <CardDescription>
                      {Number(subscription.pricePerMonth)} kr per måned
                    </CardDescription>
                  </div>
                </div>
                <Badge className={
                  subscription.status === 'ACTIVE' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-red-600 text-white'
                }>
                  {subscription.status === 'ACTIVE' ? 'Aktivt' : 
                   subscription.status === 'CANCELED' ? 'Kansellert' :
                   subscription.status === 'PAST_DUE' ? 'Forfalt' : 'Ubetalt'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <Zap className="h-6 w-6 text-[#af4c0f] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {subscription.adsRemaining}
                  </div>
                  <p className="text-sm text-gray-600">Annonser igjen</p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg border">
                  <Package className="h-6 w-6 text-[#af4c0f] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {subscription.adsPerMonth}
                  </div>
                  <p className="text-sm text-gray-600">Annonser per måned</p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg border">
                  <Calendar className="h-6 w-6 text-[#af4c0f] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {thisMonthListings}
                  </div>
                  <p className="text-sm text-gray-600">Brukt denne måned</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white rounded-lg border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Neste fornyelse:</span>
                  <span className="font-medium">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString('nb-NO')}
                  </span>
                </div>
              </div>

              {subscription.status === 'ACTIVE' && subscription.adsRemaining === 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Ingen annonser igjen
                      </p>
                      <p className="text-sm text-yellow-700">
                        Du har brukt opp alle annonser for denne måneden. 
                        Oppgrader til et høyere abonnement for flere annonser.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Ingen aktivt abonnement
              </CardTitle>
              <CardDescription>
                Du trenger et business-abonnement for å legge ut bil-annonser og få tilgang til auksjoner.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <AlertCircle className="h-4 w-4" />
                <span>Velg et abonnement nedenfor for å komme i gang.</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Plans */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {subscription ? 'Oppgrader abonnement' : 'Velg abonnement'}
          </h2>
          <SubscriptionPlans 
            currentPlan={subscription?.plan || null}
            adsRemaining={subscription?.adsRemaining || 0}
          />
        </div>

        {/* Billing History */}
        {subscription && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#af4c0f]" />
                Fakturahistorikk
              </CardTitle>
              <CardDescription>
                Oversikt over dine betalinger og fakturaer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Fakturahistorikk vil vises her</p>
                <p className="text-sm">Denne funksjonen implementeres snart</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="border-2 border-[#af4c0f]/20 bg-[#af4c0f]/5">
          <CardHeader>
            <CardTitle>Trenger du hjelp?</CardTitle>
            <CardDescription>
              Vårt supportteam er klare til å hjelpe deg med abonnement og fakturering
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="outline" className="border-[#af4c0f] text-[#af4c0f]">
                <Link href="/kontakt-oss">
                  Kontakt support
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-[#af4c0f] text-[#af4c0f]">
                <Link href="/hjelp-og-stotte">
                  Les FAQ
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
