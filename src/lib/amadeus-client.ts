import Amadeus, { FlightOffersSearchGetParams } from 'amadeus'

// Amadeus API Client for Flight Search and Booking
class AmadeusClient {
  private client: Amadeus

  constructor() {
    const clientId = process.env.FLIGHT_API_KEY
    const clientSecret = process.env.FLIGHT_API_SECRET
    
    // Debug logging (fjern i produksjon)
    console.log('🔧 Amadeus Client Init:', {
      clientId: clientId ? `${clientId.substring(0, 6)}...` : 'MISSING',
      clientSecret: clientSecret ? `${clientSecret.substring(0, 6)}...` : 'MISSING',
      env: process.env.NODE_ENV,
      nodeEnv: typeof process !== 'undefined' ? 'Server' : 'Client'
    })

    if (!clientId || !clientSecret) {
      const error = `❌ Amadeus API credentials missing:
      - FLIGHT_API_KEY: ${clientId ? 'SET' : 'MISSING'}
      - FLIGHT_API_SECRET: ${clientSecret ? 'SET' : 'MISSING'}
      
      Sjekk at begge er satt i .env.local filen.`
      
      console.error(error)
      throw new Error('Amadeus API credentials missing. Sjekk .env.local filen.')
    }

    try {
      this.client = new Amadeus({
        clientId,
        clientSecret,
        hostname: 'production' // Bytte til produksjon for realistiske priser
      })
      console.log('✅ Amadeus client successfully initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Amadeus client:', error)
      throw new Error('Kunne ikke initialisere Amadeus API client')
    }
  }

  // Søk etter flybilletter
  async searchFlights(params: FlightOffersSearchGetParams) {
    try {
      console.log('🔍 Amadeus Flight Search Parameters:', params)
      const response = await this.client.shopping.flightOffersSearch.get(params)
      console.log('✅ Amadeus Flight Search Success:', {
        count: response.data?.length || 0,
        meta: response.meta
      })
      return {
        success: true,
        data: response.data,
        meta: response.meta
      }
    } catch (error: any) {
      console.error('❌ Amadeus Flight Search Error:', {
        message: error.message,
        code: error.code,
        description: error.description,
        response: error.response?.body || error.response,
        status: error.response?.statusCode
      })
      return {
        success: false,
        error: error.description || error.message || 'Unknown error',
        code: error.code,
        details: error.response?.body
      }
    }
  }

