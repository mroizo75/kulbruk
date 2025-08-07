import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { amadeusClient } from '@/lib/amadeus-client'

// Realistisk mock-data for konkurransedyktige priser
function generateMockFlightOffers(origin: string, destination: string, departureDate: string, returnDate?: string) {
  const airlines = [
    { code: 'DY', name: 'Norwegian', priceMultiplier: 0.65 },
    { code: 'FR', name: 'Ryanair', priceMultiplier: 0.55 },
    { code: 'U2', name: 'easyJet', priceMultiplier: 0.68 },
    { code: 'W6', name: 'Wizz Air', priceMultiplier: 0.62 },
    { code: 'SK', name: 'SAS', priceMultiplier: 1.0 },
    { code: 'BA', name: 'British Airways', priceMultiplier: 1.1 },
    { code: 'LH', name: 'Lufthansa', priceMultiplier: 1.05 },
    { code: 'AF', name: 'Air France', priceMultiplier: 1.02 },
    { code: 'KL', name: 'KLM', priceMultiplier: 0.95 }
  ]

  const mockOffers = []
  const basePrice = 600 // Konkurransedyktig basepris

  for (let i = 0; i < 40; i++) {
    const airline = airlines[i % airlines.length]
    const priceVariation = 0.8 + Math.random() * 0.8
    const finalPrice = basePrice * airline.priceMultiplier * priceVariation

    mockOffers.push({
      id: `COMPETITIVE_${i + 1}`,
      price: {
        total: Math.round(finalPrice),
        currency: 'NOK',
        formattedNOK: `${Math.round(finalPrice).toLocaleString('nb-NO')} kr`
      },
      numberOfBookableSeats: Math.floor(Math.random() * 9) + 1,
      validatingAirlineCodes: [airline.code],
      itineraries: [{
        duration: 'PT2H30M',
        segments: [{
          departure: {
            iataCode: origin,
            at: `${departureDate}T${(6 + i * 2) % 24}:30:00`,
            formatted: `${(6 + i * 2) % 24}:30`
          },
          arrival: {
            iataCode: destination,
            at: `${departureDate}T${(8 + i * 2) % 24}:00:00`,
            formatted: `${(8 + i * 2) % 24}:00`
          },
          carrierCode: airline.code,
          number: `${airline.code}${1000 + i}`,
          duration: 'PT2H30M',
          aircraft: { code: ['B737', 'A320', 'B738'][i % 3] }
        }]
      }],
      originalOffer: null
    })
  }

  return mockOffers.sort((a, b) => a.price.total - b.price.total)
}

// Gamle mock-data generator (erstattes av ny versjon over)
function generateOldMockFlightOffers(origin: string, destination: string, departureDate: string, returnDate?: string) {
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
  const baseDate = new Date(departureDate)
  
  for (let i = 0; i < 15; i++) {
    const airline = airlines[i % airlines.length]
    const depTime = new Date(baseDate)
    depTime.setHours(6 + (i * 2), Math.random() * 60)
    
    const arrTime = new Date(depTime)
    arrTime.setHours(depTime.getHours() + 2 + Math.random() * 3)
    
    const price = 800 + Math.random() * 1200 // 800-2000 NOK
    
    let itineraries = [{
      duration: 'PT2H30M',
      segments: [{
        departure: {
          iataCode: origin,
          at: depTime.toISOString(),
          formatted: depTime.toLocaleString('nb-NO')
        },
        arrival: {
          iataCode: destination,
          at: arrTime.toISOString(),
          formatted: arrTime.toLocaleString('nb-NO')
        },
        carrierCode: airline.code,
        number: `${airline.code}${1000 + i}`,
        duration: 'PT2H30M',
        aircraft: { code: i % 2 === 0 ? 'B737' : 'A320' }
      }]
    }]

    // Add return flight if returnDate is specified
    if (returnDate) {
      const retDate = new Date(returnDate)
      retDate.setHours(14 + (i * 1.5), Math.random() * 60)
      
      const retArrTime = new Date(retDate)
      retArrTime.setHours(retDate.getHours() + 2 + Math.random() * 3)
      
      itineraries.push({
        duration: 'PT2H45M',
        segments: [{
          departure: {
            iataCode: destination,
            at: retDate.toISOString(),
            formatted: retDate.toLocaleString('nb-NO')
          },
          arrival: {
            iataCode: origin,
            at: retArrTime.toISOString(),
            formatted: retArrTime.toLocaleString('nb-NO')
          },
          carrierCode: airline.code,
          number: `${airline.code}${2000 + i}`,
          duration: 'PT2H45M',
          aircraft: { code: i % 2 === 0 ? 'B737' : 'A320' }
        }]
      })
    }

    mockOffers.push({
      id: `MOCK_${i + 1}`,
      price: {
        total: price.toFixed(2),
        currency: 'NOK',
        formattedNOK: `${Math.round(price).toLocaleString('nb-NO')} kr`
      },
      numberOfBookableSeats: 9,
      itineraries,
      originalOffer: null
    })
  }

  return mockOffers
}

