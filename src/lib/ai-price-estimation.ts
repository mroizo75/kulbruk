// AI-powered bilpris estimering system

interface VehicleData {
  make: string
  model: string
  year: number
  mileage: number
  fuelType: string
  transmission: string
  condition?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
  location?: string
  features?: string[]
  registrationNumber?: string
}

interface PriceEstimation {
  estimatedPrice: number
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  priceRange: {
    min: number
    max: number
  }
  factors: {
    market: number        // Markedsverdi basert på historiske data
    mileage: number      // Kilometer-justering
    age: number          // Alder-justering  
    condition: number    // Stand-justering
    location: number     // Lokasjon-justering
    features: number     // Utstyr-bonus
  }
  marketTrend: 'RISING' | 'STABLE' | 'DECLINING'
  sources: string[]
  calculatedAt: Date
  methodology: 'AI_ANALYSIS' | 'MARKET_COMPARISON' | 'BASIC_ALGORITHM'
}

// Norske bilpris-kilder og APIer
const PRICE_SOURCES = {
  FINN_NO: 'finn.no',
  NAF: 'naf.no',
  BILNORGE: 'bilnorge.no',
  MOTOR: 'motor.no',
  FINN_BIL: 'bil.finn.no'
}

// AI-modell for prisestimering (simulert)
class AIVehiclePriceEstimator {
  
  async estimatePrice(vehicle: VehicleData): Promise<PriceEstimation> {
    console.log('🤖 AI Price Estimation for:', `${vehicle.make} ${vehicle.model} ${vehicle.year}`)
    
    try {
      // 1. Hent markedsdata fra multiple kilder
      const marketData = await this.getMarketData(vehicle)
      
      // 2. Beregn base pris fra AI-modell
      const basePrice = await this.calculateBasePrice(vehicle, marketData)
      
      // 3. Juster for kilometerstand
      const mileageAdjustment = this.calculateMileageAdjustment(vehicle.mileage, vehicle.year)
      
      // 4. Juster for alder
      const ageAdjustment = this.calculateAgeAdjustment(vehicle.year)
      
      // 5. Juster for stand
      const conditionAdjustment = this.calculateConditionAdjustment(vehicle.condition)
      
      // 6. Juster for lokasjon
      const locationAdjustment = this.calculateLocationAdjustment(vehicle.location)
      
      // 7. Juster for utstyr
      const featuresBonus = this.calculateFeaturesBonus(vehicle.features)
      
      // 8. Beregn final pris
      const adjustedPrice = basePrice * 
        (1 + mileageAdjustment) * 
        (1 + ageAdjustment) * 
        (1 + conditionAdjustment) * 
        (1 + locationAdjustment) * 
        (1 + featuresBonus)
      
      // 9. Beregn konfidensgrad
      const confidence = this.calculateConfidence(vehicle, marketData)
      
      // 10. Beregn prisområde
      const priceRange = this.calculatePriceRange(adjustedPrice, confidence)
      
      // 11. Analyser markedstrend
      const marketTrend = this.analyzeMarketTrend(vehicle, marketData)
      
      const estimation: PriceEstimation = {
        estimatedPrice: Math.round(adjustedPrice),
        confidence,
        priceRange,
        factors: {
          market: basePrice,
          mileage: mileageAdjustment,
          age: ageAdjustment,
          condition: conditionAdjustment,
          location: locationAdjustment,
          features: featuresBonus
        },
        marketTrend,
        sources: Object.values(PRICE_SOURCES),
        calculatedAt: new Date(),
        methodology: marketData.sampleSize > 10 ? 'AI_ANALYSIS' : 'MARKET_COMPARISON'
      }
      
      console.log('💰 AI Price Estimation completed:', {
        vehicle: `${vehicle.make} ${vehicle.model}`,
        estimatedPrice: estimation.estimatedPrice.toLocaleString('no-NO'),
        confidence: estimation.confidence,
        methodology: estimation.methodology
      })
      
      return estimation
      
    } catch (error) {
      console.error('❌ AI Price Estimation failed:', error)
      
      // Fallback til basic algoritme
      return this.basicPriceEstimation(vehicle)
    }
  }
  
