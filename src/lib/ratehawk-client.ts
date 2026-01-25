import * as Sentry from '@sentry/nextjs'
import { RateHawkHotelSearchParams, RateHawkHotelSearchResponse } from '@/lib/types'

const { logger } = Sentry

// RateHawk Hotel API Client
class RateHawkClient {
  private apiKey: string
  private accessToken: string
  private baseUrl: string
  private hotelDumpCache: Map<string, any> = new Map() // Cache hotel dump data
  private dumpLastFetched: number | null = null

  constructor() {
    this.apiKey = process.env.RATEHAWK_KEY_ID || ''
    this.accessToken = process.env.RATEHAWK_API_KEY || ''
    this.baseUrl = process.env.RATEHAWK_BASE_URL || 'https://api.worldota.net/api/b2b/v3'

    if (!this.apiKey || !this.accessToken) {
      console.warn('⚠️ RateHawk credentials missing - hotel search will use mock data')
    }
  }

  // Test region dump direkte
  async testRegionDump() {
    try {
      console.log('🧪 Testing region dump API...')
      const data = await this.makeRequest('/hotel/region/dump/', {
        language: 'no'
      }, 'GET')
      console.log('🧪 Region dump raw response:', data)
      console.log('🧪 Region dump type:', typeof data, Array.isArray(data) ? 'array' : 'not array')

      if (Array.isArray(data)) {
        console.log('🧪 Region dump result:', data.length, 'regions')
        console.log('🧪 First few regions:', data.slice(0, 3))
      } else if (data && typeof data === 'object') {
        // Sjekk forskjellige mulige strukturer
        if (data.regions && Array.isArray(data.regions)) {
          console.log('🧪 Found regions in data.regions:', data.regions.length)
          console.log('🧪 First few regions:', data.regions.slice(0, 3))
        } else if (data.data && Array.isArray(data.data)) {
          console.log('🧪 Found regions in data.data:', data.data.length)
          console.log('🧪 First few regions:', data.data.slice(0, 3))
        } else {
          console.log('🧪 Region dump object keys:', Object.keys(data))
        }
      }

      return data
    } catch (error) {
      console.error('🧪 Region dump test failed:', error)
      throw error
    }
  }

  // Hent tilgjengelige endpoints for denne API nøkkelen (kan være begrenset tilgjengelighet)
  async getAvailableEndpoints() {
    try {
      console.log('🏨 Getting available RateHawk endpoints...')
      const data = await this.makeRequest('/overview/', {}, 'GET')
      console.log('🏨 Available endpoints:', JSON.stringify(data, null, 2))
      return data
    } catch (error) {
      console.error('❌ Failed to get available endpoints (may not be available for this API key):', error)
      return null
    }
  }

