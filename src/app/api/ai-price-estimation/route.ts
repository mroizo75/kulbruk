import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface CarEstimationRequest {
  make: string
  model: string
  year: number
  mileage: number
  condition: 'A' | 'B' | 'C' | 'D'
  fuelType?: string
  transmission?: string
  color?: string
  registrationNumber?: string
}

interface PriceEstimation {
  estimatedPrice: number
  priceRange: { min: number; max: number }
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  method: string
  factors: {
    basePrice: number
    ageDeduction: number
    mileageDeduction: number
    conditionMultiplier: number
    marketTrends: string
    depreciation: number
  }
  explanation: string
  disclaimer: string
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key ikke konfigurert' },
        { status: 500 }
      )
    }

    const body: CarEstimationRequest = await request.json()
    const { make, model, year, mileage, condition, fuelType, transmission } = body

    // Validate input
    if (!make || !model || !year || !mileage || !condition) {
      return NextResponse.json(
        { error: 'Manglende obligatoriske felt' },
        { status: 400 }
      )
    }

    console.log('🤖 AI Prisestimering startet for:', { make, model, year, mileage, condition })

    // Create AI prompt for car price estimation
    const prompt = `
Du er en norsk bilekspert og prisestimator med 20 års erfaring. Analyser følgende bil og gi en REALISTISK markedspris basert på faktiske norske bruktbilpriser i 2025.

BILENS DETALJER:
- Merke: ${make}
- Modell: ${model}
- Årsmodell: ${year}
- Kilometerstand: ${mileage} km
- Tilstand: ${condition} (A=Meget god, B=God, C=Middels, D=Dårlig)
${fuelType ? `- Drivstoff: ${fuelType}` : ''}
${transmission ? `- Girkasse: ${transmission}` : ''}

VIKTIGE REFERANSER (reelle markedspriser i Norge 2025):
- BMW 320d 2015 (ca. 200k km, middels stand): 160,000-200,000 kr
- BMW 320i 2015 (ca. 200k km, middels stand): 140,000-180,000 kr  
- Audi A4 2015 diesel (ca. 200k km): 150,000-190,000 kr
- Mercedes C220d 2015 (ca. 200k km): 160,000-200,000 kr
- Volkswagen Passat 2015 diesel (ca. 200k km): 120,000-160,000 kr
- Toyota Avensis 2015 (ca. 200k km): 110,000-150,000 kr

PRINSIPPENE FOR NORSK BRUKTBILPRISING:
1. Premium merker (BMW, Audi, Mercedes) holder verdien bedre
2. Dieselbiler 2015-2017 er fortsatt populære i Norge
3. Høy kilometerstand (180k+ km) reduserer verdi med 15-25%
4. Tilstand C (middels) reduserer verdi med 10-15% fra pristilstand

OPPGAVE: Estimer REALISTISK markedspris basert på faktiske annonser på finn.no, naf.no og lignende:

SVAR I FØLGENDE JSON-FORMAT (kun JSON, ingen annen tekst):
{
  "estimatedPrice": [hovedestimatet i NOK - BRUK REALISTISKE NORSKE PRISER],
  "priceRange": {
    "min": [laveste rimelige pris],
    "max": [høyeste rimelige pris]
  },
  "confidence": "[HIGH/MEDIUM/LOW]",
  "factors": {
    "basePrice": [grunnverdi for modellen i Norge],
    "ageDeduction": [reduksjon pga alder],
    "mileageDeduction": [reduksjon pga kilometerstand],
    "conditionMultiplier": [faktor for tilstand, f.eks 0.85],
    "marketTrends": "[kort beskrivelse av markedstrend for merket]",
    "depreciation": [total verdifall fra ny]
  },
  "explanation": "[2-3 setninger om hvorfor denne prisen, sammenlign med lignende biler]",
  "disclaimer": "Dette er et AI-generert estimat basert på markedsdata. Faktisk pris kan variere avhengig av lokale forhold, bilens historie og markedssituasjon."
}

VIKTIG: Gi realistiske priser som faktisk brukes i det norske markedet. En BMW 320d 2015 med 200k km kan IKKE koste 50,000 kr - det er altfor lavt!
`

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Du er en ekspert på bruktbil-prisestimering i Norge. Du gir alltid svar i gyldig JSON-format uten ekstra tekst."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent estimates
      max_tokens: 1000
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('Ingen respons fra AI')
    }

    console.log('🤖 AI Respons mottatt:', aiResponse.substring(0, 200) + '...')

    // Parse AI response
    let estimation: PriceEstimation
    try {
      const parsed = JSON.parse(aiResponse)
      estimation = {
        estimatedPrice: Math.round(parsed.estimatedPrice),
        priceRange: {
          min: Math.round(parsed.priceRange.min),
          max: Math.round(parsed.priceRange.max)
        },
        confidence: parsed.confidence,
        method: 'AI_OPENAI_GPT4',
        factors: {
          basePrice: Math.round(parsed.factors.basePrice),
          ageDeduction: Math.round(parsed.factors.ageDeduction),
          mileageDeduction: Math.round(parsed.factors.mileageDeduction),
          conditionMultiplier: parsed.factors.conditionMultiplier,
          marketTrends: parsed.factors.marketTrends,
          depreciation: Math.round(parsed.factors.depreciation)
        },
        explanation: parsed.explanation,
        disclaimer: parsed.disclaimer
      }
    } catch (parseError) {
      console.error('❌ Kunne ikke parse AI respons:', parseError)
      console.error('Raw respons:', aiResponse)
      
      // Fallback estimation if AI response can't be parsed
      const currentYear = new Date().getFullYear()
      const carAge = currentYear - year
      const basePrice = getEstimatedBasePrice(make, model, year)
      const ageDeduction = basePrice * 0.15 * carAge
      const mileageDeduction = Math.max(0, (mileage - 100000) * 0.5)
      const conditionMultiplier = getConditionMultiplier(condition)
      
      estimation = {
        estimatedPrice: Math.round((basePrice - ageDeduction - mileageDeduction) * conditionMultiplier),
        priceRange: {
          min: Math.round((basePrice - ageDeduction - mileageDeduction) * conditionMultiplier * 0.85),
          max: Math.round((basePrice - ageDeduction - mileageDeduction) * conditionMultiplier * 1.15)
        },
        confidence: 'MEDIUM',
        method: 'FALLBACK_ALGORITHM',
        factors: {
          basePrice: Math.round(basePrice),
          ageDeduction: Math.round(ageDeduction),
          mileageDeduction: Math.round(mileageDeduction),
          conditionMultiplier,
          marketTrends: 'Fallback beregning brukt',
          depreciation: Math.round(ageDeduction + mileageDeduction)
        },
        explanation: 'AI-analyse feilet, bruker fallback algoritme for prisestimering.',
        disclaimer: 'Dette er et automatisk estimat. For mer nøyaktig vurdering, kontakt en bilekspert.'
      }
    }

    console.log('✅ Prisestimering fullført:', {
      estimatedPrice: estimation.estimatedPrice,
      confidence: estimation.confidence,
      method: estimation.method
    })

    return NextResponse.json({
      success: true,
      estimation,
      carData: {
        make,
        model,
        year,
        mileage,
        condition,
        fuelType: fuelType || 'Ukjent',
        transmission: transmission || 'Ukjent'
      }
    })

  } catch (error) {
    console.error('❌ AI Prisestimering feil:', error)
    
    return NextResponse.json(
      { 
        error: 'Kunne ikke beregne prisestimering',
        details: error instanceof Error ? error.message : 'Ukjent feil'
      },
      { status: 500 }
    )
  }
}

