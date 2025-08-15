"use client"
import PriceEstimation from '@/components/price-estimation'

export default function TestPricestimatePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 AI-Powered Bilprisestimering</h1>
          <p className="text-gray-600">
            Test den nye intelligente prisestimeringen som bruker OpenAI GPT-4 og markedsdata
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-blue-700 font-medium">AI-Analyse Aktiv</span>
          </div>
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
            <h3 className="font-medium text-blue-900 mb-2">🤖 Hvordan AI-analysen fungerer</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <div>1. <strong>Henter bildata:</strong> Fra Statens Vegvesen sitt kjøretøyregister (hvis tilgjengelig)</div>
              <div>2. <strong>AI-analyse:</strong> OpenAI GPT-4 analyserer merke, modell, årsmodell og markedstrends</div>
              <div>3. <strong>Intelligent prisberegning:</strong> AI vurderer depreciation, kilometerstand og tilstand</div>
              <div>4. <strong>Markedskjennskap:</strong> Tar hensyn til aktuelle priser og markedsforhold i Norge</div>
              <div>5. <strong>Konfidensanalyse:</strong> AI vurderer hvor sikker estimeringen er basert på datakvalitet</div>
              <div>6. <strong>Forklaring:</strong> Detaljert begrunnelse for prisestimeringen</div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-medium text-yellow-900 mb-2">⚠️ Viktig å vite</h3>
            <div className="text-sm text-yellow-800 space-y-1">
              <div>• Dette er et <strong>AI-estimat</strong> - ikke en garantert pris</div>
              <div>• AI-en tar hensyn til markedsforhold, men faktisk verdi kan variere</div>
              <div>• For testing: Systemet fungerer med eller uten ekte registreringsnummer</div>
              <div>• Krever gyldig OpenAI API-nøkkel i .env.local: <code>OPENAI_API_KEY=sk-...</code></div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-medium text-green-900 mb-2">🚀 OpenAI API Setup</h3>
            <div className="text-sm text-green-800 space-y-2">
              <div>1. <strong>Få API-nøkkel:</strong> Gå til <a href="https://platform.openai.com/api-keys" target="_blank" className="underline">OpenAI Platform</a></div>
              <div>2. <strong>Legg til i .env.local:</strong> <code className="bg-white px-2 py-1 rounded">OPENAI_API_KEY=sk-din_nøkkel_her</code></div>
              <div>3. <strong>Start server på nytt</strong> for at endringene skal tre i kraft</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}