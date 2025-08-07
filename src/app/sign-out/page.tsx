"use client"

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export default function SignOutPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut({ callbackUrl: '/' })
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
            Logg ut av Kulbruk.no
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Takk for at du brukte Kulbruk.no!
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isLoading ? 'Logger ut...' : 'Logg ut'}
          </button>
          
          <div className="mt-4">
            <Link 
              href="/dashboard"
              className="text-sm text-[#af4c0f] hover:text-[#af4c0f]/80"
            >
              Tilbake til dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}