  private async getMarketData(vehicle: VehicleData) {
    // Simuler API-kall til norske bilsider
    const mockData = {
      similarVehicles: [
        { price: 450000, mileage: 45000, year: 2020, source: 'finn.no' },
        { price: 465000, mileage: 38000, year: 2020, source: 'motor.no' },
        { price: 440000, mileage: 52000, year: 2020, source: 'bilnorge.no' }
      ],
      avgPrice: 451667,
      sampleSize: 15,
      priceRange: { min: 420000, max: 480000 },
      daysOnMarket: 28
    }
    
    // I produksjon ville vi gjøre ekte API-kall her:
    // - Scraping av finn.no bil-annonser
    // - NAF prisguide API
    // - Motor.no markedsdata
    // - Bilnorge verditaksering
    
    return mockData
  }
  
  private async calculateBasePrice(vehicle: VehicleData, marketData: any): Promise<number> {
    // AI-modell for base pris (simulert)
    
    // Brandfaktor
    const brandMultiplier = this.getBrandMultiplier(vehicle.make)
    
    // Modell popularitet
    const modelPopularity = this.getModelPopularity(vehicle.model)
    
    // Base pris fra markedsdata
    let basePrice = marketData.avgPrice * brandMultiplier * modelPopularity
    
    // Juster basert på AI-lærte mønstre
    basePrice = basePrice * this.getAIConfidenceMultiplier(vehicle)
    
    return basePrice
  }
  
  private getBrandMultiplier(make: string): number {
    const brandFactors: Record<string, number> = {
      'BMW': 1.15,
      'Mercedes-Benz': 1.18,
      'Audi': 1.12,
      'Porsche': 1.45,
      'Tesla': 1.08,
      'Volkswagen': 1.02,
      'Toyota': 1.05,
      'Volvo': 1.08,
      'Peugeot': 0.95,
      'Renault': 0.92
    }
    
    return brandFactors[make] || 1.0
  }
  
  private getModelPopularity(model: string): number {
    // Populære modeller har høyere verdi
    const popularModels = ['X5', 'A6', 'E-Class', 'Golf', 'XC90', 'Model 3']
    return popularModels.some(m => model.includes(m)) ? 1.05 : 1.0
  }
  
  private getAIConfidenceMultiplier(vehicle: VehicleData): number {
    // AI-modell som lærer fra historiske transaksjoner
    // Simulert ML-algoritme
    let confidence = 1.0
    
    // Høy etterspørsel etter nye biler
    if (vehicle.year >= 2020) confidence *= 1.02
    
    // Premium merker holder verdien bedre
    if (['BMW', 'Mercedes-Benz', 'Audi'].includes(vehicle.make)) {
      confidence *= 1.01
    }
    
    return confidence
  }
  
  private calculateMileageAdjustment(mileage: number, year: number): number {
    const avgMileagePerYear = 15000
    const expectedMileage = (new Date().getFullYear() - year) * avgMileagePerYear
    const mileageDifference = expectedMileage - mileage
    
    // Lavere kilometer = høyere verdi
    return (mileageDifference / expectedMileage) * 0.15 // Maks 15% justering
  }
  
  private calculateAgeAdjustment(year: number): number {
    const age = new Date().getFullYear() - year
    
    // Depresering per år (simulert)
    const depreciationRates = {
      0: 0,      // Ny bil
      1: -0.15,  // 15% første år
      2: -0.25,  // 25% andre år  
      3: -0.32,  // 32% tredje år
      4: -0.38,  // 38% fjerde år
      5: -0.43   // 43% femte år
    }
    
    if (age <= 5) {
      return depreciationRates[age as keyof typeof depreciationRates] || -0.50
    }
    
    // Etter 5 år, 5% per år
    return -0.43 - ((age - 5) * 0.05)
  }
  
  private calculateConditionAdjustment(condition?: string): number {
    const conditionFactors = {
      'EXCELLENT': 0.05,  // 5% bonus
      'GOOD': 0,          // No adjustment
      'FAIR': -0.08,      // 8% reduksjon
      'POOR': -0.20       // 20% reduksjon
    }
    
    return conditionFactors[condition as keyof typeof conditionFactors] || 0
  }
  
  private calculateLocationAdjustment(location?: string): number {
    // Oslo/Bergen har høyere priser
    const locationFactors: Record<string, number> = {
      'Oslo': 0.03,
      'Bergen': 0.02,
      'Trondheim': 0.01,
      'Stavanger': 0.02,
      'Kristiansand': 0,
      'Tromsø': -0.02
    }
    
    return locationFactors[location || ''] || 0
  }
  
