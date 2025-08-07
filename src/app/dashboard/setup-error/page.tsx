import { AlertTriangle, Mail, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SetupErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <CardTitle className="text-2xl font-bold text-gray-900">
            Brukeroppsettet feilet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Det oppstod en teknisk feil under oppsettet av din brukerprofil. Dette er et systemfeil som må fikses av våre utviklere.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>For utviklere:</strong> Clerk webhook fungerer ikke korrekt. Sjekk webhook-konfigurasjonen i Clerk Dashboard.
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button asChild className="w-full" variant="outline">
              <Link href="/sign-out">
                <RefreshCw className="mr-2 h-4 w-4" />
                Prøv å logge inn på nytt
              </Link>
            </Button>
            
            <Button asChild className="w-full">
              <Link href="/kontakt-oss">
                <Mail className="mr-2 h-4 w-4" />
                Kontakt support
              </Link>
            </Button>
            
            <Button asChild className="w-full" variant="ghost">
              <Link href="/">
                Tilbake til forsiden
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
