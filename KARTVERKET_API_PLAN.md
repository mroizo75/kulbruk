# 🏛️ Kartverket API-integrasjon for Kulbruk.no

**Versjon:** 1.0  
**Dato:** 16. august 2025  
**Status:** Planlegging - Venter på API-tilgang fra Kartverket

---

## 📋 **Oversikt**

Implementering av Kartverket API for automatisk utfylling av eiendomsdata i Kulbruk.no. Dette vil gi eiendomsmeglere mulighet til å raskt og nøyaktig fylle ut annonser basert på offisielle matrikkeldata.

### **Konkurransefortrinn**
- ⚡ **Raskere annonsering** - fra minutter til sekunder
- ✅ **Høyere datakvalitet** - offisielle kilder vs manuell inntasting  
- 🏆 **Meglervennlig** - profesjonelt verktøy som konkurrerer med Finn.no
- 📈 **Økt konvertering** - enklere onboarding av eiendomsmeglere

---

## 🎯 **Fase 1: API-tilgang og forberedelser**

### **1.1 Kartverket API-søknad**
- [x] **Identifiser databehov** - Matrikkeldata, bygningsdata, eierinformasjon
- [x] **Utarbeid forretningsbegrunnelse** - Automatisert annonseoppretting
- [x] **Definer målgrupper** - Eiendomsmeglere, kjøpere, private selgere
- [x] **Spesifiser teknisk løsning** - REST API, caching, feilhåndtering
- [ ] **Send inn API-søknad** til Kartverket
- [ ] **Følg opp søknad** og svar på tilleggsspørsmål
- [ ] **Motta API-nøkkel** og teknisk dokumentasjon

### **1.2 Teknisk arkitektur (parallellarbeid)**
- [ ] **PropertySpec database-modell** - Prisma schema utvidelse
- [ ] **API endpoint-struktur** - `/api/kartverket/*` ruter
- [ ] **Feilhåndtering og logging** - Robust error handling
- [ ] **Caching-strategi** - Redis/Memory cache for ytelse
- [ ] **Rate limiting** - API-kall begrensninger

### **1.3 Sikkerhet og compliance**
- [ ] **GDPR-vurdering** - Håndtering av eierdata
- [ ] **Autorisering** - Kun eiendomsmeglere får tilgang
- [ ] **Audit logging** - Sporing av alle API-kall
- [ ] **Data retention policy** - Hvor lenge lagres data

---

## 🏗️ **Fase 2: Database og modeller**

### **2.1 PropertySpec-modell**

**Ny Prisma-modell for eiendomsdata:**

