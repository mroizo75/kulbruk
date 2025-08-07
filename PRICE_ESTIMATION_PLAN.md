# 🚗 Bilprisestimering for Kulbruk.no
## Inspirert av Nettbil.no sin prisestimering

---

## 🎯 Målsetting

Gi brukere en realistisk prisestimering på bilen før den går til auksjon, akkurat som [Nettbil.no](https://www.nettbil.no/) gjør: *"Vi gir deg et prisestimat og setter opp en gratis uforpliktende test av bilen."*

---

## 📋 Utfordringer i Norge

### **🔍 Manglende offentlige API-er:**
- **NAF:** Har testdata og anbefalinger, men ingen prisestimering-API
- **Vegvesen API:** Tekniske spesifikasjoner, ikke prisestimering  
- **Finn.no/Bilbasen:** Har markedsdata, men ingen åpen API

### **💰 Kommersielle løsninger:**
- **Eurotax/Schwacke:** Europeiske løsninger (kostbare lisenser)
- **Motor.no:** Kan ha API, men ukjent tilgjengelighet
- **AutoIndex:** Norsk løsning, men primært for forhandlere

---

## 🚀 Implementeringsplan (4 faser)

### **📝 Fase 1: Manuel/Enkel estimering (1-2 uker)**

#### **Basis-system:**
```typescript
// Database schema for prisestimering
model PriceEstimation {
  id              String   @id @default(cuid())
  listingId       String   @unique
  listing         Listing  @relation(fields: [listingId], references: [id])
  
  // Automatisk data fra Vegvesen API
  make            String   // Merke
  model           String   // Modell  
  year            Int      // Årsmodell
  fuelType        String   // Drivstoff
  transmission    String   // Girkasse
  
  // Bruker-input
  mileage         Int      // Kilometerstand
  condition       String   // Tilstand (A-D)
  
  // Beregnet estimat
  estimatedPrice  Float?   // Estimert pris
  priceRange      Json     // { min: 180000, max: 220000 }
  
  // Grunnlag for estimering
  method          EstimationMethod
  confidence      String   // HIGH, MEDIUM, LOW
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum EstimationMethod {
  MANUAL_ADMIN     // Admin setter manuelt
  MARKET_ANALYSIS  // Markedssammenligning
  ML_ALGORITHM     // Machine learning
  EXTERNAL_API     // Ekstern tjeneste
}
```

#### **Enkel prislogikk:**
```typescript
// Grunnleggende prissetting basert på:
// 1. Basisverdi fra år og merke/modell
// 2. Kilometerstands-reduksjon  
// 3. Tilstands-justering
function calculateBasicEstimate(carData: CarData): PriceEstimation {
  // Eksempel formel
  const baseValue = getBaseValueByYearAndModel(carData.year, carData.make, carData.model)
  const mileageDeduction = calculateMileageDeduction(carData.mileage, carData.year)
  const conditionMultiplier = getConditionMultiplier(carData.condition)
  
  const estimated = (baseValue - mileageDeduction) * conditionMultiplier
  const margin = estimated * 0.15 // ±15% usikkerhet
  
  return {
    estimatedPrice: estimated,
    priceRange: {
      min: estimated - margin,
      max: estimated + margin
    },
    confidence: 'MEDIUM',
    method: 'MANUAL_ADMIN'
  }
}
```

---

### **🔍 Fase 2: Automatisk markedsanalyse (2-3 uker)**

#### **Web scraping av konkurrenter:**
```typescript
// Hent sammenlignbare biler fra markedet
async function getMarketComparisons(carData: CarData): Promise<MarketComparison[]> {
  const sources = [
    'finn.no',
    'bilbasen.no', 
    'motor.no'
  ]
  
  const comparisons = []
  
  for (const source of sources) {
    const similarCars = await scrapeCarPrices(source, {
      make: carData.make,
      model: carData.model,
      yearRange: [carData.year - 2, carData.year + 2],
      mileageRange: [carData.mileage - 30000, carData.mileage + 30000]
    })
    
    comparisons.push(...similarCars)
  }
  
  return calculatePriceStatistics(comparisons)
}
```

#### **Automatisk oppdatering:**
- **Daglig jobb:** Oppdater markedspriser for populære bilmodeller
- **On-demand:** Hent ferske data når bruker lager auksjon
- **Cache:** Lagre resultater for å redusere scraping

---

### **🤖 Fase 3: Machine Learning (3-4 uker)**

#### **Treningsdata:**
```typescript
// Samle data fra egne auksjoner og eksterne kilder
interface TrainingData {
  // Input features
  make: string
  model: string
  year: number
  mileage: number
  fuelType: string
  transmission: string
  condition: string
  location: string
  seasonality: number // Måned på året
  
  // Target variable
  finalSalePrice: number
  
  // Metadata
  auctionDate: Date
  numberOfBids: number
  saleTime: number // Timer til salg
}
```

#### **ML-modell:**
```python
# Bruke Python/scikit-learn eller TensorFlow
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

# Feature engineering
features = [
    'make_encoded', 'model_encoded', 'year', 
    'mileage', 'condition_score', 'age_years',
    'market_trend', 'seasonal_factor'
]

# Tren modell
model = RandomForestRegressor(n_estimators=100)
model.fit(X_train, y_train)

# Prediker pris
predicted_price = model.predict(new_car_features)
confidence_interval = calculate_prediction_interval(model, new_car_features)
```

---

### **🌐 Fase 4: Ekstern API-integrasjon (2-3 uker)**

#### **Kommersielle tjenester:**
```typescript
// Integrasjon med profesjonelle tjenester
interface ExternalPriceAPI {
  provider: 'eurotax' | 'schwacke' | 'motor_no' | 'bilbasen_pro'
  
  async getPriceEstimate(vin: string, mileage: number): Promise<{
    estimate: number
    confidence: number
    lastUpdated: Date
  }>
}

// Fallback-strategi
async function getBestPriceEstimate(carData: CarData): Promise<PriceEstimation> {
  try {
    // 1. Prøv ekstern API først
    return await externalAPI.getPriceEstimate(carData.vin, carData.mileage)
  } catch (error) {
    // 2. Fall tilbake til ML-modell
    return await mlModel.predict(carData)
  } catch (error) {
    // 3. Fall tilbake til markedsanalyse
    return await marketAnalysis.estimate(carData)
  } catch (error) {
    // 4. Siste utvei: grunnleggende beregning
    return calculateBasicEstimate(carData)
  }
}
```

---

## 🛠️ Implementering i Kulbruk

### **Database-utvidelse:**
```typescript
model Listing {
  // ... eksisterende felt
  
  // Legg til prisestimering
  priceEstimation PriceEstimation?
  suggestedPrice  Float?           // Systemets forslag
  reservePrice    Float?           // Brukers minstepris
}
```

### **API endpoints:**
```typescript
// POST /api/listings/estimate-price
async function estimatePrice(req: NextRequest) {
  const { registrationNumber, mileage, condition } = await req.json()
  
  // 1. Hent bildata fra Vegvesen
  const carData = await getCarDataFromVegvesen(registrationNumber)
  
  // 2. Beregn prisestimering
  const estimation = await calculatePriceEstimation({
    ...carData,
    mileage,
    condition
  })
  
  return NextResponse.json(estimation)
}
```

### **Frontend-integrasjon:**
```typescript
// I opprett-annonse-skjema
function CarAuctionForm() {
  const [priceEstimate, setPriceEstimate] = useState(null)
  
  const handleRegNumberChange = async (regNumber: string) => {
    if (regNumber.length === 7) {
      const estimate = await fetch('/api/listings/estimate-price', {
        method: 'POST',
        body: JSON.stringify({ 
          registrationNumber: regNumber,
          mileage: formData.mileage,
          condition: formData.condition 
        })
      })
      
      setPriceEstimate(await estimate.json())
    }
  }
  
  return (
    <div>
      {priceEstimate && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3>💰 Prisestimering</h3>
          <p>Estimert verdi: {priceEstimate.estimatedPrice.toLocaleString()} kr</p>
          <p>Prisintervall: {priceEstimate.priceRange.min.toLocaleString()} - {priceEstimate.priceRange.max.toLocaleString()} kr</p>
          <p className="text-sm text-gray-600">
            Basert på: {priceEstimate.method} (Sikkerhet: {priceEstimate.confidence})
          </p>
        </div>
      )}
    </div>
  )
}
```

---

## 💡 Startstrategi

### **Umiddelbar implementering (neste 1-2 uker):**

1. **Vegvesen API-integrasjon:** Hent tekniske data
2. **Grunnleggende prisberegning:** Admin-definerte basisverdier
3. **Manual override:** Admin kan justere estimater
4. **Enkel UI:** Vis prisestimering i opprett-annonse

### **Kort sikt (1-2 måneder):**
- Markedsanalyse fra Finn.no/Bilbasen
- Automatisk oppdatering av basisverdier
- Forbedret algoritme basert på faktiske salg

### **Lang sikt (3-6 måneder):**
- Machine learning-modell
- Ekstern API-integrasjon
- Real-time markedsdata

---

## 🎯 Fordeler med denne tilnærmingen

✅ **Starter enkelt** - Fungerer fra dag 1  
✅ **Skalerbar** - Kan forbedres gradvis  
✅ **Kostnadseffektiv** - Unngår dyre lisenser til å begynne med  
✅ **Norsk-tilpasset** - Bruker norske kilder  
✅ **Fallback** - Alltid en løsning som fungerer  

---

**Vil du starte med Fase 1 og grunnleggende prisestimering? 🚀**