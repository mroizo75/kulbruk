"use client"

import { getProviders, signIn } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function SignInPage() {
  const [providers, setProviders] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Smart redirect logic: 
  // - If redirect/callbackUrl is set and NOT dashboard → use it
  // - Otherwise use dashboard (which will route based on user role)
  const redirectParam = searchParams.get('redirect') || searchParams.get('callbackUrl')
  const callbackUrl = redirectParam && redirectParam !== '/dashboard' 
    ? redirectParam 
    : '/dashboard'

  useEffect(() => {
    const setUpProviders = async () => {
      const providers = await getProviders()
      setProviders(providers)
    }
    setUpProviders()
  }, [])

  const handleSignIn = async (providerId: string) => {
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
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Logg inn på Kulbruk.no
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Eller{' '}
            <Link href="/registrer" className="font-medium text-[#af4c0f] hover:text-[#af4c0f]/80">
              opprett en ny konto
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-white shadow">
          <CardHeader>
            <CardTitle className="text-center">Logg inn</CardTitle>
            <CardDescription className="text-center">
              Med e‑post og passord eller en tredjepartsleverandør
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* E‑post / passord */}
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.currentTarget as HTMLFormElement
                const formData = new FormData(form)
                const email = String(formData.get('email') || '')
                const password = String(formData.get('password') || '')
                if (!email || !password) return
                await signIn('credentials', { email, password, callbackUrl })
              }}
              className="space-y-3"
            >
              <Input type="email" name="email" placeholder="E‑post" required />
              <Input type="password" name="password" placeholder="Passord" required />
              <Button type="submit" className="w-full bg-[#af4c0f] hover:bg-[#af4c0f]/90">
                Logg inn
              </Button>
            </form>

            {/* OAuth-leverandører */}
            {providers &&
              Object.values(providers)
                .filter((provider: any) => provider.id !== 'credentials')
                .map((provider: any) => (
                  <div key={provider.name}>
                    <Button
                      onClick={() => handleSignIn(provider.id)}
                      className="w-full bg-[#af4c0f] hover:bg-[#af4c0f]/90"
                      variant="default"
                    >
                      Logg inn med {provider.name}
                    </Button>
                  </div>
                ))}

            <div className="text-center text-sm text-gray-500 mt-4">
              Ved å logge inn godtar du våre{' '}
              <Link href="/vilkar-og-betingelser" className="text-[#af4c0f] hover:text-[#af4c0f]/80">
                vilkår og betingelser
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}