// Helper functions for fallback estimation
function getEstimatedBasePrice(make: string, model: string, year: number): number {
  const basePrices: { [key: string]: number } = {
    'tesla': 1200000,
    'bmw': 800000,
    'mercedes': 750000,
    'audi': 700000,
    'volvo': 600000,
    'lexus': 650000,
    'porsche': 1500000,
    'volkswagen': 500000,
    'toyota': 450000,
    'ford': 400000,
    'skoda': 380000,
    'opel': 350000,
    'nissan': 400000,
    'hyundai': 380000,
    'kia': 370000,
    'mazda': 420000,
    'subaru': 450000,
    'mitsubishi': 350000,
    'peugeot': 380000,
    'citroen': 360000,
    'renault': 370000
  }
  
  const makeKey = make.toLowerCase()
  let basePrice = basePrices[makeKey] || 400000 // Default fallback
  
  // Special cases for popular models
  if (makeKey === 'bmw' && model.toLowerCase().includes('320')) {
    basePrice = 650000 // BMW 3-serie er populær
  }
  if (makeKey === 'bmw' && model.toLowerCase().includes('520')) {
    basePrice = 800000 // BMW 5-serie
  }
  if (makeKey === 'audi' && model.toLowerCase().includes('a4')) {
    basePrice = 650000 // Audi A4
  }
  if (makeKey === 'mercedes' && model.toLowerCase().includes('c220')) {
    basePrice = 700000 // Mercedes C-klasse
  }
  
  // Adjust for year - more realistic depreciation
  const currentYear = new Date().getFullYear()
  const carAge = currentYear - year
  const yearAdjustment = Math.max(0.15, 1 - (carAge * 0.08)) // 8% per år
  
  return basePrice * yearAdjustment
}

function getConditionMultiplier(condition: string): number {
  switch (condition.toUpperCase()) {
    case 'A': return 1.0   // Meget god
    case 'B': return 0.9   // God
    case 'C': return 0.75  // Middels
    case 'D': return 0.6   // Dårlig
    default: return 0.8
  }
}
