import PriceEstimation from '@/components/price-estimation'

export default function TestPricestimatePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚗 Test Bilprisestimering</h1>
          <p className="text-gray-600">
            Test den nye automatiske prisestimeringen som bruker Statens Vegvesen sitt register
          </p>
        </div>

        <PriceEstimation 
          onEstimationComplete={(estimation) => {
            console.log('Prisestimering fullført:', estimation)
          }}
        />

        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">💡 Test-eksempler</h2>
          
          <div className="grid gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Test 1: Tesla Model S</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• <strong>Reg.nr:</strong> AB12345 (eller bruk et ekte reg.nr.)</div>
                <div>• <strong>Kilometerstand:</strong> 80,000</div>
                <div>• <strong>Tilstand:</strong> B - God</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Test 2: BMW X5</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• <strong>Reg.nr:</strong> CD67890 (eller bruk et ekte reg.nr.)</div>
                <div>• <strong>Kilometerstand:</strong> 150,000</div>
                <div>• <strong>Tilstand:</strong> C - Middels</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Test 3: Toyota Yaris</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• <strong>Reg.nr:</strong> EF11111 (eller bruk et ekte reg.nr.)</div>
                <div>• <strong>Kilometerstand:</strong> 60,000</div>
                <div>• <strong>Tilstand:</strong> A - Meget god</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">📋 Hvordan det fungerer</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <div>1. <strong>Henter bildata:</strong> Fra Statens Vegvesen sitt kjøretøyregister</div>
              <div>2. <strong>Beregner basisverdi:</strong> Basert på merke, modell og årsmodell</div>
              <div>3. <strong>Justerer for slitasje:</strong> Alder og kilometerstand</div>
              <div>4. <strong>Tilstandsvurdering:</strong> Brukerens vurdering av bilens stand</div>
              <div>5. <strong>Prisintervall:</strong> ±20% usikkerhet basert på markedsvariasjoner</div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-medium text-yellow-900 mb-2">⚠️ Viktig å vite</h3>
            <div className="text-sm text-yellow-800 space-y-1">
              <div>• Dette er et <strong>estimat</strong> - ikke en garantert pris</div>
              <div>• Faktisk verdi påvirkes av markedsforhold, bilens historie og tilstand</div>
              <div>• For testing: Hvis du ikke har et ekte reg.nr, vil API-en gi en feilmelding</div>
              <div>• Produksjon krever gyldig Vegvesen API-nøkkel i miljøvariabler</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}