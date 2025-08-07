import { NextRequest, NextResponse } from 'next/server'

// Enkel mock-data generator for testing
function generateSimpleMockFlights(origin: string, destination: string) {
  const airlines = [
    { code: 'SK', name: 'SAS' },
    { code: 'DY', name: 'Norwegian' },
    { code: 'FR', name: 'Ryanair' },
    { code: 'BA', name: 'British Airways' },
    { code: 'LH', name: 'Lufthansa' },
    { code: 'KL', name: 'KLM' },
    { code: 'AF', name: 'Air France' }
  ]

  const mockOffers = []
  
  for (let i = 0; i < 50; i++) { // Økt til 50 resultater
    const airline = airlines[i % airlines.length]
    
    // REALISTISKE NORSKE PRISER som matcher FINN.no (1095 kr range)
    let basePrice = 600 // Redusert basepris for å matche FINN.no
    const priceMultipliers = {
      'DY': 0.65, // Norwegian - ca 390-650 kr (som FINN.no)
      'FR': 0.55, // Ryanair - enda billigere 330-550 kr
      'U2': 0.68, // easyJet - ca 400-680 kr
      'W6': 0.62, // Wizz Air - ca 370-620 kr
      'SK': 1.0,  // SAS - ca 600-1000 kr
      'BA': 1.1,  // British Airways - ca 660-1100 kr
      'LH': 1.05, // Lufthansa - ca 630-1050 kr
      'AF': 1.02, // Air France - ca 610-1020 kr
      'KL': 0.95  // KLM - ca 570-950 kr
    }
    
    const multiplier = priceMultipliers[airline.code] || 1.0
    const randomVariation = 0.8 + Math.random() * 0.8 // 80% - 160% av base
    const price = basePrice * multiplier * randomVariation
    
    // Variere datoer over flere dager i oktober
    const dayOffset = Math.floor(i / 7) // Nye dager hver 7. iterasjon
    const currentDay = 15 + dayOffset
    const departureDate = `2025-10-${currentDay.toString().padStart(2, '0')}`
    
    // Enkle tidspunkter (hold innenfor 0-23 timer)
    const depHour = (6 + (i * 2)) % 24
    const arrHour = (depHour + 2) % 24
    
    mockOffers.push({
      id: `MOCK_${i + 1}`,
      price: {
        total: price.toFixed(2),
        currency: 'NOK',
        formattedNOK: `${Math.round(price).toLocaleString('nb-NO')} kr`
      },
      numberOfBookableSeats: 9,
      validatingAirlineCodes: [airline.code],
      itineraries: [{
        duration: 'PT2H30M',
        segments: [{
          departure: {
            iataCode: origin,
            at: `${departureDate}T${depHour.toString().padStart(2, '0')}:30:00`,
            formatted: `${depHour.toString().padStart(2, '0')}:30`
          },
          arrival: {
            iataCode: destination,
            at: `${departureDate}T${arrHour.toString().padStart(2, '0')}:00:00`,
            formatted: `${arrHour.toString().padStart(2, '0')}:00`
          },
          carrierCode: airline.code,
          number: `${airline.code}${1000 + i}`,
          duration: 'PT2H30M',
          aircraft: { code: i % 2 === 0 ? 'B737' : 'A320' }
        }]
      }],
      originalOffer: null
    })
  }

  return mockOffers
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { origin = 'OSL', destination = 'LHR' } = body

    console.log('🧪 Genererer forbedret mock flydata med realistiske priser...')
    
    const mockOffers = generateSimpleMockFlights(origin, destination)
    const prices = mockOffers.map(o => Math.round(parseFloat(o.price.total)))
    console.log(`✅ Genererte ${mockOffers.length} mock flyreiser med priser fra ${Math.min(...prices)} - ${Math.max(...prices)} NOK`)

    return NextResponse.json({
      success: true,
      offers: mockOffers,
      message: `Fant ${mockOffers.length} flytilbud (mock data)`,
      searchStrategy: 'simple_mock_data'
    })

  } catch (error) {
    console.error('Simple Flight Search API feil:', error)
    return NextResponse.json(
      { error: 'Intern server feil', details: error.message },
      { status: 500 }
    )
  }
}
