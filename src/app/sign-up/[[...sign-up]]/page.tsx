"use client"

import { getProviders, signIn } from "next-auth/react"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from '@/components/ui/badge'
import { Building2, User } from 'lucide-react'
import { Input } from "@/components/ui/input"

export default function SignUpPage() {
  const [providers, setProviders] = useState<any>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const role = searchParams.get('role') || 'customer'
  const isBusiness = role === 'business'
  const callbackUrl = isBusiness ? '/complete-business-setup' : '/dashboard'

  useEffect(() => {
    const setUpProviders = async () => {
      const providers = await getProviders()
      setProviders(providers)
    }
    setUpProviders()
  }, [])

  const handleSignUp = async (providerId: string) => {
    await signIn(providerId, { callbackUrl })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#af4c0f] text-white font-bold text-xl">
              K
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 flex items-center justify-center gap-2">
            {isBusiness ? (
              <>
                <Building2 className="h-6 w-6" />
                Registrer bedrift
              </>
            ) : (
              <>
                <User className="h-6 w-6" />
                Opprett privatkonto
              </>
            )}
            {isBusiness && <Badge className="bg-[#af4c0f] text-white">PRO</Badge>}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isBusiness ? (
              <>Få tilgang til profesjonell bilhandel-verktøy</>
            ) : (
              <>Bli en del av Kulbruk-fellesskapet</>
            )}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-white shadow">
          <CardHeader>
            <CardTitle className="text-center">Velg registreringsmetode</CardTitle>
            <CardDescription className="text-center">
              Opprett konto med en av følgende tjenester
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Skjema for klassisk registrering */}
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.currentTarget as HTMLFormElement
                const formData = new FormData(form)
                const name = String(formData.get('name') || '')
                const email = String(formData.get('email') || '')
                const password = String(formData.get('password') || '')
                if (!name || !email || !password) return
                const res = await fetch('/api/auth/register', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name, email, password, role }),
                })
                if (res.ok) {
                  await signIn('credentials', { email, password, callbackUrl })
                }
              }}
              className="space-y-3"
            >
              <Input name="name" placeholder="Fullt navn" required />
              <Input type="email" name="email" placeholder="E-post" required />
              <Input type="password" name="password" placeholder="Passord" required />
              <Button type="submit" className="w-full bg-[#af4c0f] hover:bg-[#af4c0f]/90">
                Opprett konto
              </Button>
            </form>

            {providers &&
              Object.values(providers).map((provider: any) => (
                <div key={provider.name}>
                  <Button
                    onClick={() => handleSignUp(provider.id)}
                    className="w-full bg-[#af4c0f] hover:bg-[#af4c0f]/90"
                    variant="default"
                  >
                    Registrer med {provider.name}
                  </Button>
                </div>
              ))}
            
            <div className="text-center text-sm text-gray-500 mt-4">
              Ved å registrere deg godtar du våre{' '}
              <Link href="/vilkar-og-betingelser" className="text-[#af4c0f] hover:text-[#af4c0f]/80">
                vilkår og betingelser
              </Link>
            </div>
            
            <div className="mt-6 text-center">
              <Link
                href="/sign-in"
                className="text-sm text-[#af4c0f] hover:text-[#af4c0f]/80"
              >
                Har du allerede en konto? Logg inn her
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}