  private calculateFeaturesBonus(features?: string[]): number {
    if (!features) return 0
    
    const featureValues: Record<string, number> = {
      'panoramatak': 0.02,
      'lær interiør': 0.015,
      'adaptiv cruise control': 0.01,
      'harman kardon': 0.008,
      'head-up display': 0.005,
      'el. bakluke': 0.003
    }
    
    return features.reduce((bonus, feature) => {
      const value = featureValues[feature.toLowerCase()] || 0
      return bonus + value
    }, 0)
  }
  
  private calculateConfidence(vehicle: VehicleData, marketData: any): 'HIGH' | 'MEDIUM' | 'LOW' {
    let score = 0
    
    // Sample size
    if (marketData.sampleSize >= 10) score += 3
    else if (marketData.sampleSize >= 5) score += 2
    else score += 1
    
    // Brand popularity
    if (['BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Toyota'].includes(vehicle.make)) {
      score += 2
    }
    
    // Age (newer cars = more data)
    if (vehicle.year >= 2020) score += 2
    else if (vehicle.year >= 2018) score += 1
    
    // Data completeness
    if (vehicle.mileage && vehicle.condition && vehicle.features) score += 1
    
    if (score >= 6) return 'HIGH'
    if (score >= 4) return 'MEDIUM'
    return 'LOW'
  }
  
  private calculatePriceRange(price: number, confidence: string) {
    const ranges = {
      'HIGH': 0.08,    // ±8%
      'MEDIUM': 0.12,  // ±12%
      'LOW': 0.18      // ±18%
    }
    
    const range = ranges[confidence as keyof typeof ranges]
    
    return {
      min: Math.round(price * (1 - range)),
      max: Math.round(price * (1 + range))
    }
  }
  
  private analyzeMarketTrend(vehicle: VehicleData, marketData: any): 'RISING' | 'STABLE' | 'DECLINING' {
    // Simulert trendanalyse
    
    // Tesla og elbiler synker
    if (vehicle.fuelType === 'Elektrisk' || vehicle.make === 'Tesla') {
      return 'DECLINING'
    }
    
    // Premium merker holder seg stabile
    if (['BMW', 'Mercedes-Benz', 'Audi', 'Porsche'].includes(vehicle.make)) {
      return 'STABLE'
    }
    
    // Nye biler stiger litt
    if (vehicle.year >= 2022) {
      return 'RISING'
    }
    
    return 'STABLE'
  }
  
  private basicPriceEstimation(vehicle: VehicleData): PriceEstimation {
    // Fallback basic estimation
    const basePrice = 300000 // Base pris
    const ageDepreciation = (new Date().getFullYear() - vehicle.year) * 0.08
    const mileageDepreciation = (vehicle.mileage / 15000) * 0.05
    
    const estimatedPrice = basePrice * (1 - ageDepreciation - mileageDepreciation)
    
    return {
      estimatedPrice: Math.round(estimatedPrice),
      confidence: 'LOW',
      priceRange: {
        min: Math.round(estimatedPrice * 0.8),
        max: Math.round(estimatedPrice * 1.2)
      },
      factors: {
        market: basePrice,
        mileage: -mileageDepreciation,
        age: -ageDepreciation,
        condition: 0,
        location: 0,
        features: 0
      },
      marketTrend: 'STABLE',
      sources: ['basic_algorithm'],
      calculatedAt: new Date(),
      methodology: 'BASIC_ALGORITHM'
    }
  }
}

// Export singleton instance
export const aiPriceEstimator = new AIVehiclePriceEstimator()

// Helper function for easy price estimation
export async function estimateVehiclePrice(vehicle: VehicleData): Promise<PriceEstimation> {
  return aiPriceEstimator.estimatePrice(vehicle)
}

// Real-time price monitoring
export function monitorPriceChanges(vehicleId: string, currentEstimation: PriceEstimation) {
  // Set up monitoring for price changes
  // In production: websocket eller polling for markedsendringer
  console.log('📊 Monitoring price changes for vehicle:', vehicleId)
  
  // Return unsubscribe function
  return () => {
    console.log('⏹️ Stopped monitoring price changes for:', vehicleId)
  }
}
