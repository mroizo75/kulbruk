import { NextRequest, NextResponse } from 'next/server'

// GET - Hent bildata fra Vegvesen API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const regNumber = searchParams.get('regNumber')
    
    if (!regNumber) {
      return NextResponse.json(
        { error: 'Registreringsnummer påkrevd' },
        { status: 400 }
      )
    }
    
    // Vegvesen API for kjøretøyopplysninger (enkeltoppslag)
    const vegvesenApiKey = process.env.VEGVESEN_API_KEY
    
    if (!vegvesenApiKey) {
      return NextResponse.json(
        { error: 'Vegvesen API nøkkel mangler i miljøvariabler' },
        { status: 500 }
      )
    }
    
    // Korrekt URL for Vegvesen enkeltoppslag API (fra offisiell dokumentasjon)
    const vegvesenUrl = `https://www.vegvesen.no/ws/no/vegvesen/kjoretoy/felles/datautlevering/enkeltoppslag/kjoretoydata?kjennemerke=${regNumber.toUpperCase()}`
    
    console.log('Kaller Vegvesen API:', vegvesenUrl)
    
    const response = await fetch(vegvesenUrl, {
      method: 'GET',
      headers: {
        'SVV-Authorization': `Apikey ${vegvesenApiKey}`, // Riktig header format fra offisiell kode
        'Accept': 'application/json'
      }
    })
    
    console.log('Vegvesen API respons status:', response.status)
    
    // Håndter 204 No Content (gyldig request, men ingen data funnet)
    if (response.status === 204) {
      return NextResponse.json(
        { 
          error: 'Ingen kjøretøy funnet med dette registreringsnummeret',
          details: 'Registreringsnummeret eksisterer ikke i Vegvesenets database',
          suggestion: 'Prøv med et gyldig norsk registreringsnummer (f.eks. NF12345 eller AB12345)'
        },
        { status: 404 }
      )
    }
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Vegvesen API feil respons:', errorText)
      
      if (response.status === 404 || response.status === 400) {
        return NextResponse.json(
          { error: 'Bil ikke funnet med dette registreringsnummeret' },
          { status: 404 }
        )
      }
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Ugyldig API-nøkkel for Vegvesen' },
          { status: 401 }
        )
      }
      
      throw new Error(`Vegvesen API feil: ${response.status} - ${errorText}`)
    }
    
    const apiResponse = await response.json()
    console.log('Vegvesen API rådata:', JSON.stringify(apiResponse, null, 2))
    
    // Vegvesen API returnerer data i kjoretoydataListe array (basert på offisiell kode)
    const carData = apiResponse.kjoretoydataListe?.[0]
    
    if (!carData) {
      return NextResponse.json(
        { error: 'Ingen kjøretøydata funnet for dette registreringsnummeret' },
        { status: 404 }
      )
    }
    
    // Mapper Vegvesen data til vårt format (basert på komplette API struktur)
    const tekniskeData = carData.godkjenning?.tekniskGodkjenning?.tekniskeData
    const registrering = carData.registrering
    const forstegangsRegistrering = carData.forstegangsregistrering
    
    // Henter riktig årstall fra førstegangsregistrering
    const registrationYear = forstegangsRegistrering?.registrertForstegangNorgeDato 
      ? new Date(forstegangsRegistrering.registrertForstegangNorgeDato).getFullYear() 
      : null
    
    // Henter miljødata for CO2 og forbruk
    const miljoGruppe = tekniskeData?.miljodata?.miljoOgdrivstoffGruppe?.[0]
    const forbrukData = miljoGruppe?.forbrukOgUtslipp?.[0]
    
    const mappedData = {
      // Grunnleggende informasjon
      registrationNumber: regNumber,
      make: tekniskeData?.generelt?.merke?.[0]?.merke || 'Ukjent merke',
      model: tekniskeData?.generelt?.handelsbetegnelse?.[0] || 'Ukjent modell',
      year: registrationYear,
      
      // Motor og drivverk (med riktige stier)
      fuelType: miljoGruppe?.drivstoffKodeMiljodata?.kodeNavn || 'Ukjent drivstoff',
      transmission: tekniskeData?.motorOgDrivverk?.girkassetype?.kodeNavn || 'Ukjent girkasse',
      engineSize: tekniskeData?.motorOgDrivverk?.motor?.[0]?.slagvolum || null,
      cylinderCount: tekniskeData?.motorOgDrivverk?.motor?.[0]?.antallSylindre || null,
      maxPower: tekniskeData?.motorOgDrivverk?.motor?.[0]?.drivstoff?.[0]?.maksNettoEffekt || null,
      maxSpeed: tekniskeData?.motorOgDrivverk?.maksimumHastighet?.[0] || null,
      
      // Identifikasjon
      vin: carData.kjoretoyId?.understellsnummer || null,
      
      // Utseende
      color: tekniskeData?.karosseriOgLasteplan?.rFarge?.[0]?.kodeNavn || 'Ukjent farge',
      bodyType: tekniskeData?.karosseriOgLasteplan?.karosseritype?.kodeNavn || null,
      
      // Dimensjoner
      length: tekniskeData?.dimensjoner?.lengde || null,
      width: tekniskeData?.dimensjoner?.bredde || null,
      height: tekniskeData?.dimensjoner?.hoyde || null,
      
      // Personer og seter
      seats: tekniskeData?.persontall?.sitteplasserTotalt || null,
      frontSeats: tekniskeData?.persontall?.sitteplasserForan || null,
      
      // Vekter
      weight: tekniskeData?.vekter?.egenvekt || null,
      maxWeight: tekniskeData?.vekter?.tekniskTillattTotalvekt || null,
      payload: tekniskeData?.vekter?.nyttelast || null,
      roofLoad: tekniskeData?.vekter?.tillattTaklast || null,
      trailerWeightBraked: tekniskeData?.vekter?.tillattTilhengervektMedBrems || null,
      trailerWeightUnbraked: tekniskeData?.vekter?.tillattTilhengervektUtenBrems || null,
      
      // Miljødata (med riktige stier)
      euroClass: tekniskeData?.miljodata?.euroKlasse?.kodeNavn || null,
      co2Emissions: forbrukData?.co2BlandetKjoring || null,
      fuelConsumption: {
        combined: forbrukData?.forbrukBlandetKjoring || null,
        city: forbrukData?.forbrukBykjoring || null,
        highway: forbrukData?.forbrukLandeveiskjoring || null
      },
      
      // Dekk og felg
      tires: tekniskeData?.dekkOgFelg?.akselDekkOgFelgKombinasjon?.[0]?.akselDekkOgFelg?.map(dekk => ({
        dimension: dekk.dekkdimensjon,
        speedRating: dekk.hastighetskodeDekk,
        loadRating: dekk.belastningskodeDekk,
        rimSize: dekk.felgdimensjon
      })) || [],
      
      // Sikkerhet
      abs: tekniskeData?.bremser?.abs || false,
      airbags: tekniskeData?.persontall?.sitteplassListe?.sitteplass?.some(seat => 
        seat.frontairbag || seat.sideairbag || seat.hodegardinairbag
      ) || false,
      
      // Registrering og status
      firstRegistrationDate: forstegangsRegistrering?.registrertForstegangNorgeDato || null,
      registrationStatus: registrering?.registreringsstatus?.kodeBeskrivelse || 'Ukjent',
      deregisteredDate: registrering?.avregistrertSidenDato || null,
      
      // EU-kontroll
      lastInspection: carData.periodiskKjoretoyKontroll?.kontrollfrist || null,
      lastApprovedInspection: carData.periodiskKjoretoyKontroll?.sistGodkjent || null,
      
      // Klassifisering
      vehicleGroup: carData.godkjenning?.tekniskGodkjenning?.kjoretoyklassifisering?.beskrivelse || 'Ukjent',
      technicalCode: carData.godkjenning?.tekniskGodkjenning?.kjoretoyklassifisering?.tekniskKode?.kodeNavn || null,
      
      // Merknader
      remarks: carData.godkjenning?.kjoretoymerknad?.map(merknad => merknad.merknad) || [],
      
      // Debug data (fjernes i produksjon)
      rawData: carData
    }
    
    console.log('Vegvesen API respons:', mappedData)
    
    return NextResponse.json({
      success: true,
      carData: mappedData,
      message: 'Bildata hentet fra Vegvesen'
    })
    
  } catch (error) {
    console.error('Vegvesen API feil:', error)
    
    return NextResponse.json(
      { 
        error: 'Kunne ikke hente bildata fra Vegvesen',
        details: error instanceof Error ? error.message : 'Ukjent feil',
        suggestion: 'Sjekk at VEGVESEN_API_KEY er satt riktig i .env.local og at API-nøkkelen er gyldig. Format: SVV-Authorization: Apikey {din_nokkel}'
      },
      { status: 500 }
    )
  }
}

