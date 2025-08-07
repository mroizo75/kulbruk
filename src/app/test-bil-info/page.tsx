import VehicleInfoForm from '@/components/vehicle-info-form'

export default function TestBilInfoPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚗 Test Bil-informasjon</h1>
          <p className="text-gray-600">
            Test Vegvesen API-integrasjon og bil-informasjon skjema
          </p>
        </div>

        <VehicleInfoForm 
          showAuctionOption={true}
          onVehicleDataChange={(data) => {
            console.log('Bil-data endret:', data)
          }}
        />

        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">💡 Test-funksjoner</h2>
          
          <div className="grid gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">✅ Vegvesen API</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• Henter automatisk bil-informasjon fra registreringsnummer</div>
                <div>• Viser merke, modell, årsmodell, drivstoff, girkasse, farge</div>
                <div>• Fungerer for alle norske registreringsnummer</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">🔧 Tilleggsutstyr</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• Forhåndsdefinerte alternativer (klimaanlegg, cruise control, osv)</div>
                <div>• Mulighet for å legge til custom utstyr</div>
                <div>• Enkelt å fjerne valgt utstyr</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">📋 Bil-detaljer</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• Kilometerstand og tilstand (A-D skala)</div>
                <div>• EU-kontroll dato og ulykkes-historie</div>
                <div>• Service-historikk og modifikasjoner</div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium mb-2 text-blue-900">🏆 Auksjon til forhandlere</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <div>• Checkbox for å velge auksjon-modus</div>
                <div>• Trigger prisestimering kun ved auksjon</div>
                <div>• Forklaring av auksjon-prosessen</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-medium text-yellow-900 mb-2">🎯 Bruksområder</h3>
            <div className="text-sm text-yellow-800 space-y-1">
              <div>• <strong>Normal bil-salg:</strong> Vanlig annonse med bil-info og utstyr</div>
              <div>• <strong>Auksjon:</strong> Forhandlere kan by, med prisestimering</div>
              <div>• <strong>Andre kategorier:</strong> Bolig, møbler osv bruker ikke bil-skjema</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}