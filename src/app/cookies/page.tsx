import Link from 'next/link'
import dynamic from 'next/dynamic'

export const metadata = {
  title: 'Cookies – Kulbruk',
  description: 'Informasjon om bruk av cookies og lokal lagring på Kulbruk.no',
}

export default function CookiesPage() {
  const CookiePreferences = dynamic(() => import('@/components/cookie-preferences'), { ssr: true })
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Cookies</h1>
        <p className="text-gray-700 mb-6">
          Vi bruker cookies og lokal lagring for å gi deg en bedre opplevelse på Kulbruk.no. Noen er nødvendige for at
          siden skal fungere, mens andre brukes til funksjonalitet som husker valg, forbedrer ytelse, og
          personaliserer innhold.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-2">Typer vi bruker</h2>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>
            Nødvendige: Påkrevd for innlogging, sikkerhet og grunnleggende funksjoner.
          </li>
          <li>
            Funksjonelle: Husker innstillinger (f.eks. lagrede søk på din enhet).
          </li>
          <li>
            Ytelse/Analyse: Aggregert statistikk for å forbedre tjenesten.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-2">Lokal lagring</h2>
        <p className="text-gray-700 mb-4">
          Vi kan lagre enkelte preferanser og søkehistorikk lokalt i nettleseren din. Dette er kun tilgjengelig på din
          enhet og kan slettes når som helst via nettleserens innstillinger. Se også vår{' '}
          <Link className="text-blue-600 underline" href="/personvern">personvernerklæring</Link> for detaljer.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-2">Samtykke</h2>
        <p className="text-gray-700 mb-4">
          Ved første besøk ber vi om samtykke til ikke‑nødvendige cookies. Du kan når som helst oppdatere valgene dine
          ved å tømme nettleserens lagrede data eller bruke nettleserens innebygde kontroller.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-2">Administrer cookies</h2>
        <p className="text-gray-700">
          Du kan endre innstillinger i nettleseren din for å blokkere eller slette cookies. Vær oppmerksom på at noen
          funksjoner på Kulbruk.no kan slutte å fungere uten cookies.
        </p>

        <CookiePreferences />
      </div>
    </div>
  )
}