```prisma
model PropertySpec {
  id            String   @id @default(cuid())
  listingId     String   @unique
  
  // Matrikkeldata fra Kartverket
  municipalityNumber String?  // 301 (Oslo)
  propertyNumber     String?  // 229 (gårdsnr)
  leaseNumber        String?  // 107 (bruksnr)
  unitNumber         String?  // Seksjonsnummer
  matrikkelId        String?  // Unik matrikkel-ID
  
  // Grunnleggende eiendomsinfo
  propertyType       String?  // Leilighet, Enebolig, Rekkehus
  ownershipType      String?  // Aksje, Selveier, Borettslag, Andel
  buildingYear       Int?     // Byggeår
  condition          String?  // Tilstand (A-E)
  
  // Offisiell adresse fra Kartverket
  officialAddress    String?  // Komplett adresse
  streetName         String?  // Gatenavn
  houseNumber        String?  // Husnummer
  postalCode         String?  // Postnummer
  city               String?  // Poststed
  
  // Areal (m²) - fra matrikkeldata
  propertyArea       Int?     // Totalt eiendomsareal
  usableAreaInternal Int?     // BRA-i (bruksareal internt)
  usableAreaExternal Int?     // BRA-e (bruksareal eksternt) 
  totalUsableArea    Int?     // Total BRA
  builtArea          Int?     // Bebygd areal
  balconyTerraceArea Int?     // TBA (terrasse/balkong areal)
  plotSize           Int?     // Tomteareal
  
  // Rom og layout
  rooms              Int?     // Antall rom
  bedrooms           Int?     // Antall soverom
  bathrooms          Int?     // Antall bad
  floor              String?  // Etasje (eks. "5", "U1", "1-2")
  totalFloors        Int?     // Antall etasjer i bygget
  
  // Energi og teknisk
  energyRating       String?  // A-G energimerking
  heatingType        String?  // Fjernvarme, Elektrisk, Varmepumpe
  ventilationType    String?  // Naturlig, Balansert, Avtrekk
  
  // Fellesskap (borettslag/sameie)
  housingAssociation String?  // Navn på borettslag/sameie
  organizationNumber String?  // Organisasjonsnummer
  monthlyFee         Decimal? @db.Decimal(10, 2) // Felleskost kr/mnd
  sharedDebt         Decimal? @db.Decimal(10, 2) // Fellesgjeld kr
  sharedAssets       Decimal? @db.Decimal(10, 2) // Fellesformue kr
  
  // Bygningsdetaljer
  buildingMaterial   String?  // Tre, Betong, Mur, etc.
  roofType           String?  // Skifer, Tegl, Blikk, etc.
  foundationType     String?  // Betong, Naturstein, etc.
  
  // Utstyr og fasiliteter
  hasBalcony         Boolean? @default(false)
  hasTerrace         Boolean? @default(false)
  hasGarden          Boolean? @default(false)
  hasElevator        Boolean? @default(false)
  hasParking         Boolean? @default(false)
  parkingType        String?  // Garasje, Carport, Gateparkering
  hasBasement        Boolean? @default(false)
  hasAttic           Boolean? @default(false)
  petsAllowed        Boolean? @default(true)
  smokingAllowed     Boolean? @default(false)
  
  // Geografiske data
  latitude           Float?   // Breddegrad (WGS84)
  longitude          Float?   // Lengdegrad (WGS84)
  propertyBoundary   Json?    // GeoJSON polygon av eiendomsgrenser
  
  // Eierforhold (kun for verifisering)
  registeredOwner    String?  // Registrert eier (for salgsverifisering)
  ownershipForm      String?  // Selveier, Aksje, Andel, etc.
  
  // Metadata
  kartverketUpdated  DateTime? // Når data sist ble hentet fra Kartverket
  dataQuality        String?   // A-E kvalitetsvurdering
  verificationStatus String?   // VERIFIED, PENDING, FAILED
  
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  listing            Listing   @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@map("property_specs")
}
```

### **2.2 ✅ OPPDATERT: Massiv PropertySpec (150+ felt)**

**PropertySpec-modellen er nå utvidet til å dekke:**

**🏠 Alle eiendomstyper:**
- Boliger (leilighet, enebolig, rekkehus, villa, penthouse, hybel)
- Fritidsboliger (hytte, sommerhus, chalet, feriebolig)
- Spesialboliger (bofellesskap, studentbolig, seniorbolig) 
- Næringseiendom (kontor, butikk, lager, industri, hotell)
- Tomter (boligtomt, næringstomt, landbruk, skog)

**🌍 Internasjonale eiendomsmeglere:**
- Utenlandske adresser (foreignAddress, foreignCountry, foreignRegion)
- Valutastøtte (foreignCurrency: EUR, USD, SEK)
- Oversettelser (translatedTitle, translatedDesc)

**🏠 Salg vs Utleie (PropertyPurpose):**
- SALE (til salgs)
- RENT (til leie) 
- BOTH (både salg og leie)

**💰 Utleie-spesifikke felt:**
- rentalPrice (månedlig leie)
- deposit (depositum)
- availableFrom (tilgjengelig fra dato)
- furnished (møblert/umøblert)
- shortTermRental (korttidsutleie)
- utilitiesIncluded (inkluderte tjenester)

**🏘️ Bofellesskap-støtte:**
- sharedLiving, privateRoom, sharedKitchen, sharedBathroom
- Perfekt for studenter og unge profesjonelle

