import { NextRequest, NextResponse } from 'next/server'
import { amadeusClient } from '@/lib/amadeus-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { origin, destination, startDate, endDate, adults = 1, children = 0 } = body

    if (!origin || !destination || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Mangler påkrevde felter: origin, destination, startDate, endDate' },
        { status: 400 }
      )
    }

    console.log('🗓️ Henter priskalender data...', { origin, destination, startDate, endDate })

    // Bruk Amadeus Flight Price Analysis API for å få priser over tid
    const priceData = await amadeusClient.instance.getFlightPriceAnalysis({
      originIataCode: origin,
      destinationIataCode: destination,
      departureDate: startDate,
      currencyCode: 'NOK'
    })

    if (priceData.success && priceData.data) {
      // Konverter Amadeus-data til vårt kalenderformat
      const priceCalendar = processPriceData(priceData.data, startDate, endDate)
      
      return NextResponse.json({
        success: true,
        priceCalendar,
        currency: 'NOK'
      })
    } else {
      // Fallback: Generer dummy data for kalender (for testing/demo)
      const priceCalendar = generateDummyPriceData(startDate, endDate)
      
      return NextResponse.json({
        success: true,
        priceCalendar,
        currency: 'NOK',
        fallback: true
      })
    }

  } catch (error) {
    console.error('Feil ved henting av priskalender:', error)
    
    // Generer dummy data som fallback
    const { startDate, endDate } = await request.json()
    const priceCalendar = generateDummyPriceData(startDate, endDate)
    
    return NextResponse.json({
      success: true,
      priceCalendar,
      currency: 'NOK',
      fallback: true,
      error: 'Bruker demo-data'
    })
  }
}

function processPriceData(amadeusData: any, startDate: string, endDate: string) {
  // Konverter Amadeus price analysis til vårt format
  const calendar: { [date: string]: { price: number; priceLevel: 'low' | 'medium' | 'high' } } = {}
  
  // Prosesser Amadeus data hvis tilgjengelig
  if (amadeusData.data && Array.isArray(amadeusData.data)) {
    amadeusData.data.forEach((item: any) => {
      if (item.departureDate && item.price) {
        const price = parseFloat(item.price.total || item.price)
        calendar[item.departureDate] = {
          price,
          priceLevel: categorizePriceLevel(price)
        }
      }
    })
  }

  return calendar
}

function generateDummyPriceData(startDate: string, endDate: string) {
  const calendar: { [date: string]: { price: number; priceLevel: 'low' | 'medium' | 'high' } } = {}
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  console.log('📅 Genererer dummy prisdata for periode:', { startDate, endDate })
  
  // Generer priser for hver dag i perioden (begrenset til 60 dager)
  let dayCount = 0
  for (let date = new Date(start); date <= end && dayCount < 60; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0]
    
    // Simuler realistiske flypriser med variasjon
    const basePrice = 1200 // Base pris NOK
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isMonday = dayOfWeek === 1
    const isFriday = dayOfWeek === 5
    
    let priceMultiplier = 1
    
    // Helger er dyrere
    if (isWeekend) priceMultiplier += 0.4
    // Mandager og fredager er populære
    if (isMonday || isFriday) priceMultiplier += 0.3
    // Tilfeldig variasjon for mer realistiske priser
    priceMultiplier += (Math.random() - 0.5) * 0.6
    
    const price = Math.round(basePrice * priceMultiplier)
    const priceLevel = categorizePriceLevel(price)
    
    calendar[dateStr] = {
      price,
      priceLevel
    }
    
    dayCount++
  }
  
  console.log('✅ Dummy prisdata generert:', {
    daysGenerated: Object.keys(calendar).length,
    samplePrices: Object.entries(calendar).slice(0, 5),
    lowPrices: Object.values(calendar).filter(p => p.priceLevel === 'low').length,
    mediumPrices: Object.values(calendar).filter(p => p.priceLevel === 'medium').length,
    highPrices: Object.values(calendar).filter(p => p.priceLevel === 'high').length
  })
  
  return calendar
}

function categorizePriceLevel(price: number): 'low' | 'medium' | 'high' {
  // Kategoriser priser basert på realistiske terskler  
  if (price < 1100) return 'low'      // Grønn - under 1100 kr
  if (price < 1400) return 'medium'   // Gul - 1100-1400 kr
  return 'high'                       // Rød - over 1400 kr
}