// POST - Estimer bilpris basert på Vegvesen data + brukerinput
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { registrationNumber, mileage, condition } = body
    
    if (!registrationNumber || !mileage || !condition) {
      return NextResponse.json(
        { error: 'Registreringsnummer, kilometerstand og tilstand påkrevd' },
        { status: 400 }
      )
    }
    
    // 1. Hent bildata fra Vegvesen
    const carDataResponse = await fetch(`${request.url}?regNumber=${registrationNumber}`)
    
    if (!carDataResponse.ok) {
      const error = await carDataResponse.json()
      return NextResponse.json(error, { status: carDataResponse.status })
    }
    
    const { carData } = await carDataResponse.json()
    
    // 2. Beregn grunnleggende prisestimering
    const priceEstimation = calculateBasicPriceEstimate(carData, mileage, condition)
    
    return NextResponse.json({
      success: true,
      carData,
      priceEstimation,
      message: 'Prisestimering beregnet'
    })
    
  } catch (error) {
    console.error('Prisestimering feil:', error)
    
    return NextResponse.json(
      { 
        error: 'Kunne ikke beregne prisestimering',
        details: error instanceof Error ? error.message : 'Ukjent feil'
      },
      { status: 500 }
    )
  }
}

// Grunnleggende prissetting-algoritme
function calculateBasicPriceEstimate(carData: any, mileage: number, condition: string) {
  const currentYear = new Date().getFullYear()
  const carAge = currentYear - (carData.year || currentYear)
  
  // Basisverdier per merke (kan flyttes til database senere)
  const basePrices: Record<string, number> = {
    'TESLA': 400000,
    'BMW': 350000,
    'AUDI': 320000,
    'MERCEDES': 340000,
    'VOLKSWAGEN': 250000,
    'TOYOTA': 200000,
    'VOLVO': 280000,
    'FORD': 180000,
    'NISSAN': 160000,
    'HYUNDAI': 170000,
    // Default
    'DEFAULT': 200000
  }
  
  // Hent basisverdi
  const basePrice = basePrices[carData.make.toUpperCase()] || basePrices.DEFAULT
  
  // Alders-reduksjon (10% per år)
  const ageDeduction = basePrice * (carAge * 0.10)
  
  // Kilometerstands-reduksjon (1 kr per km over 100,000)
  const excessMileage = Math.max(0, mileage - 100000)
  const mileageDeduction = excessMileage * 1
  
  // Tilstands-multiplier
  const conditionMultipliers: Record<string, number> = {
    'A': 1.0,    // Meget god
    'B': 0.85,   // God
    'C': 0.70,   // Middels
    'D': 0.55    // Dårlig
  }
  const conditionMultiplier = conditionMultipliers[condition.toUpperCase()] || 0.70
  
  // Beregn estimat
  const adjustedPrice = Math.max(
    (basePrice - ageDeduction - mileageDeduction) * conditionMultiplier,
    10000 // Minimum 10,000 kr
  )
  
  const margin = adjustedPrice * 0.20 // ±20% usikkerhet
  
  return {
    estimatedPrice: Math.round(adjustedPrice),
    priceRange: {
      min: Math.round(adjustedPrice - margin),
      max: Math.round(adjustedPrice + margin)
    },
    confidence: 'MEDIUM',
    method: 'BASIC_ALGORITHM',
    factors: {
      basePrice,
      ageDeduction,
      mileageDeduction,
      conditionMultiplier,
      carAge,
      excessMileage
    },
    disclaimer: 'Dette er et grovt estimat. Faktisk verdi kan variere betydelig basert på markedsforhold, bilens historie og andre faktorer.'
  }
}