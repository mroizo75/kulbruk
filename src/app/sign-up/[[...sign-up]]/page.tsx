'use client'

import { SignUp } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Building2, User } from 'lucide-react'
import Link from 'next/link'

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'customer'
  const isBusiness = role === 'business'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl">
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
                Opprett konto
              </>
            )}
          </h2>
          <div className="flex justify-center mt-2">
            <Badge variant={isBusiness ? "default" : "outline"} className="text-sm">
              {isBusiness ? "Bedriftskonto" : "Privatkonto"}
            </Badge>
          </div>
          <p className="mt-4 text-center text-sm text-gray-600">
            Eller{' '}
            <Link href="/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
              logg inn med eksisterende konto
            </Link>
          </p>
          <p className="mt-1 text-center text-xs text-gray-500">
            <Link href="/registrer" className="text-blue-600 hover:text-blue-500">
              ← Tilbake til kontotype-valg
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
                card: "shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden"
              }
            }}
            redirectUrl="/dashboard"
            unsafeMetadata={{
              role: role,
              accountType: isBusiness ? 'business' : 'customer'
            }}
          />
        </div>
      </div>

      {/* Info for business accounts */}
      {isBusiness && (
        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Building2 className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Bedriftskonto</p>
                <p className="text-blue-700 mt-1">
                  Etter registrering kan du legge til organisasjonsnummer og få tilgang til våre bedriftsverktøy.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}