  // Søk flyplasser basert på nøkkelord
  async searchAirports(keyword: string) {
    try {
      const response = await this.client.referenceData.locations.get({
        keyword,
        subType: 'AIRPORT'
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Amadeus Airport Search Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Bekreft tilgjengelighet og pris for spesifikke tilbud
  async confirmFlightOffer(flightOffer: any) {
    try {
      const response = await this.client.shopping.flightOffers.pricing.post({
        data: {
          type: 'flight-offers-pricing',
          flightOffers: [flightOffer]
        }
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Amadeus Flight Pricing Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Book flight (requires passenger details) - Amadeus Flight Create Orders API
  async bookFlight(flightOffer: any, travelers: any[], contacts?: any[], remarks?: any[]) {
    try {
      console.log('🎫 Amadeus Flight Order Creation starting...')
      console.log('Flight Offer ID:', flightOffer.id)
      console.log('Number of travelers:', travelers.length)

      const orderData = {
        type: 'flight-order',
        flightOffers: [flightOffer],
        travelers: travelers,
        ...(contacts && { contacts }),
        ...(remarks && { remarks })
      }

      const response = await this.client.booking.flightOrders.post({
        data: orderData
      })

      console.log('✅ Amadeus Flight Order Success:', {
        orderId: response.data?.id,
        status: response.data?.status || 'created'
      })

      return {
        success: true,
        data: response.data,
        meta: response.meta
      }
    } catch (error: any) {
      console.error('❌ Amadeus Flight Booking Error:', {
        message: error.message,
        code: error.code,
        description: error.description,
        response: error.response?.body || error.response
      })
      return {
        success: false,
        error: error.description || error.message || 'Flight booking failed',
        code: error.code,
        details: error.response?.body
      }
    }
  }

  // Hent flystatus
  async getFlightStatus(carrierCode: string, flightNumber: string, scheduledDepartureDate: string) {
    try {
      const response = await this.client.schedule.flights.get({
        carrierCode,
        flightNumber,
        scheduledDepartureDate
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Amadeus Flight Status Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // 🏨 HOTELL SEARCH - Ny funksjonalitet
  async searchHotels(params: {
    cityCode: string
    checkInDate: string
    checkOutDate: string
    adults?: number
    children?: number
    rooms?: number
    currency?: string
  }) {
    try {
      console.log('🏨 Amadeus Hotel Search Parameters:', params)
      
      const response = await this.client.shopping.hotelOffers.get({
        cityCode: params.cityCode,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        adults: params.adults || 1,
        children: params.children || 0,
        roomQuantity: params.rooms || 1,
        currency: params.currency || 'NOK'
      })

      console.log('✅ Amadeus Hotel Search Success:', {
        count: response.data?.length || 0,
        meta: response.meta
      })

      return {
        success: true,
        data: response.data,
        meta: response.meta
      }
    } catch (error: any) {
      console.error('❌ Amadeus Hotel Search Error:', {
        message: error.message,
        code: error.code,
        description: error.description
      })
      return {
        success: false,
        error: error.description || error.message || 'Unknown error',
        code: error.code
      }
    }
  }

  // 🚗 CAR RENTAL SEARCH - Ny funksjonalitet  
  async searchCarRentals(params: {
    pickUpLocationCode: string
    dropOffLocationCode?: string
    pickUpDate: string
    dropOffDate: string
    currency?: string
  }) {
    try {
      console.log('🚗 Amadeus Car Rental Search Parameters:', params)
      
      const response = await this.client.shopping.carOffers.get({
        pickUpLocationCode: params.pickUpLocationCode,
        dropOffLocationCode: params.dropOffLocationCode || params.pickUpLocationCode,
        pickUpDate: params.pickUpDate,
        dropOffDate: params.dropOffDate,
        currency: params.currency || 'NOK'
      })

      console.log('✅ Amadeus Car Rental Search Success:', {
        count: response.data?.length || 0
      })

      return {
        success: true,
        data: response.data,
        meta: response.meta
      }
    } catch (error: any) {
      console.error('❌ Amadeus Car Rental Search Error:', {
        message: error.message,
        code: error.code,
        description: error.description
      })
      return {
        success: false,
        error: error.description || error.message || 'Unknown error',
        code: error.code
      }
    }
  }

  // 🎯 DESTINATION INSPIRATION - Ny funksjonalitet
  async getDestinationInspiration(origin: string) {
    try {
      console.log('🎯 Amadeus Destination Inspiration:', { origin })
      
      const response = await this.client.shopping.flightDestinations.get({
        origin
      })

      return {
        success: true,
        data: response.data,
        meta: response.meta
      }
    } catch (error: any) {
      console.error('❌ Amadeus Destination Inspiration Error:', error)
      return {
        success: false,
        error: error.description || error.message || 'Unknown error'
      }
    }
  }

  // 📊 FLIGHT PRICE ANALYSIS - AI-powered
  async getFlightPriceAnalysis(params: {
    originIataCode: string
    destinationIataCode: string
    departureDate: string
    currencyCode?: string
  }) {
    try {
      const response = await this.client.analytics.itineraryPriceMetrics.get({
        originIataCode: params.originIataCode,
        destinationIataCode: params.destinationIataCode,
        departureDate: params.departureDate,
        currencyCode: params.currencyCode || 'NOK'
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      console.error('❌ Amadeus Price Analysis Error:', error)
      return {
        success: false,
        error: error.description || error.message || 'Unknown error'
      }
    }
  }
}

// Lazy-loaded singleton instance
let amadeusClientInstance: AmadeusClient | null = null

export const amadeusClient = {
  get instance(): AmadeusClient {
    if (!amadeusClientInstance) {
      amadeusClientInstance = new AmadeusClient()
    }
    return amadeusClientInstance
  },
  
  // Delegate methods for easier usage
  async searchFlights(params: FlightOffersSearchGetParams) {
    return this.instance.searchFlights(params)
  },
  
  async searchAirports(keyword: string) {
    return this.instance.searchAirports(keyword)
  },
  
  async confirmFlightOffer(flightOffer: any) {
    return this.instance.confirmFlightOffer(flightOffer)
  },
  
  async getFlightStatus(carrierCode: string, flightNumber: string, scheduledDepartureDate: string) {
    return this.instance.getFlightStatus(carrierCode, flightNumber, scheduledDepartureDate)
  },
  
  // Nye metoder for hotell, bil og destinasjoner
  async searchHotels(params: any) {
    return this.instance.searchHotels(params)
  },
  
  async searchCarRentals(params: any) {
    return this.instance.searchCarRentals(params)
  },
  
  async getDestinationInspiration(origin: string) {
    return this.instance.getDestinationInspiration(origin)
  },
  
  async getFlightPriceAnalysis(params: any) {
    return this.instance.getFlightPriceAnalysis(params)
  },

  async bookFlight(flightOffer: any, travelers: any[], contacts?: any[], remarks?: any[]) {
    return this.instance.bookFlight(flightOffer, travelers, contacts, remarks)
  }
}

// Helper types for Norwegian airports
export const NORWEGIAN_AIRPORTS = {
  OSL: { code: 'OSL', name: 'Oslo Gardermoen', city: 'Oslo' },
  BGO: { code: 'BGO', name: 'Bergen Flesland', city: 'Bergen' },
  TRD: { code: 'TRD', name: 'Trondheim Værnes', city: 'Trondheim' },
  SVG: { code: 'SVG', name: 'Stavanger Sola', city: 'Stavanger' },
  TOS: { code: 'TOS', name: 'Tromsø', city: 'Tromsø' },
  BOO: { code: 'BOO', name: 'Bodø', city: 'Bodø' },
  KRS: { code: 'KRS', name: 'Kristiansand Kjevik', city: 'Kristiansand' },
  AES: { code: 'AES', name: 'Ålesund Vigra', city: 'Ålesund' }
} as const

// Popular international destinations from Norway
export const POPULAR_DESTINATIONS = {
  CPH: { code: 'CPH', name: 'Copenhagen', city: 'København', country: 'Danmark' },
  ARN: { code: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'Sverige' },
  LHR: { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'Storbritannia' },
  CDG: { code: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'Frankrike' },
  AMS: { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Nederland' },
  FRA: { code: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Tyskland' },
  MAD: { code: 'MAD', name: 'Madrid Barajas', city: 'Madrid', country: 'Spania' },
  FCO: { code: 'FCO', name: 'Rome Fiumicino', city: 'Roma', country: 'Italia' }
} as const

export type AirportCode = keyof typeof NORWEGIAN_AIRPORTS | keyof typeof POPULAR_DESTINATIONS