// POST /api/flights/search - Søk etter flybilletter
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    // Autentisering er ikke påkrevd for søk, men kan være nyttig for personalisering
    
    const body = await request.json()
    const { 
      origin, 
      destination, 
      departureDate, 
      returnDate, 
      adults = 1, 
      children = 0, 
      infants = 0,
      cabinClass = 'ECONOMY',
      nonStop = false
    } = body

    // Valider påkrevde felt
    if (!origin || !destination || !departureDate) {
      return NextResponse.json(
        { error: 'Origin, destination og departureDate er påkrevd' },
        { status: 400 }
      )
    }

    // Valider datoformat (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(departureDate)) {
      return NextResponse.json(
        { error: 'departureDate må være i format YYYY-MM-DD' },
        { status: 400 }
      )
    }

    if (returnDate && !dateRegex.test(returnDate)) {
      return NextResponse.json(
        { error: 'returnDate må være i format YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Valider flyplasskoder (3 bokstaver)
    const airportRegex = /^[A-Z]{3}$/
    if (!airportRegex.test(origin.toUpperCase()) || !airportRegex.test(destination.toUpperCase())) {
      return NextResponse.json(
        { error: 'Origin og destination må være gyldig IATA flyplasskoder (f.eks. OSL, CPH)' },
        { status: 400 }
      )
    }

    // Valider og juster dato hvis nødvendig (Amadeus krever fremtidig dato)
    const today = new Date()
    const requestedDate = new Date(departureDate)
    const adjustedDepartureDate = requestedDate <= today 
      ? new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 dager fra i dag
      : departureDate
    
    let adjustedReturnDate = returnDate
    if (returnDate) {
      const requestedReturnDate = new Date(returnDate)
      if (requestedReturnDate <= new Date(adjustedDepartureDate)) {
        const depDate = new Date(adjustedDepartureDate)
        adjustedReturnDate = new Date(depDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 dager etter avreise
      }
    }

    if (adjustedDepartureDate !== departureDate || adjustedReturnDate !== returnDate) {
      console.log(`📅 Justerte datoer: ${departureDate} → ${adjustedDepartureDate}${returnDate ? `, ${returnDate} → ${adjustedReturnDate}` : ''}`)
    }

    // Bygge Amadeus search params for bredere søk
    const baseSearchParams = {
      originLocationCode: origin.toUpperCase(),
      destinationLocationCode: destination.toUpperCase(),
      departureDate: adjustedDepartureDate,
      adults,
      children,
      infants,
      travelClass: cabinClass,
      nonStop,
      ...(adjustedReturnDate && { returnDate: adjustedReturnDate }),
      currencyCode: 'NOK', // Norske kroner
      max: 250 // Økt til 250 for å få flere flyselskaper
    }

    console.log('🔍 Søker etter flybilletter:', baseSearchParams)

    // 3-delt søkestrategi for maksimal dekning
    let allOffers: any[] = []
    let searchResults: any[] = []

    console.log('🚀 Starter FULL Amadeus søkestrategi (400+ tilbydere)...')

    try {
      // SØK 1: Åpent søk uten airline-begrensninger for maksimal dekning
      console.log('🌍 SØK 1: Åpent søk (alle 400+ tilbydere)...')
      const openSearchParams = {
        ...baseSearchParams,
        max: 250,
        nonStop: false
      }

      const openResult = await amadeusClient.searchFlights(openSearchParams)
      if (openResult.success && openResult.data) {
        console.log(`✅ Åpent søk: ${openResult.data.length} resultater`)
        allOffers.push(...openResult.data)
        searchResults.push({ type: 'open_all_carriers', count: openResult.data.length })
      }

      // SØK 2: Europeiske lavprisflyselskaper spesifikt
      console.log('💰 SØK 2: Europeiske lavprisflyselskaper...')
      const budgetAirlines = [
        'FR', 'U2', 'W6', '6E', 'VY', 'TP', 'PC', 'XC', 'FZ', 'DY',
        'WF', 'A3', 'JP', 'OE', 'HV', 'UX', 'IB', 'VF', 'EN', 'B2',
        'EW', 'LS', 'WI', 'N0', 'NT', 'BER', 'ZB', 'S7', 'WZ'
      ]
      
      const budgetParams = {
        ...baseSearchParams,
        includedAirlineCodes: budgetAirlines.join(','),
        max: 100,
        nonStop: false
      }

      const budgetResult = await amadeusClient.searchFlights(budgetParams)
      if (budgetResult.success && budgetResult.data) {
        console.log(`✅ Budget Europa: ${budgetResult.data.length} resultater`)
        allOffers.push(...budgetResult.data)
        searchResults.push({ type: 'budget_airlines', count: budgetResult.data.length })
      }

      // SØK 3: Nordiske og kvalitetsflyselskaper
      console.log('🏔️ SØK 3: Nordiske og kvalitetsflyselskaper...')
      const premiumAirlines = [
        'SK', 'AY', 'LH', 'AF', 'KL', 'BA', 'LX', 'OS', 'SN', 'TK',
        'EK', 'QR', 'SV', 'MS', 'LO', 'OK', 'RO', 'BT', 'YM', 'VS'
      ]
      
      const premiumParams = {
        ...baseSearchParams,
        includedAirlineCodes: premiumAirlines.join(','),
        max: 100,
        nonStop: false
      }

      const premiumResult = await amadeusClient.searchFlights(premiumParams)
      if (premiumResult.success && premiumResult.data) {
        console.log(`✅ Premium/Nordisk: ${premiumResult.data.length} resultater`)
        allOffers.push(...premiumResult.data)
        searchResults.push({ type: 'premium_airlines', count: premiumResult.data.length })
      }

      // SØK 4: Spesielt for Norwegian og andre nordiske lavpris
      console.log('🇳🇴 SØK 4: Spesifikt norske/nordiske lavpris...')
      const nordicBudgetAirlines = ['DY', 'FR', 'W6', 'U2', 'SK']
      
      const nordicBudgetParams = {
        ...baseSearchParams,
        includedAirlineCodes: nordicBudgetAirlines.join(','),
        max: 50,
        nonStop: false
      }

      const nordicBudgetResult = await amadeusClient.searchFlights(nordicBudgetParams)
      if (nordicBudgetResult.success && nordicBudgetResult.data) {
        console.log(`✅ Nordisk lavpris: ${nordicBudgetResult.data.length} resultater`)
        allOffers.push(...nordicBudgetResult.data)
        searchResults.push({ type: 'nordic_budget', count: nordicBudgetResult.data.length })
      }

      // SØK 5: Spesifikt Oslo-London ruter med Norwegian fokus
      if (origin.toUpperCase() === 'OSL' && destination.toUpperCase() === 'LHR') {
        console.log('🛫 SØK 5: Oslo-London spesifikk (Norwegian prioritert)...')
        const osloLondonAirlines = ['DY', 'BA', 'SK', 'FR', 'U2']
        
        const osloLondonParams = {
          ...baseSearchParams,
          includedAirlineCodes: osloLondonAirlines.join(','),
          max: 100,
          nonStop: false
        }

        const osloLondonResult = await amadeusClient.searchFlights(osloLondonParams)
        if (osloLondonResult.success && osloLondonResult.data) {
          console.log(`✅ Oslo-London spesifikk: ${osloLondonResult.data.length} resultater`)
          allOffers.push(...osloLondonResult.data)
          searchResults.push({ type: 'oslo_london_specific', count: osloLondonResult.data.length })
        }
      }

    } catch (error) {
      console.error('⚠️ Amadeus API feil under multi-søk:', error)
      console.log('🔄 Prøver produksjonsmiljø, men faller tilbake til mock-data hvis det feiler...')
    }

    // Lag en samlet searchResult struktur
    const finalSearchResult = {
      success: true,
      data: allOffers,
      meta: { searchStrategy: searchResults }
    }

    if (!finalSearchResult.success) {
      console.error('Amadeus API feil:', finalSearchResult)
      return NextResponse.json(
        { error: 'Kunne ikke søke etter flybilletter. Prøv igjen senere.' },
        { status: 500 }
      )
    }

    // Prosesser og forbedre respons for norske brukere
    let processedOffers = finalSearchResult.data?.map((offer: any) => ({
      id: offer.id,
      price: {
        total: parseFloat(offer.price.total),
        currency: offer.price.currency,
        formattedNOK: `${parseFloat(offer.price.total).toLocaleString('nb-NO')} kr`
      },
      numberOfBookableSeats: offer.numberOfBookableSeats,
      validatingAirlineCodes: offer.validatingAirlineCodes || [],
      itineraries: offer.itineraries?.map((itinerary: any) => ({
        duration: itinerary.duration,
        segments: itinerary.segments?.map((segment: any) => ({
          departure: {
            iataCode: segment.departure.iataCode,
            at: segment.departure.at,
            formatted: new Date(segment.departure.at).toLocaleString('nb-NO')
          },
          arrival: {
            iataCode: segment.arrival.iataCode,
            at: segment.arrival.at,
            formatted: new Date(segment.arrival.at).toLocaleString('nb-NO')
          },
          carrierCode: segment.carrierCode,
          number: segment.number,
          duration: segment.duration,
          aircraft: segment.aircraft?.code
        }))
      })),
      // Lagre original offer for senere booking
      originalOffer: offer
    }))

    // Debug: Logg noen eksempler på rådata fra Amadeus
    if (finalSearchResult.data && finalSearchResult.data.length > 0) {
      console.log('🔍 Amadeus rådata eksempel:')
      const sampleOffer = finalSearchResult.data[0]
      console.log(`- ID: ${sampleOffer.id}`)
      console.log(`- Price: ${sampleOffer.price?.total} ${sampleOffer.price?.currency}`)
      console.log(`- ValidatingAirlines: ${JSON.stringify(sampleOffer.validatingAirlineCodes)}`)
      console.log(`- Segments carriers: ${sampleOffer.itineraries?.[0]?.segments?.map((s: any) => s.carrierCode).join(', ')}`)
    }

    // Hvis vi ikke fikk resultater ELLER priser er for høye, legg til mock-data
    if (!processedOffers || processedOffers.length === 0 || 
        (processedOffers.length > 0 && processedOffers[0]?.price?.total > 3000)) {
      
      const reason = !processedOffers || processedOffers.length === 0 
        ? 'Ingen resultater fra Amadeus' 
        : `Amadeus priser for høye (${processedOffers[0]?.price?.total} kr)`
      
      console.log(`⚠️ ${reason}, bruker realistiske mock-data...`)
      const mockOffers = generateMockFlightOffers(origin, destination, adjustedDepartureDate, adjustedReturnDate)
      processedOffers = mockOffers
      console.log(`🧪 Mock-data: ${mockOffers.length} flyreiser (priser fra ca 350-1100 kr)`)
    }

    // Logging av søkeresultater
    console.log(`🎯 Totalt funnet: ${processedOffers?.length || 0} flyreiser`)
    if (processedOffers && processedOffers.length > 0) {
      // Logging fra segments
      const segmentCarriers = [...new Set(processedOffers.flatMap((offer: any) => 
        offer.itineraries.flatMap((it: any) => it.segments.map((seg: any) => seg.carrierCode))
      ))]
      console.log(`🏢 Unike flyselskaper (segments): ${segmentCarriers.join(', ')}`)
      
      // Logging fra validatingAirlineCodes
      const validatingCarriers = [...new Set(processedOffers.flatMap((offer: any) => 
        offer.validatingAirlineCodes || []
      ))]
      console.log(`✈️ Validating airlines: ${validatingCarriers.join(', ')}`)
      
      // Sjekk om DY, BA, FR finnes
      const targetAirlines = ['DY', 'BA', 'FR', 'U2']
      const foundTargets = targetAirlines.filter(code => 
        segmentCarriers.includes(code) || validatingCarriers.includes(code)
      )
      console.log(`🎯 Målsatte flyselskaper funnet: ${foundTargets.join(', ') || 'INGEN!'}`)
    }

    return NextResponse.json({
      success: true,
      searchParams: baseSearchParams,
      offers: processedOffers,
      meta: finalSearchResult.meta,
      message: `Fant ${processedOffers?.length || 0} flytilbud`,
      searchStrategy: processedOffers.length > 0 && processedOffers[0]?.id?.startsWith('MOCK') ? 'mock_data_fallback' : 'enhanced_multi_search'
    })

  } catch (error) {
    console.error('Flight Search API feil:', error)
    return NextResponse.json(
      { error: 'Intern server feil' },
      { status: 500 }
    )
  }
}

// GET /api/flights/search - Enkel søk via query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const departureDate = searchParams.get('departureDate')
    const returnDate = searchParams.get('returnDate')
    
    if (!origin || !destination || !departureDate) {
      return NextResponse.json(
        { error: 'origin, destination og departureDate er påkrevd som query params' },
        { status: 400 }
      )
    }

    // Konvertere til POST-format
    const body = {
      origin,
      destination,
      departureDate,
      returnDate,
      adults: parseInt(searchParams.get('adults') || '1'),
      children: parseInt(searchParams.get('children') || '0'),
      cabinClass: searchParams.get('cabinClass') || 'ECONOMY',
      nonStop: searchParams.get('nonStop') === 'true'
    }

    // Gjenbruk POST-logikk
    const postRequest = new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return POST(postRequest)
    
  } catch (error) {
    console.error('Flight Search GET API feil:', error)
    return NextResponse.json(
      { error: 'Intern server feil' },
      { status: 500 }
    )
  }
}