  // Helper method for making authenticated API calls
  private async makeRequest(endpoint: string, params: Record<string, any> = {}, method: 'GET' | 'POST' = 'GET') {
    return Sentry.startSpan(
      {
        op: 'http.client',
        name: `RateHawk ${method} ${endpoint}`,
      },
      async (span) => {
        try {
          span.setAttribute('http.method', method)
          span.setAttribute('http.url', endpoint)

          const url = new URL(`${this.baseUrl}${endpoint}`)

          let body: string | undefined
          let headers: Record<string, string> = {
            'Authorization': `Basic ${Buffer.from(`${this.apiKey}:${this.accessToken}`).toString('base64')}`,
          }

          if (method === 'GET') {
            // For GET requests, add params as query parameters
            Object.keys(params).forEach(key => {
              if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key])
              }
            })
          } else {
            // For POST requests, send params as JSON body
            headers['Content-Type'] = 'application/json'
            body = JSON.stringify(params)
          }

          logger.debug(logger.fmt`Making ${method} request to RateHawk: ${endpoint}`)

          const response = await fetch(url.toString(), {
            method,
            headers,
            body,
          })

          span.setAttribute('http.status_code', response.status)
          span.setAttribute('http.status_text', response.statusText)

          logger.debug(logger.fmt`RateHawk response: ${response.status} ${response.statusText}`)

          if (!response.ok) {
            const errorText = await response.text()
            logger.error('RateHawk API error', {
              endpoint,
              status: response.status,
              statusText: response.statusText,
              errorText: errorText.substring(0, 500) // Limit error text length
            })
            
            // Prøv å parse feilmeldingen fra RateHawk
            let errorMessage = `${response.status} ${response.statusText}`
            try {
              const errorData = JSON.parse(errorText)
              if (errorData.debug?.validation_error) {
                errorMessage = errorData.debug.validation_error
              } else if (errorData.error) {
                errorMessage = errorData.error
              }
            } catch {
              // Bruk generisk feilmelding hvis parsing feiler
            }
            
            const error = new Error(`RateHawk API error: ${errorMessage}`)
            ;(error as any).statusCode = response.status
            ;(error as any).responseData = errorText
            span.setAttribute('error', errorMessage)
            Sentry.captureException(error)
            throw error
          }

          const data = await response.json()
          logger.debug('RateHawk API response received', {
            endpoint,
            status: response.status
          })
          return data
        } catch (error) {
          logger.error('RateHawk API request failed', {
            endpoint,
            error: error instanceof Error ? error.message : String(error)
          })
          Sentry.captureException(error)
          throw error
        }
      }
    )
  }

  // Hent residency country code fra user eller fallback
  private getUserResidency(userCountry?: string | null): string {
    // Map country names/codes til ISO 3166-1 alpha-2
    const countryMap: Record<string, string> = {
      'norway': 'no',
      'norge': 'no',
      'no': 'no',
      'sweden': 'se',
      'sverige': 'se',
      'se': 'se',
      'denmark': 'dk',
      'danmark': 'dk',
      'dk': 'dk',
      'fi': 'fi',
      'united states': 'us',
      'usa': 'us',
      'us': 'us',
      'united kingdom': 'gb',
      'uk': 'gb',
      'gb': 'gb',
      'germany': 'de',
      'tyskland': 'de',
      'de': 'de',
      'france': 'fr',
      'frankrike': 'fr',
      'fr': 'fr',
    }
    
    if (userCountry) {
      const normalized = userCountry.toLowerCase().trim()
      return countryMap[normalized] || 'no' // Fallback til Norge
    }
    
    return 'no' // Default fallback
  }

  // Søk etter hoteller
  async searchHotels(params: RateHawkHotelSearchParams, userCountry?: string | null): Promise<RateHawkHotelSearchResponse> {
    try {
      console.log('🏨 RateHawk Hotel Search:', params)

      if (!this.apiKey || !this.accessToken) {
        throw new Error('RateHawk API credentials missing')
      }

      // Hent residency fra user country eller fallback
      const residency = this.getUserResidency(userCountry)
      console.log('🌍 Using residency:', residency, '(from user country:', userCountry || 'default', ')')

      // IKKE last dump ved hvert søk - bruk lazy loading eller /hotel/info/ i stedet

      // VIKTIG: RateHawk API søker etter hoteller i REGIONER, ikke direkte på hotel ID
      // Test hotel må søkes i en region, så vi bruker en stor region (f.eks. hele Norge eller Europa)
      // og filtrerer resultatene etter hotel ID senere hvis nødvendig

      // Først må vi få region_id fra destinasjonen
      const regionId = await this.getRegionId(params.destination)
      if (!regionId) {
        throw new Error('Could not find region for destination')
      }

      console.log('🏨 Found region ID:', regionId)

      // B2B API: Format for guests: array av objekter, ett per rom
      const guests = [{
        adults: params.adults,
        children: params.children && params.children.length > 0 ? params.children : []
      }]

      // Bruk riktig søke-metode basert på destinasjon med fallback-strategi
      let data
      let searchMethod = 'unknown'
      let lastError: any = null
      
      // Hvis region ID er et stort tall (> 10M), er det sannsynligvis et hotel ID
      const isHotelId = parseInt(regionId) > 10000000 || regionId === '8473727' || regionId === 'test_hotel_do_not_book'
      
      if (isHotelId) {
        console.log('🏨 Searching by hotel ID:', regionId)
        searchMethod = 'hotel_ids'
        const hotelParams = {
          hids: [parseInt(regionId)],
          checkin: params.checkIn,
          checkout: params.checkOut,
          residency: residency,
          language: 'en',
          guests: guests,
          currency: params.currency || 'NOK'
        }
        try {
          data = await this.makeRequest('/search/serp/hotels/', hotelParams, 'POST')
        } catch (error: any) {
          lastError = error
          console.warn('⚠️ Hotel ID search failed:', error.message)
          throw error // Hvis hotel søk feiler, kast error
        }
      } else {
        // FØRST: Prøv REGION søk
        console.log('🏨 Attempting region search for region ID:', regionId)
        searchMethod = 'region'
        const regionParams = {
          region_id: parseInt(regionId),
          checkin: params.checkIn,
          checkout: params.checkOut,
          residency: residency,
          language: 'en',
          guests: guests,
          currency: params.currency || 'NOK'
        }
        
        try {
          data = await this.makeRequest('/search/serp/region/', regionParams, 'POST')
        } catch (error: any) {
          lastError = error
          const errorMessage = error.message || ''
          
          // Hvis region ikke kan søkes, prøv GEO søk som fallback
          if (errorMessage.includes('invalid region_id') || errorMessage.includes('cannot be searched')) {
            console.warn('⚠️ Region search failed (region not searchable), trying geo search fallback')
            
            const coords = this.getCoordinatesForDestination(params.destination, regionId)
            console.log('🏨 Attempting geo search with coordinates:', coords)
            searchMethod = 'geo'
            
            const geoParams = {
              latitude: coords.lat,
              longitude: coords.lon,
              radius: 50, // 50 km radius
              checkin: params.checkIn,
              checkout: params.checkOut,
              residency: residency,
              language: 'en',
              guests: guests,
              currency: params.currency || 'NOK'
            }
            
            try {
              console.log('🌍 Making geo search request with params:', geoParams)
              data = await this.makeRequest('/search/serp/geo/', geoParams, 'POST')
              console.log('✅ Geo search successful!')
            } catch (geoError: any) {
              lastError = geoError
              const geoErrorMessage = geoError.message || ''
              console.error('❌ Geo search failed:', geoErrorMessage)
              
              // Sjekk om geo-søket faktisk returnerte noe (kan være tomt resultat, ikke feil)
              // Hvis status er OK men ingen hoteller, det er ikke en feil
              if (geoError.statusCode === 200 || !geoError.statusCode) {
                // Dette kan være en parsing-feil eller tomt resultat
                console.warn('⚠️ Geo search returned empty or invalid response, but not a hard error')
              }
              
              // Geo-søk feilet også - kast en informativ feilmelding
              // IKKE fallback til test hotel - brukeren vil se ALLE hoteller, ikke bare test hotellet
              throw new Error(
                `Kunne ikke søke etter hoteller i denne destinasjonen. ` +
                `Region-søk feilet: "${errorMessage}". ` +
                `Geo-søk feilet: "${geoErrorMessage}". ` +
                `Dette kan skyldes sandbox-begrensninger. Prøv å søke etter Oslo (region 2563) eller test hotel (ID: 8473727).`
              )
            }
          } else {
            // Hvis feilen ikke er "region cannot be searched", kast feilen videre
            throw error
          }
        }
      }
      
      // Hvis vi fortsatt ikke har data, kast feil
      if (!data) {
        throw lastError || new Error('No data returned from search')
      }
      
      console.log(`✅ Search successful using method: ${searchMethod}`)
      
      console.log('🏨 Raw hotel search response (truncated):', {
        status: data?.status,
        hotels_count: data?.data?.hotels?.length || 0,
        search_id: data?.data?.search_id,
        first_hotel_sample: JSON.stringify(data?.data?.hotels?.[0], null, 2)
      })

      // Parse RateHawk response - sjekk både data.hotels og data.data.hotels
      const hotels: any[] = []
      const hotelData = data?.data?.hotels || data?.hotels || []
      
      console.log('🏨 Total hotels received from API:', hotelData.length)
      
      // BEGRENS til 20 hoteller FØR parsing for å spare ressurser
      const limitedHotelData = hotelData.slice(0, 20)
      console.log('🏨 Processing first 20 hotels only')
      
      if (limitedHotelData && Array.isArray(limitedHotelData) && limitedHotelData.length > 0) {
        // Prosesser hoteller parallelt for bedre ytelse
        const hotelPromises = limitedHotelData.map(async (hotel: any) => {
          // Beregn antall netter
          const checkInDate = new Date(params.checkIn)
          const checkOutDate = new Date(params.checkOut)
          const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
          
          console.log('📅 Beregner pris for', nights, 'netter')
          
          // RateHawk returnerer hoteller med rates array
          // Finn billigste rate for å vise pris
          let totalPrice = 0
          let currency = 'NOK'
          
          if (hotel.rates && hotel.rates.length > 0) {
            // Finn den billigste raten
            const sortedRates = hotel.rates.sort((a: any, b: any) => {
              const aPrice = parseFloat(a.payment_options?.payment_types?.[0]?.amount || '999999')
              const bPrice = parseFloat(b.payment_options?.payment_types?.[0]?.amount || '999999')
              return aPrice - bPrice
            })
            
            const cheapestRate = sortedRates[0]
            totalPrice = parseFloat(cheapestRate.payment_options?.payment_types?.[0]?.amount || '0')
            currency = cheapestRate.payment_options?.payment_types?.[0]?.currency_code || 'NOK'
          }
          
          // Legg til bestillingsgebyr (7% markup for Kulbruk.no)
          const BOOKING_FEE_PERCENT = 7
          const totalPriceWithFee = totalPrice * (1 + BOOKING_FEE_PERCENT / 100)
          
          // Beregn pris per natt
          const pricePerNight = nights > 0 ? totalPriceWithFee / nights : totalPriceWithFee
          
          console.log('💰 Prisberegning:', {
            totalPrice,
            totalPriceWithFee: totalPriceWithFee.toFixed(2),
            nights,
            pricePerNight: pricePerNight.toFixed(2)
          })
          
          // Hent statisk info fra /hotel/info/ for bedre data (stjerner, adresse, amenities)
          const hotelId = hotel.id || hotel.hid
          let staticInfo: any = null
          
          if (hotelId) {
            try {
              staticInfo = await this.getHotelStaticInfo(hotelId.toString(), typeof hotelId === 'number' ? hotelId : undefined)
            } catch (error) {
              logger.warn('Could not fetch static info for hotel', {
                hotelId,
                error: error instanceof Error ? error.message : String(error)
              })
              // Fortsett med søkeresultat-data hvis static info feiler
            }
          }
          
          // Bruk statisk info hvis tilgjengelig, ellers fallback til søkeresultat
          const hotelName = staticInfo?.name || staticInfo?.hotel_name || hotel.name || hotel.hotel_name || 'Hotel ID: ' + hotelId
          
          // Adresse fra statisk info eller søkeresultat
          let hotelAddress = 'Address not available'
          if (staticInfo) {
            hotelAddress = [
              staticInfo.address,
              staticInfo.city?.name,
              staticInfo.region?.name,
              staticInfo.region?.country_name || staticInfo.country?.name
            ].filter(Boolean).join(', ') || staticInfo.address || 'Address not available'
          } else {
            hotelAddress = hotel.address || hotel.location?.address || 'Address not available'
          }
          
          // Bilde fra statisk info eller søkeresultat
          let hotelImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450"%3E%3Crect fill="%23ddd" width="800" height="450"/%3E%3Ctext fill="%23999" font-family="Arial" font-size="32" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EIngen bilde%3C/text%3E%3C/svg%3E'
          
          // 1. Fra statisk info (best kvalitet)
          if (staticInfo?.images && Array.isArray(staticInfo.images) && staticInfo.images.length > 0) {
            // RateHawk returnerer images som array av strings (URLs) eller objekter
            const firstImage = staticInfo.images[0]
            if (typeof firstImage === 'string') {
              // Direkte URL string - erstatt {size} placeholder med faktisk størrelse
              hotelImage = firstImage.replace('{size}', '1024x768')
            } else if (firstImage?.url) {
              // Objekt med url property
              hotelImage = firstImage.url.replace('{size}', '1024x768')
            }
          }
          
          // 2. Fra søkeresultat hotel object (fallback)
          if (hotelImage.startsWith('data:image')) {
            if (hotel.image) {
              hotelImage = typeof hotel.image === 'string' ? hotel.image : hotel.image.url || hotel.image
            } else if (hotel.images && Array.isArray(hotel.images) && hotel.images.length > 0) {
              const firstImage = hotel.images[0]
              hotelImage = typeof firstImage === 'string' ? firstImage : (firstImage.url || firstImage)
            }
          }
          
          console.log('🖼️ Hotel', hotelId, 'image:', hotelImage.substring(0, 100))
          
          // Stjerner fra statisk info eller søkeresultat
          const starRating = staticInfo?.star_rating || 
                            staticInfo?.stars || 
                            hotel.star_rating || 
                            hotel.stars || 
                            0
          
          // Amenities fra søkeresultat eller statisk info
          const allAmenities: string[] = []
          
          // 1. Fra statisk info amenity_groups FØRST (mest komplette data)
          if (staticInfo?.amenity_groups && Array.isArray(staticInfo.amenity_groups)) {
            staticInfo.amenity_groups.forEach((group: any) => {
              if (group.amenities && Array.isArray(group.amenities)) {
                group.amenities.forEach((amenity: any) => {
                  const amenityName = typeof amenity === 'string' ? amenity : (amenity.name || amenity.amenity_name)
                  if (amenityName && !allAmenities.includes(this.formatAmenityName(amenityName))) {
                    allAmenities.push(this.formatAmenityName(amenityName))
                  }
                })
              }
            })
          }
          
          // 2. Fra søkeresultat rates (rom-spesifikke amenities)
          if (hotel.rates && hotel.rates.length > 0) {
            const cheapestRate = hotel.rates[0]
            if (cheapestRate.amenities_data && Array.isArray(cheapestRate.amenities_data)) {
              cheapestRate.amenities_data.forEach((amenity: string) => {
                const formatted = this.formatAmenityName(amenity)
                if (!allAmenities.includes(formatted)) {
                  allAmenities.push(formatted)
                }
              })
            }
          }
          
          // 3. Fra hotell-nivå amenities
          if (hotel.amenities && Array.isArray(hotel.amenities)) {
            hotel.amenities.forEach((amenity: any) => {
              const amenityName = typeof amenity === 'string' ? amenity : (amenity.name || amenity.amenity_name)
              if (amenityName && !allAmenities.includes(this.formatAmenityName(amenityName))) {
                allAmenities.push(this.formatAmenityName(amenityName))
              }
            })
          }
          
          // 4. Fra statisk info flat amenities list (fallback)
          if (staticInfo?.amenities && Array.isArray(staticInfo.amenities)) {
            staticInfo.amenities.forEach((amenity: any) => {
              const amenityName = typeof amenity === 'string' ? amenity : (amenity.name || amenity.amenity_name)
              if (amenityName && !allAmenities.includes(this.formatAmenityName(amenityName))) {
                allAmenities.push(this.formatAmenityName(amenityName))
              }
            })
          }
          
          // 5. Legg til måltid som amenity hvis inkludert
          if (hotel.rates && hotel.rates.length > 0) {
            const cheapestRate = hotel.rates[0]
            if (cheapestRate.meal_data?.has_breakfast) {
              if (!allAmenities.some(a => a.toLowerCase().includes('breakfast') || a.toLowerCase().includes('frokost'))) {
                allAmenities.push('Frokost inkludert')
              }
            }
          }
          
          // Formater avstand - vis avstand fra sentrum hvis tilgjengelig
          let distanceText = 'Sentrum'
          if (hotel.distance) {
            // RateHawk returnerer avstand som string eller number i km
            const distanceValue = typeof hotel.distance === 'string' 
              ? parseFloat(hotel.distance) 
              : hotel.distance
            
            if (distanceValue > 0) {
              if (distanceValue < 1) {
                distanceText = `${Math.round(distanceValue * 1000)}m fra sentrum`
              } else {
                distanceText = `${distanceValue.toFixed(1)}km fra sentrum`
              }
            }
          } else if (staticInfo?.facts?.beach_distance) {
            // Vis avstand til strand hvis tilgjengelig
            const beachDist = staticInfo.facts.beach_distance
            distanceText = `${beachDist}m til strand`
          } else if (staticInfo?.location?.geo) {
            // Fallback til koordinater hvis ingen avstand
            distanceText = 'Se kart for plassering'
          }
          
          return {
            id: hotelId?.toString() || '',
            name: hotelName,
            address: hotelAddress,
            rating: starRating,
            price: {
              amount: Math.round(pricePerNight),
              currency: currency,
              perNight: true,
              totalPrice: Math.round(totalPriceWithFee),
              nights: nights
            },
            image: hotelImage,
            images: this.parseAllImages(staticInfo?.images), // Alle bilder for galleriet
            amenities: allAmenities,
            distance: distanceText
          }
        })
        
        // Vent på alle hoteller å bli prosessert
        const processedHotels = await Promise.all(hotelPromises)
        hotels.push(...processedHotels)
      }

      console.log('🏨 Parsed hotels sample:', hotels.slice(0, 2))

      return {
        success: true,
        hotels: hotels,
        searchId: data?.data?.search_id || data?.search_id || `search_${Date.now()}`,
        totalResults: hotelData.length
      } as RateHawkHotelSearchResponse

    } catch (error: any) {
      console.error('❌ RateHawk Hotel Search Error:', error)
      
      // Parse feilmelding for å gi bedre feedback
      const errorMessage = error.message || 'Unknown error'
      let userFriendlyError = 'Kunne ikke søke etter hoteller'
      
      if (errorMessage.includes('invalid region_id') || errorMessage.includes('cannot be searched')) {
        userFriendlyError = 'Denne destinasjonen kan ikke søkes i sandbox-miljøet. Prøv å søke etter Oslo eller test hotel (ID: 8473727).'
      } else if (errorMessage.includes('RateHawk API credentials missing')) {
        userFriendlyError = 'API-nøkler mangler. Kontakt support.'
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
        userFriendlyError = 'For mange forespørsler. Vennligst prøv igjen om et øyeblikk.'
      } else if (errorMessage.includes('timeout')) {
        userFriendlyError = 'Søket tok for lang tid. Vennligst prøv igjen.'
      }
      
      // Returner strukturert feil i stedet for å kaste
      return {
        success: false,
        error: userFriendlyError,
        technicalError: errorMessage,
        hotels: [],
        searchId: '',
        totalResults: 0
      } as RateHawkHotelSearchResponse
    }
  }

  // Hent koordinater for en destinasjon
  private getCoordinatesForDestination(destination: string, regionId: string): { lat: number, lon: number } {
    // Koordinater for kjente destinasjoner
    const knownCoordinates: Record<string, { lat: number, lon: number }> = {
      // Norge
      'OSL': { lat: 59.9139, lon: 10.7522 }, // Oslo
      '2563': { lat: 59.9139, lon: 10.7522 }, // Oslo region
      'BGO': { lat: 60.3913, lon: 5.3221 }, // Bergen
      'TRD': { lat: 63.4305, lon: 10.3951 }, // Trondheim
      'SVG': { lat: 58.9700, lon: 5.7331 }, // Stavanger
      'TOS': { lat: 69.6492, lon: 18.9553 }, // Tromsø
      
      // Norden
      'CPH': { lat: 55.6761, lon: 12.5683 }, // København
      '1953': { lat: 55.6761, lon: 12.5683 }, // København region
      'ARN': { lat: 59.3293, lon: 18.0686 }, // Stockholm
      'HEL': { lat: 60.1695, lon: 24.9354 }, // Helsinki
      
      // Europa
      'LON': { lat: 51.5074, lon: -0.1278 }, // London
      '1869': { lat: 51.5074, lon: -0.1278 }, // London region
      'PAR': { lat: 48.8566, lon: 2.3522 }, // Paris
      '1775': { lat: 48.8566, lon: 2.3522 }, // Paris region
      'BER': { lat: 52.5200, lon: 13.4050 }, // Berlin
      '1382': { lat: 52.5200, lon: 13.4050 }, // Berlin region
      'ROM': { lat: 41.9028, lon: 12.4964 }, // Roma
      '1991': { lat: 41.9028, lon: 12.4964 }, // Roma region
      'MAD': { lat: 40.4168, lon: -3.7038 }, // Madrid
      'BCN': { lat: 41.3874, lon: 2.1686 }, // Barcelona
      'AMS': { lat: 52.3676, lon: 4.9041 }, // Amsterdam
      '1783': { lat: 52.3676, lon: 4.9041 }, // Amsterdam region
      
      // USA
      'NYC': { lat: 40.7128, lon: -74.0060 }, // New York
      '2395': { lat: 40.7128, lon: -74.0060 }, // New York region
      'LAX': { lat: 34.0522, lon: -118.2437 }, // Los Angeles
      'SFO': { lat: 37.7749, lon: -122.4194 }, // San Francisco
      'MIA': { lat: 25.7617, lon: -80.1918 }, // Miami
      
      // Test hotel - bruk Oslo koordinater
      '8473727': { lat: 59.9139, lon: 10.7522 },
    }
    
    return knownCoordinates[destination] || knownCoordinates[regionId] || { lat: 40.7128, lon: -74.0060 } // Default NYC for testing
  }

  // Hent og cache hotel dump (statisk data)
  private async ensureHotelDump() {
    // Sjekk om vi allerede har cache i minnet
    if (this.hotelDumpCache.size > 0) {
      console.log('📦 Using in-memory hotel dump cache:', this.hotelDumpCache.size, 'hotels')
      return
    }

    try {
      const fs = await import('fs')
      const path = await import('path')
      // @ts-ignore - simple-zstd doesn't have types
      const zstd = await import('simple-zstd')
      
      // Dump lagres i /dump mappen
      const dumpDir = path.join(process.cwd(), 'dump')
      const compressedDumpPath = path.join(dumpDir, 'hotels.jsonl.zst')
      const decompressedDumpPath = path.join(dumpDir, 'hotels.jsonl')
      const metadataPath = path.join(dumpDir, 'metadata.json')
      
      // Sjekk om dump-mappen eksisterer
      if (!fs.existsSync(dumpDir)) {
        fs.mkdirSync(dumpDir, { recursive: true })
        console.log('📁 Created dump directory:', dumpDir)
      }

      let needsDownload = false
      
      // Sjekk om vi trenger å laste ned på nytt (1 gang per dag)
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
        const lastFetch = new Date(metadata.lastFetched).getTime()
        const dayInMs = 24 * 60 * 60 * 1000
        
        if (Date.now() - lastFetch > dayInMs) {
          console.log('📥 Dump is older than 24 hours, will re-download')
          needsDownload = true
        } else {
          console.log('📦 Using existing dump file (last updated:', metadata.lastFetched, ')')
        }
      } else {
        console.log('📥 No existing dump found, will download')
        needsDownload = true
      }

      // Last ned hvis nødvendig
      if (needsDownload) {
        console.log('📥 Fetching hotel dump URL from RateHawk...')
        
        const dumpUrlResponse = await this.makeRequest('/hotel/info/dump/', {
          language: 'en'
        }, 'POST')

        if (!dumpUrlResponse?.data?.url) {
          console.warn('⚠️ No dump URL received - continuing without dump')
          return
        }

        const dumpUrl = dumpUrlResponse.data.url
        console.log('📥 Downloading hotel dump file (compressed)...')
        
        const response = await fetch(dumpUrl)
        if (!response.ok) {
          throw new Error(`Failed to download dump: ${response.status}`)
        }

        const compressedBuffer = Buffer.from(await response.arrayBuffer())
        fs.writeFileSync(compressedDumpPath, compressedBuffer)
        console.log('✅ Downloaded compressed dump:', Math.round(compressedBuffer.length / 1024 / 1024), 'MB')

        // Dekomprimér og lagre
        console.log('📥 Decompressing dump file...')
        const decompressedBuffer = await zstd.decompress(compressedBuffer)
        fs.writeFileSync(decompressedDumpPath, decompressedBuffer)
        console.log('✅ Decompressed dump:', Math.round(decompressedBuffer.length / 1024 / 1024), 'MB')

        // Lagre metadata
        fs.writeFileSync(metadataPath, JSON.stringify({
          lastFetched: new Date().toISOString(),
          url: dumpUrl
        }))
      }

      // Les dump-filen linje for linje (streaming for å spare minne)
      console.log('📥 Loading hotel dump into memory...')
      
      return new Promise<void>((resolve, reject) => {
        const stream = fs.createReadStream(decompressedDumpPath, { 
          flags: 'r', 
          encoding: 'utf-8' 
        })
        
        let buffer = ''
        let hotelCount = 0
        
        const processLine = (line: string) => {
          // Fjern \r hvis den finnes
          if (line[line.length - 1] === '\r') {
            line = line.substring(0, line.length - 1)
          }
          
          if (line.length > 0) {
            try {
              const hotel = JSON.parse(line)
              
              // Cache hotel med både ID og HID som key
              if (hotel.id) {
                this.hotelDumpCache.set(hotel.id, hotel)
              }
              if (hotel.hid) {
                this.hotelDumpCache.set(hotel.hid.toString(), hotel)
              }
              
              hotelCount++
              
              // Progress log hver 10,000 hoteller
              if (hotelCount % 10000 === 0) {
                console.log(`📥 Loaded ${hotelCount} hotels...`)
              }
            } catch (error) {
              // Ignorer linjer som ikke kan parses
            }
          }
        }
        
        const readLineByLine = () => {
          let position
          while ((position = buffer.indexOf('\n')) >= 0) {
            if (position === 0) {
              buffer = buffer.slice(1)
              continue
            }
            processLine(buffer.slice(0, position))
            buffer = buffer.slice(position + 1)
          }
        }
        
        stream.on('data', (chunk: string | Buffer) => {
          buffer += chunk.toString()
          readLineByLine()
        })
        
        stream.on('end', () => {
          // Process siste linje
          if (buffer.length > 0) {
            processLine(buffer)
          }
          
          this.dumpLastFetched = Date.now()
          console.log('✅ Hotel dump loaded into memory:', this.hotelDumpCache.size, 'hotels')
          resolve()
        })
        
        stream.on('error', (error) => {
          console.error('❌ Error reading dump file:', error)
          reject(error)
        })
      })
      
    } catch (error: any) {
      console.warn('⚠️ Failed to load hotel dump:', error.message)
      // Ikke kast feil - vi fortsetter uten dump
    }
  }

  // Hent hotell-detaljer fra cache (lazy loading)
  private async getHotelFromDump(hotelId: string | number): Promise<any> {
    // Hvis cache er tom, last dump lazy (kun første gang)
    if (this.hotelDumpCache.size === 0) {
      console.log('📦 Lazy loading hotel dump for hotel:', hotelId)
      await this.ensureHotelDump()
    }
    return this.hotelDumpCache.get(hotelId.toString())
  }

  // Hent statisk hotelldata fra /hotel/info/ endpoint (raskere enn dump for individuelle hoteller)
  private async getHotelStaticInfo(hotelId?: string, hid?: number): Promise<any> {
    try {
      if (!this.apiKey || !this.accessToken) {
        return null
      }

      const params: any = {
        language: 'en'
      }

      if (hid) {
        params.hid = hid
      } else if (hotelId) {
        params.id = hotelId
      } else {
        return null
      }

      console.log('🏨 Fetching static hotel info from /hotel/info/:', params)
      const data = await this.makeRequest('/hotel/info/', params, 'POST')
      
      console.log('🏨 Static info response for', params.id || params.hid, ':', {
        hasData: !!data?.data,
        hasImages: !!data?.data?.images,
        imagesCount: data?.data?.images?.length || 0,
        hasAmenities: !!data?.data?.amenities,
        amenitiesCount: data?.data?.amenities?.length || 0
      })
      
      if (data?.data) {
        return data.data
      }
      
      return null
    } catch (error: any) {
      console.warn('⚠️ Failed to fetch static hotel info:', error.message)
      return null
    }
  }

  // Parse alle bilder fra RateHawk images array
  private parseAllImages(images: any[] | undefined): string[] {
    if (!images || !Array.isArray(images)) {
      return []
    }

    const parsedImages: string[] = []
    
    for (const img of images) {
      if (typeof img === 'string') {
        // Direkte URL string - erstatt {size} placeholder
        parsedImages.push(img.replace('{size}', '1024x768'))
      } else if (img?.url) {
        // Objekt med url property
        parsedImages.push(img.url.replace('{size}', '1024x768'))
      }
    }

    return parsedImages
  }

  // Parse amenity groups fra hotel static info
  private parseAmenityGroups(amenityGroups: any[] | undefined): any[] {
    if (!amenityGroups || !Array.isArray(amenityGroups)) {
      return []
    }

    return amenityGroups.map(group => ({
      group_name: this.translateAmenityGroupName(group.group_name || 'Andre'),
      amenities: (group.amenities || []).map((amenity: any) => ({
        name: this.formatAmenityName(amenity.name || amenity.amenity_name || amenity),
        icon: this.getAmenityIcon(amenity.name || amenity.amenity_name || amenity)
      }))
    })).filter(group => group.amenities.length > 0)
  }

  // Oversett amenity group navn til norsk
  private translateAmenityGroupName(groupName: string): string {
    const groupMap: Record<string, string> = {
      'general': 'Generelt',
      'internet': 'Internett',
      'parking': 'Parkering',
      'reception_services': 'Resepsjonstjenester',
      'entertainment_and_family_services': 'Underholdning og familie',
      'food_and_drinks': 'Mat og drikke',
      'pool_and_wellness': 'Basseng og velvære',
      'business_facilities': 'Bedriftsfasiliteter',
      'accessibility': 'Tilgjengelighet',
      'pets': 'Kjæledyr',
      'cleaning_services': 'Rengjøringstjenester',
      'bathroom': 'Bad',
      'bedroom': 'Soverom',
      'kitchen': 'Kjøkken',
      'room_amenities': 'Romsservice',
      'outdoors': 'Utendørs',
      'activities': 'Aktiviteter'
    }
    return groupMap[groupName.toLowerCase()] || groupName
  }

  // Få ikon for amenity (for fremtidig bruk med ikon-bibliotek)
  private getAmenityIcon(amenityName: string): string {
    const iconMap: Record<string, string> = {
      'wifi': 'wifi',
      'parking': 'car',
      'pool': 'waves',
      'gym': 'dumbbell',
      'restaurant': 'utensils',
      'bar': 'glass',
      'spa': 'sparkles',
      'pet': 'paw'
    }
    
    const key = amenityName.toLowerCase()
    for (const [keyword, icon] of Object.entries(iconMap)) {
      if (key.includes(keyword)) {
        return icon
      }
    }
    return 'check'
  }

  // Hent hotell-anmeldelser fra reviews dump eller hotel info
  async getHotelReviews(hotelId: string): Promise<any[]> {
    try {
      if (!this.apiKey || !this.accessToken) {
        console.warn('⚠️ No API credentials for reviews')
        return []
      }

      console.log('⭐ Fetching reviews for hotel:', hotelId)

      // Prøv først å hente fra hotel/info (kan inneholde reviews)
      const staticInfo = await this.getHotelStaticInfo(hotelId)
      
      if (staticInfo?.reviews && Array.isArray(staticInfo.reviews) && staticInfo.reviews.length > 0) {
        console.log('⭐ Found', staticInfo.reviews.length, 'reviews in static info')
        return this.parseReviews(staticInfo.reviews)
      }

      console.log('⭐ No reviews found for hotel:', hotelId)
      return []
    } catch (error: any) {
      console.warn('⚠️ Failed to fetch reviews:', error.message)
      return []
    }
  }

  // Parse reviews til lesbart format
  private parseReviews(reviews: any[]): any[] {
    if (!reviews || !Array.isArray(reviews)) {
      return []
    }

    return reviews.slice(0, 10).map(review => ({
      author: review.author || review.user_name || 'Anonym',
      date: review.date || review.created_at || null,
      rating: review.rating || review.score || 0,
      title: review.title || null,
      text: review.text || review.comment || review.review || '',
      pros: review.pros || null,
      cons: review.cons || null
    })).filter(review => review.text && review.text.length > 10)
  }

  // Formater amenity navn til lesbart format
  private formatAmenityName(amenity: string): string {
    // Map RateHawk amenity-koder til norske navn
    const amenityMap: Record<string, string> = {
      // Basis
      'free-wifi': 'Gratis WiFi',
      'wifi': 'WiFi',
      'parking': 'Parkering',
      'free-parking': 'Gratis parkering',
      
      // Rom
      'air-conditioning': 'Aircondition',
      'air-conditioned': 'Aircondition',
      'heating': 'Oppvarming',
      'tv': 'TV',
      'television': 'TV',
      'safe': 'Safe',
      'minibar': 'Minibar',
      'balcony': 'Balkong',
      'terrace': 'Terrasse',
      'bathtub': 'Badekar',
      'shower': 'Dusj',
      'hairdryer': 'Føner',
      'iron': 'Strykejern',
      'desk': 'Skrivebord',
      
      // Senger
      'king-bed': 'King size seng',
      'queen-bed': 'Queen size seng',
      'double-bed': 'Dobbeltseng',
      'twin-beds': 'To enkeltsenger',
      
      // Hotell fasiliteter
      'swimming-pool': 'Svømmebasseng',
      'pool': 'Basseng',
      'indoor-pool': 'Innendørs basseng',
      'outdoor-pool': 'Utendørs basseng',
      'gym': 'Treningssenter',
      'fitness-center': 'Treningssenter',
      'fitness': 'Treningssenter',
      'spa': 'Spa',
      'sauna': 'Badstu',
      'restaurant': 'Restaurant',
      'bar': 'Bar',
      'breakfast': 'Frokost',
      'breakfast-buffet': 'Frokostbuffet',
      'room-service': 'Romservice',
      '24-hour-front-desk': '24-timers resepsjon',
      'concierge': 'Concierge',
      'elevator': 'Heis',
      'lift': 'Heis',
      
      // Spesielle
      'pet-friendly': 'Kjæledyr tillatt',
      'pets-allowed': 'Kjæledyr tillatt',
      'family-rooms': 'Familierom',
      'non-smoking': 'Røykfritt',
      'non-smoking-rooms': 'Røykfrie rom',
      'accessible': 'Tilgjenglighet',
      'wheelchair-accessible': 'Rullestoltilgjengelig',
      
      // Business
      'business-center': 'Forretningssenter',
      'meeting-rooms': 'Møterom',
      'conference-facilities': 'Konferansefasiliteter',
      
      // Internet
      'free-wifi-in-all-rooms': 'Gratis WiFi i alle rom',
      'free-internet': 'Gratis internett',
      
      // Kjøkken
      'kitchenette': 'Tekjøkken',
      'kitchen': 'Kjøkken',
      'microwave': 'Mikrobølgeovn',
      'refrigerator': 'Kjøleskap',
      'coffee-maker': 'Kaffetrakter',
    }
    
    // Sjekk om vi har en direkte mapping
    const lowerAmenity = amenity.toLowerCase().replace(/_/g, '-')
    if (amenityMap[lowerAmenity]) {
      return amenityMap[lowerAmenity]
    }
    
    // Ellers, kapitiser første bokstav og erstatt bindestreker/underscores
    return amenity
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  // Hent region ID fra destinasjon
  private async getRegionId(destination: string): Promise<string | null> {
    try {
      console.log('🔍 Getting region ID for:', destination)

      // VIKTIG: Sjekk om destinasjonen er et hotel ID (test hotel eller hotel fra multicomplete)
      // Hotels fra multicomplete har hid (numeric) eller id (string)
      if (destination === '8473727' || destination === 'test_hotel_do_not_book') {
        console.log('🔍 This is TEST HOTEL ID - will search by hotel ID')
        return destination
      }

      // Sjekk om destination allerede er et region ID (numerisk streng > 10000)
      if (/^\d+$/.test(destination)) {
        const destNum = parseInt(destination)
        // Hotel IDs er typisk 7-8 sifre, region IDs er typisk 4 sifre eller store tall
        if (destNum > 10000000) {
          console.log('🔍 This looks like a HOTEL ID (large number):', destination)
          return destination // Dette er sannsynligvis et hotel ID
        }
        console.log('🔍 Destination is already a region ID:', destination)
        return destination
      }

      // For sandbox/test environment, prøv først å mappe kjente destinasjoner
      const knownDestinations: Record<string, string> = {
        'OSL': '2563', // Oslo (oppdaterte region IDs)
        'CPH': '1953', // Copenhagen
        'BER': '1382', // Berlin
        'LON': '1869', // London
        'PAR': '1775', // Paris
        'AMS': '1783', // Amsterdam
        'STO': '2275', // Stockholm
        'ROM': '1991', // Rome
        '8473727': '2563' // Test hotel - prøver Oslo region som test
      }

      // Hvis destinasjonen er en kjent IATA kode, returner tilsvarende region ID
      if (knownDestinations[destination]) {
        console.log('🔍 Using known region ID for:', destination, '=', knownDestinations[destination])
        return knownDestinations[destination]
      }

      // Prøv autocomplete først for å få region info
      try {
        const autoCompleteData = await this.makeRequest('/search/multicomplete/', {
          q: destination,
          language: 'en'
        })

        console.log('🔍 Autocomplete response:', JSON.stringify(autoCompleteData, null, 2))

        // Parse region data fra autocomplete
        if (autoCompleteData && autoCompleteData.regions && autoCompleteData.regions.length > 0) {
          const region = autoCompleteData.regions[0]
          console.log('🔍 Found region via autocomplete:', region)
          return region.id.toString()
        }
      } catch (autoCompleteError) {
        console.warn('🔍 Autocomplete failed:', (autoCompleteError as any).message)
      }

      // Prøv region search som fallback
      try {
        const regionData = await this.makeRequest('/search/serp/region/', {
          q: destination,
          language: 'en'
        })

        console.log('🔍 Region search response:', JSON.stringify(regionData, null, 2))

        if (regionData && regionData.regions && regionData.regions.length > 0) {
          const region = regionData.regions[0]
          console.log('🔍 Found region via direct search:', region)
          return region.id.toString()
        }
      } catch (regionError) {
        console.warn('🔍 Region search failed:', (regionError as any).message)
      }

      console.warn('🔍 No region found for destination:', destination)
      return null
    } catch (error) {
      console.error('❌ Failed to get region ID:', error)
      return null
    }
  }



  // Hent hoteldetaljer med rom og priser (Retrieve hotelpage)
  async getHotelDetails(params: {
    hotelId?: string
    hid?: number
    checkIn: string
    checkOut: string
    adults: number
    children?: number
    rooms?: number
    currency?: string
  }) {
    try {
      console.log('🏨 Getting hotel details (hotelpage):', params)

      if (!this.apiKey || !this.accessToken) {
        throw new Error('RateHawk API credentials missing')
      }

      // Bygg guests array
      const guests = [{
        adults: params.adults,
        children: params.children ? Array(params.children).fill(0) : []
      }]

      // Bygg request basert på om vi har hotelId (string) eller hid (number)
      // Note: getHotelDetails brukes ikke direkte med userCountry, men kan utvides senere
      const requestParams: any = {
        checkin: params.checkIn,
        checkout: params.checkOut,
        residency: 'no', // Default, kan utvides til å ta userCountry som parameter
        language: 'en',
        guests: guests,
        currency: params.currency || 'NOK',
        timeout: 8
      }

      // Bruk enten id (string) eller hid (number) basert på hva vi har
      if (params.hid) {
        requestParams.hid = params.hid
      } else if (params.hotelId) {
        requestParams.id = params.hotelId
      } else {
        throw new Error('Either hotelId or hid is required')
      }

      console.log('🏨 Making /search/hp/ request:', requestParams)

      const data = await this.makeRequest('/search/hp/', requestParams, 'POST')
      console.log('🏨 Raw hotelpage response:', JSON.stringify(data, null, 2))

      // Parse RateHawk hotelpage response
      if (data?.data?.hotels && data.data.hotels.length > 0) {
        const hotelData = data.data.hotels[0]
        
        // Hent statisk data fra /hotel/info/ for bedre navn, adresse, bilder
        const staticInfo = await this.getHotelStaticInfo(params.hotelId, params.hid)
        
        // Bruk statisk data hvis tilgjengelig, ellers fallback til hotelpage data
        const hotelName = staticInfo?.name || staticInfo?.hotel_name || hotelData.name || hotelData.hotel_name || 'Hotel ID: ' + (params.hotelId || params.hid)
        
        const hotelAddress = staticInfo ? [
          staticInfo.address,
          staticInfo.city?.name,
          staticInfo.region?.name,
          staticInfo.region?.country_name || staticInfo.country?.name
        ].filter(Boolean).join(', ') : (hotelData.address || 'Address not available')
        
        // Hent bilde - RateHawk returnerer images som array av strings eller objekter
        let hotelImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'
        if (staticInfo?.images && Array.isArray(staticInfo.images) && staticInfo.images.length > 0) {
          const firstImage = staticInfo.images[0]
          if (typeof firstImage === 'string') {
            hotelImage = firstImage.replace('{size}', '1024x768')
          } else if (firstImage?.url) {
            hotelImage = firstImage.url.replace('{size}', '1024x768')
          }
        } else if (hotelData.image) {
          hotelImage = typeof hotelData.image === 'string' ? hotelData.image : hotelData.image.url || hotelImage
        } else if (hotelData.images && Array.isArray(hotelData.images) && hotelData.images.length > 0) {
          const firstImage = hotelData.images[0]
          hotelImage = typeof firstImage === 'string' ? firstImage : (firstImage.url || hotelImage)
        }
        
        const starRating = staticInfo?.star_rating || staticInfo?.stars || hotelData.star_rating || hotelData.stars || 0

        // Hent anmeldelser hvis mulig
        let reviews: any[] = []
        try {
          reviews = await this.getHotelReviews(params.hotelId || params.hid?.toString() || '')
        } catch (error) {
          console.warn('⚠️ Could not fetch reviews:', error)
        }

        // Parse rom-typer og rates
        const rooms: any[] = []
        if (hotelData.rates && hotelData.rates.length > 0) {
          hotelData.rates.forEach((rate: any) => {
            rooms.push({
              match_hash: rate.match_hash,
              book_hash: rate.book_hash, // book_hash brukes for booking
              room_name: rate.room_name || 'Standard Room',
              room_description: rate.room_data_trans || {},
              meal: rate.meal || 'room_only',
              meal_data: rate.meal_data || {},
              daily_prices: rate.daily_prices || [],
              payment_options: rate.payment_options || {},
              cancellation_policies: rate.cancellation_penalties || {},
              amenities: rate.amenities_data || [],
              allotment: rate.allotment || 0
            })
          })
        }

        return {
          success: true,
          hotel: {
            id: hotelData.id || params.hotelId,
            hid: hotelData.hid,
            name: hotelName,
            address: hotelAddress,
            image: hotelImage,
            images: this.parseAllImages(staticInfo?.images || hotelData.images),
            star_rating: starRating,
            amenity_groups: this.parseAmenityGroups(staticInfo?.amenity_groups),
            description: staticInfo?.description_struct || hotelData.description || null,
            check_in_time: staticInfo?.check_in_time || null,
            check_out_time: staticInfo?.check_out_time || null,
            reviews: reviews,
            review_count: reviews.length,
            rooms: rooms,
            total_rooms: rooms.length
          }
        }
      }

      throw new Error('Hotel not found')

    } catch (error: any) {
      console.error('❌ RateHawk Hotel Details Error:', error)
      return {
        success: false,
        error: error.message || 'Failed to fetch hotel details'
      }
    }
  }


  // Create booking form (Step 1: Prebook rate before booking)
  async prebookRate(params: {
    bookHash: string  // Changed from matchHash to bookHash
    checkIn: string
    checkOut: string
    adults: number
    children?: number
    rooms?: number
    currency?: string
  }) {
    try {
      console.log('🔍 Creating booking form (prebook):', params)

      if (!this.apiKey || !this.accessToken) {
        throw new Error('RateHawk API credentials missing')
      }

      // Generate unique partner_order_id
      const partnerOrderId = `KULBRUK_${Date.now()}_${Math.random().toString(36).substring(7)}`

      const requestParams = {
        partner_order_id: partnerOrderId,
        book_hash: params.bookHash,  // Use bookHash directly
        language: 'en',
        user_ip: '82.29.0.86' // Required field - kan evt. hentes fra request
      }

      console.log('🔍 Making /hotel/order/booking/form/ request:', requestParams)

      const data = await this.makeRequest('/hotel/order/booking/form/', requestParams, 'POST')
      console.log('🔍 Raw booking form response:', JSON.stringify(data, null, 2))

      // Parse RateHawk booking form response
      if (data?.data) {
        return {
          success: true,
          data: {
            item_id: data.data.item_id,
            order_id: data.data.order_id,
            partner_order_id: data.data.partner_order_id,
            payment_types: data.data.payment_types,
            upsell_data: data.data.upsell_data
          }
        }
      }

      throw new Error('Booking form creation failed - no data returned')

    } catch (error: any) {
      console.error('❌ RateHawk Booking Form Error:', error)
      return {
        success: false,
        error: error.message || 'Failed to create booking form'
      }
    }
  }


  // Start booking process (Step 3: Finish booking)
  async finishBooking(params: {
    partnerOrderId: string
    userEmail: string
    userPhone: string
    firstName: string
    lastName: string
    paymentType: 'deposit' | 'now'
    amount: string
    currencyCode: string
    remarks?: string
  }) {
    try {
      console.log('💳 Finishing booking:', params)

      if (!this.apiKey || !this.accessToken) {
        throw new Error('RateHawk API credentials missing')
      }

      const requestParams = {
        user: {
          email: params.userEmail,
          phone: params.userPhone,
          comment: params.remarks || ''
        },
        supplier_data: {
          first_name_original: params.firstName,
          last_name_original: params.lastName,
          phone: params.userPhone,
          email: params.userEmail
        },
        partner: {
          partner_order_id: params.partnerOrderId,
          comment: 'Booking via Kulbruk.no',
          amount_sell_b2b2c: '0'
        },
        language: 'en',
        rooms: [
          {
            guests: [
              {
                first_name: params.firstName,
                last_name: params.lastName
              }
            ]
          }
        ],
        payment_type: {
          type: params.paymentType,
          amount: params.amount,
          currency_code: params.currencyCode
        },
        return_path: 'https://kulbruk.no/hotell/booking-confirmation'
      }

      console.log('💳 Making /hotel/order/booking/finish/ request')

      const data = await this.makeRequest('/hotel/order/booking/finish/', requestParams, 'POST')
      console.log('💳 Raw finish booking response:', JSON.stringify(data, null, 2))

      // For deposit payment, data kan være null i sandbox - status 'ok' betyr suksess
      if (data?.status === 'ok') {
        return {
          success: true,
          data: {
            order_id: data.data?.order_id || 0,
            partner_order_id: params.partnerOrderId,
            status: 'initiated', // Status må sjekkes med check booking
            item_id: data.data?.item_id || 0
          }
        }
      }

      throw new Error(data?.error || 'Booking finish failed')

    } catch (error: any) {
      console.error('❌ RateHawk Finish Booking Error:', error)
      return {
        success: false,
        error: error.message || 'Failed to finish booking'
      }
    }
  }

  // Check booking process (Poll for booking status)
  async checkBookingStatus(partnerOrderId: string) {
    try {
      console.log('🔍 Checking booking status:', partnerOrderId)

      if (!this.apiKey || !this.accessToken) {
        throw new Error('RateHawk API credentials missing')
      }

      const requestParams = {
        partner_order_id: partnerOrderId
      }

      console.log('🔍 Making /hotel/order/booking/finish/status/ request')

      const data = await this.makeRequest('/hotel/order/booking/finish/status/', requestParams, 'POST')
      console.log('🔍 Raw booking status response:', JSON.stringify(data, null, 2))

      // Parse status response
      // status can be: 'ok', 'processing', '3ds', 'error'
      if (data?.status) {
        return {
          success: true,
          status: data.status,
          data: {
            partner_order_id: data.data?.partner_order_id,
            percent: data.data?.percent,
            data_3ds: data.data?.data_3ds
          },
          error: data.error
        }
      }

      throw new Error('Invalid status response')

    } catch (error: any) {
      console.error('❌ RateHawk Check Booking Status Error:', error)
      return {
        success: false,
        status: 'error',
        error: error.message || 'Failed to check booking status'
      }
    }
  }

  // Retrieve bookings - hent faktisk order_id og booking detaljer
  async retrieveBookings(partnerOrderId: string) {
    try {
      console.log('📋 Retrieving booking:', partnerOrderId)

      if (!this.apiKey || !this.accessToken) {
        throw new Error('RateHawk API credentials missing')
      }

      const requestParams = {
        partner_order_id: partnerOrderId
      }

      console.log('📋 Making /order/search/ request')

      const data = await this.makeRequest('/order/search/', requestParams, 'POST')
      console.log('📋 Raw retrieve bookings response:', JSON.stringify(data, null, 2))

      if (data?.status === 'ok' && data?.data) {
        return {
          success: true,
          booking: data.data
        }
      }

      throw new Error(data?.error || 'Failed to retrieve booking')

    } catch (error: any) {
      console.error('❌ RateHawk Retrieve Bookings Error:', error)
      return {
        success: false,
        error: error.message || 'Failed to retrieve booking'
      }
    }
  }

  // Hent order info (inkludert HCN - Hotel Confirmation Number)
  async getOrderInfo(orderId: number) {
    try {
      console.log('📋 Getting order info for order ID:', orderId)

      if (!this.apiKey || !this.accessToken) {
        throw new Error('RateHawk API credentials missing')
      }

      const requestParams = {
        order_id: orderId
      }

      console.log('📋 Making /hotel/order/info/ request')

      const data = await this.makeRequest('/hotel/order/info/', requestParams, 'POST')
      console.log('📋 Raw order info response:', JSON.stringify(data, null, 2))

      if (data?.status === 'ok' && data?.data) {
        // HCN kan være i flere felter avhengig av RateHawk response
        const hcn = data.data.hcn || 
                    data.data.hotel_confirmation_number || 
                    data.data.confirmation_number ||
                    data.data.voucher?.confirmation_number ||
                    null

        return {
          success: true,
          orderInfo: {
            orderId: data.data.order_id,
            partnerOrderId: data.data.partner_order_id,
            hcn: hcn, // Hotel Confirmation Number
            status: data.data.status,
            hotelName: data.data.hotel_name,
            checkIn: data.data.checkin,
            checkOut: data.data.checkout,
            guestName: data.data.guest_name,
            totalPrice: data.data.total_price,
            currency: data.data.currency,
            voucher: data.data.voucher,
            policies: data.data.policies
          }
        }
      }

      throw new Error(data?.error || 'Failed to get order info')

    } catch (error: any) {
      console.error('❌ RateHawk Get Order Info Error:', error)
      return {
        success: false,
        error: error.message || 'Failed to get order info'
      }
    }
  }

  // Hent cancellation penalties før kansellering
  async getCancellationPenalties(partnerOrderId: string) {
    try {
      console.log('💰 Getting cancellation penalties for:', partnerOrderId)

      if (!this.apiKey || !this.accessToken) {
        throw new Error('RateHawk API credentials missing')
      }

      // Hent order info først for å få order_id
      const retrieveResult = await this.retrieveBookings(partnerOrderId)
      if (!retrieveResult.success || !retrieveResult.booking?.order_id) {
        throw new Error('Could not retrieve booking details')
      }

      const orderId = retrieveResult.booking.order_id

      // Hent order info som inneholder cancellation penalties
      const orderInfoResult = await this.getOrderInfo(orderId)
      if (!orderInfoResult.success) {
        throw new Error('Could not get order info for penalties')
      }

      // Extract cancellation penalties fra order info
      const orderInfo = orderInfoResult.orderInfo as any
      const penalties = orderInfo?.policies?.cancellation_penalties || 
                        orderInfo?.cancellation_penalties ||
                        null

      return {
        success: true,
        penalties: penalties,
        orderInfo: orderInfoResult.orderInfo
      }

    } catch (error: any) {
      console.error('❌ RateHawk Get Cancellation Penalties Error:', error)
      return {
        success: false,
        error: error.message || 'Failed to get cancellation penalties',
        penalties: null
      }
    }
  }

  // Cancel booking
  async cancelBooking(partnerOrderId: string) {
    try {
      console.log('❌ Cancelling booking:', partnerOrderId)

      if (!this.apiKey || !this.accessToken) {
        throw new Error('RateHawk API credentials missing')
      }

      const requestParams = {
        partner_order_id: partnerOrderId
      }

      console.log('❌ Making /hotel/order/cancel/client/ request')

      const data = await this.makeRequest('/hotel/order/cancel/client/', requestParams, 'POST')
      console.log('❌ Raw cancel response:', JSON.stringify(data, null, 2))

      if (data?.status === 'ok') {
        return {
          success: true,
          message: 'Booking cancelled successfully',
          penalties: data.data?.penalties || null
        }
      }

      throw new Error(data?.error || 'Cancellation failed')

    } catch (error: any) {
      console.error('❌ RateHawk Cancel Booking Error:', error)
      return {
        success: false,
        error: error.message || 'Failed to cancel booking'
      }
    }
  }

  // Cache for region data
  private regionCache: any[] | null = null
  private regionCachePromise: Promise<any[]> | null = null

  // Hent populære destinasjoner for autocomplete (ekte data fra RateHawk regioner)
  private async getPopularDestinations() {
    // Returner en kuratert liste over populære destinasjoner
    // Shuffle for å vise forskjellige destinasjoner hver gang
    const allDestinations = [
      // Test hotel først (viktig for testing!)
      { id: '8473727', name: 'Test Hotel (Do Not Book)', country: 'Test', type: 'hotel' },
      
      // Europa
      { id: '2563', name: 'Oslo', country: 'Norway', type: 'city' },
      { id: '2275', name: 'Stockholm', country: 'Sweden', type: 'city' },
      { id: '1953', name: 'Copenhagen', country: 'Denmark', type: 'city' },
      { id: '1382', name: 'Berlin', country: 'Germany', type: 'city' },
      { id: '1783', name: 'Amsterdam', country: 'Netherlands', type: 'city' },
      { id: '1775', name: 'Paris', country: 'France', type: 'city' },
      { id: '1869', name: 'London', country: 'United Kingdom', type: 'city' },
      { id: '1991', name: 'Rome', country: 'Italy', type: 'city' },
      { id: '1912', name: 'Barcelona', country: 'Spain', type: 'city' },
      { id: '1854', name: 'Vienna', country: 'Austria', type: 'city' },
      { id: '1814', name: 'Prague', country: 'Czech Republic', type: 'city' },
      { id: '2103', name: 'Athens', country: 'Greece', type: 'city' },
      { id: '1876', name: 'Budapest', country: 'Hungary', type: 'city' },

      // Nord Amerika
      { id: '2395', name: 'New York', country: 'United States', type: 'city' },
      { id: '2409', name: 'Los Angeles', country: 'United States', type: 'city' },
      { id: '2390', name: 'Miami', country: 'United States', type: 'city' },
      { id: '2444', name: 'Toronto', country: 'Canada', type: 'city' },
      { id: '2416', name: 'Vancouver', country: 'Canada', type: 'city' },

      // Asia
      { id: '2483', name: 'Tokyo', country: 'Japan', type: 'city' },
      { id: '2520', name: 'Bangkok', country: 'Thailand', type: 'city' },
      { id: '2508', name: 'Singapore', country: 'Singapore', type: 'city' },
      { id: '2477', name: 'Dubai', country: 'United Arab Emirates', type: 'city' },

      // Oceania
      { id: '2428', name: 'Sydney', country: 'Australia', type: 'city' },

      // Afrika
      { id: '2468', name: 'Cape Town', country: 'South Africa', type: 'city' },
      { id: '2463', name: 'Cairo', country: 'Egypt', type: 'city' },

      // Populære regioner/land
      { id: '2069', name: 'Spain', country: 'Spain', type: 'country' },
      { id: '2115', name: 'Greece', country: 'Greece', type: 'country' },
      { id: '1889', name: 'France', country: 'France', type: 'country' },
      { id: '1839', name: 'Italy', country: 'Italy', type: 'country' },
      { id: '2385', name: 'United States', country: 'United States', type: 'country' },
      { id: '2440', name: 'Canada', country: 'Canada', type: 'country' },
      { id: '2515', name: 'Thailand', country: 'Thailand', type: 'country' },
    ]

    // Shuffle array for å vise forskjellige destinasjoner hver gang (behold test hotel først)
    const testHotel = allDestinations[0] // Test hotel
    const others = allDestinations.slice(1) // Resten
    
    // Fisher-Yates shuffle
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]]
    }

    // Returner test hotel + 19 tilfeldige andre
    return [testHotel, ...others.slice(0, 19)]
  }

  // Søk etter destinasjoner (autocomplete) - bruker RateHawk multicomplete API
  async searchDestinations(query: string) {
    try {
      console.log('📍 RateHawk Destination Search:', query)

      if (!this.apiKey || !this.accessToken) {
        throw new Error('RateHawk API credentials missing')
      }

      // Prøv først RateHawk multicomplete API
      try {
        console.log('📍 Attempting RateHawk /search/multicomplete/ API')
        
        const response = await this.makeRequest('/search/multicomplete/', {
          query: query || 'oslo', // Default søk hvis tomt
          language: 'en'
          // Ingen lookFor parameter - API returnerer både regions og hotels automatisk
        }, 'POST')

        console.log('📍 Multicomplete response:', {
          status: response?.status,
          hasData: !!response?.data,
          regions: response?.data?.regions?.length || 0,
          hotels: response?.data?.hotels?.length || 0
        })

        const destinations: any[] = []

        // Parse regions fra response.data.regions
        if (response?.data?.regions && Array.isArray(response.data.regions)) {
          response.data.regions.slice(0, 10).forEach((region: any) => { // Maks 10 regions
            destinations.push({
              id: region.id?.toString(),
              name: region.name,
              type: region.type?.toLowerCase() || 'region',
              country: region.country_code || ''
            })
          })
        }

        // Parse hotels fra response.data.hotels
        if (response?.data?.hotels && Array.isArray(response.data.hotels)) {
          response.data.hotels.slice(0, 5).forEach((hotel: any) => { // Maks 5 hotels
            destinations.push({
              id: hotel.hid?.toString() || hotel.id?.toString(),
              name: hotel.name,
              type: 'hotel',
              country: ''
            })
          })
        }

        // ALLTID legg til test hotel i resultatene (for testing)
        const hasTestHotel = destinations.some(d => d.id === '8473727')
        if (!hasTestHotel) {
          destinations.unshift({
            id: '8473727',
            name: 'Test Hotel (Do Not Book)',
            type: 'hotel',
            country: 'Test'
          })
        }

        console.log('✅ Found destinations via multicomplete API:', destinations.length)
        
        if (destinations.length > 0) {
          return destinations.slice(0, 20) // Returner maks 20 resultater
        }

        // Hvis multicomplete ikke returnerte noe, fall tilbake til region dump
        console.log('📍 Multicomplete returned no results, trying region dump')
      } catch (multiError: any) {
        console.warn('⚠️ Multicomplete API failed:', multiError.message)
        console.log('📍 Falling back to region dump method')
      }

      // FALLBACK: Bruk region dump hvis multicomplete feiler eller ikke støttes
      try {
        console.log('📍 Attempting region dump API')
        
        const dumpResponse = await this.makeRequest('/hotel/region/dump/', {
          language: 'en'
        }, 'POST') // POST for region dump

        console.log('📍 Region dump response:', {
          type: typeof dumpResponse,
          isArray: Array.isArray(dumpResponse),
          keys: dumpResponse ? Object.keys(dumpResponse).slice(0, 5) : []
        })

        let regions: any[] = []

        // Parse response - RateHawk kan returnere URL til dump fil
        if (typeof dumpResponse === 'object' && dumpResponse !== null) {
          if (dumpResponse.data?.url) {
            // Response inneholder URL til dump fil - vi må laste den ned
            console.log('📍 Got dump URL, need to download:', dumpResponse.data.url)
            console.warn('⚠️ Region dump requires file download - not implemented yet')
            // For nå, skip dette og bruk fallback
            throw new Error('Region dump file download not implemented')
          } else if (Array.isArray(dumpResponse)) {
            regions = dumpResponse
          } else if (dumpResponse.data && Array.isArray(dumpResponse.data)) {
            regions = dumpResponse.data
          } else if (dumpResponse.regions && Array.isArray(dumpResponse.regions)) {
            regions = dumpResponse.regions
          }
        }

        console.log('📍 Total regions from dump:', regions.length)

        // Filtrer og map regions
        let filteredRegions = regions

        if (query.trim()) {
          const searchTerm = query.toLowerCase()
          filteredRegions = regions.filter((region: any) => {
            const name = region.name?.toLowerCase() || ''
            const countryName = region.country_name?.toLowerCase() || ''
            const id = region.id?.toString().toLowerCase() || ''
            return name.includes(searchTerm) || countryName.includes(searchTerm) || id.includes(searchTerm)
          })
        }

        // Sorter etter relevans
        filteredRegions.sort((a: any, b: any) => {
          const aName = a.name?.toLowerCase() || ''
          const bName = b.name?.toLowerCase() || ''
          const searchTerm = query.toLowerCase()

          if (query.trim()) {
            const aStarts = aName.startsWith(searchTerm)
            const bStarts = bName.startsWith(searchTerm)
            if (aStarts && !bStarts) return -1
            if (!aStarts && bStarts) return 1
          }

          return aName.localeCompare(bName)
        })

        const destinations = filteredRegions.slice(0, 20).map((region: any) => ({
          id: region.id?.toString() || region.region_id?.toString() || '',
          name: region.name || region.region_name || '',
          type: region.type || 'region',
          country: region.country_name || region.country || ''
        }))

        console.log('✅ Found destinations via region dump:', destinations.length)
        return destinations

      } catch (dumpError: any) {
        console.error('❌ Region dump also failed:', dumpError.message)
        
        // SISTE FALLBACK: Bruk kuratert liste med populære destinasjoner
        console.log('📍 Using curated popular destinations as final fallback')
        const popularDestinations = await this.getPopularDestinations()
        
        // Filtrer hvis det er et søk
        let filteredDestinations = popularDestinations
        if (query.trim()) {
          const searchTerm = query.toLowerCase()
          filteredDestinations = popularDestinations.filter((dest: any) => {
            const name = dest.name?.toLowerCase() || ''
            const country = dest.country?.toLowerCase() || ''
            const id = dest.id?.toLowerCase() || ''
            return name.includes(searchTerm) || country.includes(searchTerm) || id.includes(searchTerm)
          })
        }
        
        const results = filteredDestinations.slice(0, 20).map((dest: any) => ({
          id: dest.id,
          name: dest.name,
          type: dest.type || 'city',
          country: dest.country
        }))
        
        console.log('✅ Returning curated destinations:', results.length)
        return results
      }

    } catch (error) {
      console.error('❌ RateHawk Destination Search Error:', error)
      throw error
    }
  }

}

export const ratehawkClient = new RateHawkClient()