### **2.3 Abonnementspriser implementert**
```prisma
enum SubscriptionPlan {
  PRIVATE_RENTAL    // 99 kr/mnd - privatpersoner utleie
  BUSINESS_BASIC    // 499 kr/mnd - 5 annonser (meglere)
  BUSINESS_STANDARD // 990 kr/mnd - 10 annonser
  BUSINESS_PREMIUM  // 1990 kr/mnd - 50 annonser
}
```

### **2.4 Database-migrasjon**
```bash
# PropertySpec og nye enums er klare
npx prisma db push
npx prisma generate
```

---

## 🔧 **Fase 3: API-implementasjon**

### **3.1 Kartverket API endpoint**

**Filstruktur:**
```
/api/
  /kartverket/
    /property/route.ts        # Hent eiendomsdata
    /search/route.ts          # Søk i matrikkel
    /validate/route.ts        # Valider matrikkel-ID
```

**Hovedendpoint: `/api/kartverket/property`**

```typescript
// /api/kartverket/property/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const municipalityNumber = searchParams.get('municipalityNumber')
    const propertyNumber = searchParams.get('propertyNumber') 
    const leaseNumber = searchParams.get('leaseNumber')
    
    if (!municipalityNumber || !propertyNumber || !leaseNumber) {
      return NextResponse.json(
        { error: 'Kommunenr, gårdsnr og bruksnr påkrevd' },
        { status: 400 }
      )
    }
    
    // Kall Kartverket Matrikkelen API
    const kartverketApiKey = process.env.KARTVERKET_API_KEY
    const kartverketUrl = `https://api.kartverket.no/grunndata/v1/matrikkel/...`
    
    const response = await fetch(kartverketUrl, {
      headers: {
        'Authorization': `Bearer ${kartverketApiKey}`,
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Kartverket API feil: ${response.status}`)
    }
    
    const rawData = await response.json()
    
    // Mapper Kartverket data til vårt format
    const mappedData = {
      municipalityNumber,
      propertyNumber, 
      leaseNumber,
      officialAddress: rawData.adresse?.adressenavn,
      propertyArea: rawData.areal?.samletAreal,
      buildingYear: rawData.bygning?.byggeaar,
      propertyType: rawData.bygning?.bygningstype,
      // ... mapping av alle relevante felt
    }
    
    return NextResponse.json({
      success: true,
      propertyData: mappedData,
      message: 'Eiendomsdata hentet fra Kartverket'
    })
    
  } catch (error) {
    console.error('Kartverket API feil:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente eiendomsdata' },
      { status: 500 }
    )
  }
}
```

### **3.2 Cache-implementasjon**

**Cache-strategi:**
- **TTL:** 24 timer for eiendomsdata (endrer sjelden)
- **Storage:** Redis eller in-memory cache
- **Cache key:** `kartverket:${municipalityNumber}:${propertyNumber}:${leaseNumber}`

```typescript
// /lib/kartverket-cache.ts
import { cache } from '@/lib/redis' // eller memory cache

export async function getCachedPropertyData(key: string) {
  return await cache.get(`kartverket:${key}`)
}

export async function setCachedPropertyData(key: string, data: any) {
  await cache.setex(`kartverket:${key}`, 86400, JSON.stringify(data)) // 24h
}
```

### **3.3 Rate limiting**
```typescript
// Rate limit: 100 requests/hour per user
import { rateLimit } from '@/lib/rate-limit'

const kartverketLimiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
})

export async function GET(request: NextRequest) {
  try {
    await kartverketLimiter.check(request, 100, 'KARTVERKET_API')
    // ... API logic
  } catch {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
}
```

---

## 🎨 **Fase 4: Frontend-komponenter**

### **4.1 PropertyInfoForm-komponent**

```typescript
// /components/property-info-form.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface PropertyInfoFormProps {
  onPropertyDataChange: (data: any) => void
  defaultValues?: any
}

export default function PropertyInfoForm({ 
  onPropertyDataChange, 
  defaultValues = {} 
}: PropertyInfoFormProps) {
  const [isLoadingProperty, setIsLoadingProperty] = useState(false)
  const [propertyData, setPropertyData] = useState(defaultValues)
  
  const handleFetchPropertyData = async () => {
    const { municipalityNumber, propertyNumber, leaseNumber } = propertyData
    
    if (!municipalityNumber || !propertyNumber || !leaseNumber) {
      toast.error('Vennligst fyll inn kommunenr, gårdsnr og bruksnr')
      return
    }
    
    setIsLoadingProperty(true)
    
    try {
      const response = await fetch(
        `/api/kartverket/property?municipalityNumber=${municipalityNumber}&propertyNumber=${propertyNumber}&leaseNumber=${leaseNumber}`
      )
      
      if (response.ok) {
        const data = await response.json()
        setPropertyData(prev => ({ ...prev, ...data.propertyData }))
        onPropertyDataChange({ ...propertyData, ...data.propertyData })
        toast.success('Eiendomsdata hentet fra Kartverket!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Kunne ikke hente eiendomsdata')
      }
    } catch (error) {
      toast.error('Feil ved henting av eiendomsdata')
    } finally {
      setIsLoadingProperty(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-3">
          📍 Hent eiendomsdata fra Kartverket
        </h3>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="municipalityNumber">Kommunenr</Label>
            <Input
              id="municipalityNumber"
              value={propertyData.municipalityNumber || ''}
              onChange={(e) => setPropertyData(prev => ({
                ...prev, 
                municipalityNumber: e.target.value
              }))}
              placeholder="301"
            />
          </div>
          
          <div>
            <Label htmlFor="propertyNumber">Gårdsnr</Label>
            <Input
              id="propertyNumber"
              value={propertyData.propertyNumber || ''}
              onChange={(e) => setPropertyData(prev => ({
                ...prev,
                propertyNumber: e.target.value
              }))}
              placeholder="229"
            />
          </div>
          
          <div>
            <Label htmlFor="leaseNumber">Bruksnr</Label>
            <Input
              id="leaseNumber"
              value={propertyData.leaseNumber || ''}
              onChange={(e) => setPropertyData(prev => ({
                ...prev,
                leaseNumber: e.target.value
              }))}
              placeholder="107"
            />
          </div>
        </div>
        
        <Button 
          onClick={handleFetchPropertyData}
          disabled={isLoadingProperty}
          className="w-full"
        >
          {isLoadingProperty ? 'Henter data...' : '🏛️ Hent fra Kartverket'}
        </Button>
      </div>
      
      {/* Resten av eiendomsskjemaet - auto-fylles etter API-kall */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="propertyType">Eiendomstype</Label>
          <Input
            id="propertyType"
            value={propertyData.propertyType || ''}
            onChange={(e) => setPropertyData(prev => ({
              ...prev,
              propertyType: e.target.value
            }))}
            placeholder="Leilighet"
          />
        </div>
        
        <div>
          <Label htmlFor="buildingYear">Byggeår</Label>
          <Input
            id="buildingYear"
            type="number"
            value={propertyData.buildingYear || ''}
            onChange={(e) => setPropertyData(prev => ({
              ...prev,
              buildingYear: parseInt(e.target.value)
            }))}
            placeholder="1940"
          />
        </div>
        
        {/* ... flere felt basert på PropertySpec-modellen */}
      </div>
    </div>
  )
}
```

### **4.2 Integrasjon i CreateListingForm**

```typescript
// Oppdater /components/create-listing-form.tsx
import PropertyInfoForm from '@/components/property-info-form'

export default function CreateListingForm() {
  const [showPropertyFields, setShowPropertyFields] = useState(false)
  const [propertyData, setPropertyData] = useState<any>(null)
  
  const handleCategoryChange = (value: string) => {
    setValue('category', value)
    
    if (value === 'eiendom') {
      setShowPropertyFields(true)
    } else {
      setShowPropertyFields(false)
      setPropertyData(null)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ... eksisterende felt */}
      
      {showPropertyFields && (
        <PropertyInfoForm
          onPropertyDataChange={setPropertyData}
          defaultValues={propertyData}
        />
      )}
      
      {/* ... resten av skjemaet */}
    </form>
  )
}
```

### **4.3 Eiendomsvisning i detaljside**

```typescript
// /components/property-specifications.tsx
interface PropertySpecProps {
  propertySpec: any
}

export default function PropertySpecifications({ propertySpec }: PropertySpecProps) {
  if (!propertySpec) return null
  
  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">🏠 Eiendomsinformasjon</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-600">Eiendomstype</div>
          <div className="font-medium">{propertySpec.propertyType}</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-600">Byggeår</div>
          <div className="font-medium">{propertySpec.buildingYear}</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-600">Bruksareal</div>
          <div className="font-medium">{propertySpec.totalUsableArea} m²</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-600">Rom/Soverom</div>
          <div className="font-medium">{propertySpec.rooms}/{propertySpec.bedrooms}</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-600">Energimerking</div>
          <div className="font-medium">{propertySpec.energyRating}</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-600">Etasje</div>
          <div className="font-medium">{propertySpec.floor}</div>
        </div>
      </div>
      
      {propertySpec.monthlyFee && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium mb-2">💰 Felleskostnader</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Felleskost/mnd:</span>
              <span className="font-medium ml-2">{propertySpec.monthlyFee.toLocaleString()} kr</span>
            </div>
            <div>
              <span className="text-gray-600">Fellesgjeld:</span>
              <span className="font-medium ml-2">{propertySpec.sharedDebt?.toLocaleString()} kr</span>
            </div>
            <div>
              <span className="text-gray-600">Fellesformue:</span>
              <span className="font-medium ml-2">{propertySpec.sharedAssets?.toLocaleString()} kr</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t">
        <div className="text-xs text-gray-500 flex items-center">
          🏛️ Eiendomsdata hentet fra Kartverket
          {propertySpec.kartverketUpdated && (
            <span className="ml-2">
              (Oppdatert: {new Date(propertySpec.kartverketUpdated).toLocaleDateString('no-NO')})
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## 🔍 **Fase 5: Søk og filtrering**

### **5.1 Eiendomsspesifikke filtre**

```typescript
// /components/property-filters.tsx
export default function PropertyFilters() {
  return (
    <div className="space-y-4">
      <div>
        <Label>Rom</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Velg antall rom" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1+">1+ rom</SelectItem>
            <SelectItem value="2+">2+ rom</SelectItem>
            <SelectItem value="3+">3+ rom</SelectItem>
            <SelectItem value="4+">4+ rom</SelectItem>
            <SelectItem value="5+">5+ rom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Soverom</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Velg antall soverom" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1+">1+ soverom</SelectItem>
            <SelectItem value="2+">2+ soverom</SelectItem>
            <SelectItem value="3+">3+ soverom</SelectItem>
            <SelectItem value="4+">4+ soverom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Bruksareal (m²)</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Velg areal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-50">0-50 m²</SelectItem>
            <SelectItem value="50-75">50-75 m²</SelectItem>
            <SelectItem value="75-100">75-100 m²</SelectItem>
            <SelectItem value="100-150">100-150 m²</SelectItem>
            <SelectItem value="150+">150+ m²</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Eieform</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Velg eieform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="selveier">Selveier</SelectItem>
            <SelectItem value="aksje">Aksje</SelectItem>
            <SelectItem value="borettslag">Borettslag</SelectItem>
            <SelectItem value="andel">Andel</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Energimerking</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Velg energimerking" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">A - Mørkegrønn</SelectItem>
            <SelectItem value="B">B - Grønn</SelectItem>
            <SelectItem value="C">C - Lysegrønn</SelectItem>
            <SelectItem value="D">D - Gul</SelectItem>
            <SelectItem value="E">E - Oransje</SelectItem>
            <SelectItem value="F">F - Rød</SelectItem>
            <SelectItem value="G">G - Mørk rød</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox id="hasBalcony" />
        <Label htmlFor="hasBalcony">Balkong/Terrasse</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox id="hasElevator" />
        <Label htmlFor="hasElevator">Heis</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox id="hasParking" />
        <Label htmlFor="hasParking">Parkering</Label>
      </div>
    </div>
  )
}
```

### **5.2 Oppdatert søke-API**

```typescript
// Oppdater /api/annonser/list/route.ts med eiendomsfiltre
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Eksisterende filtre
  const category = searchParams.get('category')
  const location = searchParams.get('location')
  const priceMin = searchParams.get('priceMin')
  const priceMax = searchParams.get('priceMax')
  
  // Nye eiendomsfiltre
  const rooms = searchParams.get('rooms')
  const bedrooms = searchParams.get('bedrooms')
  const areaMin = searchParams.get('areaMin')
  const areaMax = searchParams.get('areaMax')
  const ownershipType = searchParams.get('ownershipType')
  const energyRating = searchParams.get('energyRating')
  const hasBalcony = searchParams.get('hasBalcony')
  const hasElevator = searchParams.get('hasElevator')
  const hasParking = searchParams.get('hasParking')
  
  const where: any = {
    status: 'APPROVED',
    isActive: true,
  }
  
  // Eiendomsspesifikke where-conditions
  if (category === 'eiendom') {
    const propertyWhere: any = {}
    
    if (rooms) {
      propertyWhere.rooms = { gte: parseInt(rooms.replace('+', '')) }
    }
    
    if (bedrooms) {
      propertyWhere.bedrooms = { gte: parseInt(bedrooms.replace('+', '')) }
    }
    
    if (areaMin || areaMax) {
      propertyWhere.totalUsableArea = {}
      if (areaMin) propertyWhere.totalUsableArea.gte = parseInt(areaMin)
      if (areaMax) propertyWhere.totalUsableArea.lte = parseInt(areaMax)
    }
    
    if (ownershipType) {
      propertyWhere.ownershipType = ownershipType
    }
    
    if (energyRating) {
      propertyWhere.energyRating = energyRating
    }
    
    if (hasBalcony === 'true') {
      propertyWhere.hasBalcony = true
    }
    
    if (hasElevator === 'true') {
      propertyWhere.hasElevator = true
    }
    
    if (hasParking === 'true') {
      propertyWhere.hasParking = true
    }
    
    if (Object.keys(propertyWhere).length > 0) {
      where.propertySpec = propertyWhere
    }
  }
  
  // ... resten av søkelogikken
}
```

---

## 📊 **Fase 6: Testing og kvalitetssikring**

### **6.1 API-testing**
- [ ] **Unit tests** for Kartverket API-wrapper
- [ ] **Integration tests** for database-lagring
- [ ] **Performance tests** med cache og rate limiting
- [ ] **Error handling tests** for API-utilgjengelighet

### **6.2 Frontend-testing**
- [ ] **Component tests** for PropertyInfoForm
- [ ] **E2E tests** for fullstending eiendomsannonsering
- [ ] **Responsivitet** på mobile enheter
- [ ] **Accessibility** (WCAG 2.1)

### **6.3 Data-validering**
- [ ] **Sammenlign** Kartverket-data med kjente eiendommer
- [ ] **Verifiser** adresser og koordinater
- [ ] **Test** edge cases (seksjonerte eiendommer, etc.)

---

## 🚀 **Fase 7: Deployment og overvåking**

### **7.1 Environment-variabler**
```env
# .env.local / .env.production
KARTVERKET_API_KEY=your_api_key_here
KARTVERKET_API_URL=https://api.kartverket.no/grunndata/v1
KARTVERKET_CACHE_TTL=86400
KARTVERKET_RATE_LIMIT=100
```

### **7.2 Overvåking og logging**
- [ ] **API-responstider** monitoring
- [ ] **Error rates** og fail rates tracking  
- [ ] **API quota** overvåking
- [ ] **Data quality** metrics
- [ ] **User adoption** av eiendomsannonser

### **7.3 Dokumentasjon**
- [ ] **API-dokumentasjon** for utviklere
- [ ] **Brukerguide** for eiendomsmeglere
- [ ] **Troubleshooting** guide
- [ ] **Change log** for API-oppdateringer

---

## 📈 **Fase 8: Forbedringer og utvidelser**

### **8.1 Avanserte funksjoner**
- [ ] **AI-drevet prisestimering** basert på Kartverket + markedsdata
- [ ] **Interaktiv eiendomskart** med grensemarkeringer
- [ ] **Sammenligningstjeneste** for lignende eiendommer
- [ ] **Historisk prisutvikling** for område

### **8.2 Integrasjoner**
- [ ] **SSB (Statistisk Sentralbyrå)** for demografiske data
- [ ] **Grunnbok** API for tinglyste heftelser (hvis tilgjengelig)
- [ ] **Energimerking** database for detaljerte energidata
- [ ] **Google Maps** / **Mapbox** for avansert kartvisning

### **8.3 Business intelligence**
- [ ] **Popularitetsstatistikk** for eiendomstyper/områder
- [ ] **Konverteringsanalyse** fra søk til kontakt
- [ ] **Megler-dashboard** med salgsstatistikk
- [ ] **Markedsrapporter** for administratorer

---

## ⚠️ **Risikofaktorer og mitigering**

### **Tekniske risikoer**
- **API-utilgjengelighet** → Robust caching og fallback
- **Rate limiting** → Smart request batching
- **Data-endringer** → Versjonshåndtering av API

### **Forretningsrisikoer**  
- **API-kostnader** → Budgettering og volume-overvåking
- **Data-kvalitet** → Validering og bruker-feedback
- **Konkurransereaksjon** → Kontinuerlig innovasjon

### **Juridiske risikoer**
- **GDPR compliance** → Data minimization og consent
- **API-vilkår endringer** → Regelmessig gjennomgang
- **Eiendomsrett** → Kun offentlig tilgjengelig data

---

## 📅 **Tidsplan**

| Fase | Aktivitet | Estimert tid | Avhengigheter |
|------|-----------|--------------|---------------|
| **1** | API-søknad til Kartverket | 2-4 uker | Forretningsdokumentasjon |
| **2** | Database-modell | 1 uke | - |
| **3** | API-implementasjon | 2 uker | Kartverket API-tilgang |
| **4** | Frontend-komponenter | 2 uker | Database ferdig |
| **5** | Søk og filtrering | 1 uke | Frontend komponenter |
| **6** | Testing og QA | 1 uke | All kode ferdig |
| **7** | Deployment | 1 uke | Testing fullført |
| **8** | Forbedringer | Kontinuerlig | Bruker-feedback |

**Total estimert tid: 8-12 uker** (avhengig av Kartverket responstid)

---

## 🎯 **Suksessmålinger**

### **KPIer - Kort sikt (3 måneder)**
- **API-responstid** < 2 sekunder
- **Data-nøyaktighet** > 95%
- **Eiendomsmegler-adopsjon** 20+ aktive brukere
- **Eiendomsannonser** 100+ med Kartverket-data

### **KPIer - Lang sikt (6-12 måneder)**  
- **Markedsandel** 5% av eiendomsannonser i Norge
- **Megler-tilfredshet** > 4.5/5 score
- **API-oppetid** > 99.5%
- **Konverteringsrate** søk → kontakt > 15%

---

## 📞 **Kontaktinformasjon**

**Prosjektansvarlig:** [Navn]  
**Teknisk lead:** [Navn]  
**Kartverket kontakt:** [API-support kontakt]

**GitHub repo:** https://github.com/[org]/kulbruk  
**Dokumentasjon:** https://docs.kulbruk.no/kartverket-api

---

*Denne planen vil bli oppdatert ettersom vi mottar tilgang til Kartverket API og samler erfaringer fra implementasjonen.*

**Neste steg:** Send inn API-søknad til Kartverket med forretningsbegrunnelse og tekniske spesifikasjoner. 🏛️🚀
