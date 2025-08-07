# 🏆 Auksjon/Bud-system Plan
## Inspirert av Nettbil.no og Carwow.co.uk

---

## 📋 Systemarkitektur

### **🔄 Prosessflyt (som Nettbil):**

1. **Privat bruker** legger ut produkt (bil, møbler, etc.)
2. **System** setter opp "budrunde" (24-48 timer)
3. **Forhandlere** ser produkter i sitt dashboard
4. **Forhandlere** legger inn bud (skjult for andre)
5. **Budrunde** avsluttes → høyeste bud vinner
6. **Privat bruker** godtar/avslår høyeste bud
7. **System** håndterer salg og betaling

---

## 🏢 Forhandler/Dealer-system

### **Registrering som forhandler:**
```typescript
// Utvidet User schema
model User {
  // ... eksisterende felt
  
  // Forhandler-spesifikke felt
  dealerProfile   DealerProfile?
  subscription    Subscription?
  bids           Bid[]
}

model DealerProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  
  // Bedriftsinfo
  companyName     String
  orgNumber       String   @unique
  address         String
  city            String
  postalCode      String
  website         String?
  logo            String?
  
  // Forhandler-spesifikk
  dealerLicense   String   // Forhandlerlisens
  specialties     String[] // Bil, møbler, elektronikk
  verified        Boolean  @default(false)
  rating          Float    @default(0)
  totalSales      Int      @default(0)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### **Abonnement-nivåer:**
```typescript
model Subscription {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  
  plan            SubscriptionPlan
  status          SubscriptionStatus
  
  // Stripe info
  stripeCustomerId      String?
  stripeSubscriptionId  String?
  stripePriceId         String?
  
  // Begrensninger
  maxBidsPerMonth       Int
  maxActiveListings     Int
  canViewContactInfo    Boolean
  priorityAccess        Boolean
  
  currentPeriodStart    DateTime
  currentPeriodEnd      DateTime
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum SubscriptionPlan {
  BASIC     // 299 kr/mnd - 10 bud, grunnleggende
  PREMIUM   // 799 kr/mnd - 50 bud, prioritet
  PRO       // 1999 kr/mnd - ubegrenset, kontaktinfo
}

enum SubscriptionStatus {
  ACTIVE
  INACTIVE
  PAST_DUE
  CANCELED
}
```

---

## 🏆 Bud/Auksjon-system

### **Database struktur:**
```typescript
model Listing {
  // ... eksisterende felt
  
  // Auksjon-spesifikke felt
  listingType     ListingType @default(FIXED_PRICE)
  auction         Auction?
  bids           Bid[]
}

model Auction {
  id              String   @id @default(cuid())
  listingId       String   @unique
  listing         Listing  @relation(fields: [listingId], references: [id])
  
  startTime       DateTime @default(now())
  endTime         DateTime
  reservePrice    Float?   // Minste pris selger godtar
  currentHighBid  Float?
  
  status          AuctionStatus @default(PENDING)
  
  bids           Bid[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Bid {
  id              String   @id @default(cuid())
  
  auctionId       String
  auction         Auction  @relation(fields: [auctionId], references: [id])
  
  bidderId        String
  bidder          User     @relation(fields: [bidderId], references: [id])
  
  amount          Float
  message         String?  // Kommentar fra forhandler
  
  status          BidStatus @default(ACTIVE)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([auctionId, amount])
}

enum ListingType {
  FIXED_PRICE  // Normal annonse
  AUCTION      // Budrunde
}

enum AuctionStatus {
  PENDING      // Venter på godkjenning
  ACTIVE       // Pågående budrunde
  ENDED        // Avsluttet, venter på selger
  SOLD         // Solgt
  CANCELLED    // Avbrutt
}

enum BidStatus {
  ACTIVE       // Gyldig bud
  WITHDRAWN    // Trukket tilbake
  REJECTED     // Avvist av system
}
```

---

## 🎯 Forhandler Dashboard Features

### **Tilgjengelige produkter:**
- Liste over produkter i budrunde
- Filtrer etter kategori, prisklasse, lokasjon
- Sorter etter tid igjen, antall bud

### **Budopplevelse:**
- Klikk på produkt → se detaljer
- Legg inn bud (validering mot abonnement)
- Se egne bud-historikk
- Real-time oppdateringer

### **Salgshistorikk:**
- Vunne auksjoner
- Kjøp-statistikk
- Kundevurderinger

---

## 💰 Betaling & Provisjon

### **Inntektsmodell (som Nettbil):**
1. **Abonnement fra forhandlere:** 299-1999 kr/mnd
2. **Provisjon ved salg:** 5-15% av salgspris
3. **Premium oppheving:** Ekstra for fremheving

### **Stripe integrasjon:**
- Abonnement-billing
- Provisjonshåndtering
- Utbetaling til selgere (minus provisjon)

---

## 🚀 Implementeringsplan

### **Fase 1: Grunnleggende auksjon (2-3 uker)**
1. ✅ Database schema utvidelse
2. ⏳ Forhandler-registrering
3. ⏳ Grunnleggende budsystem
4. ⏳ Auction API endpoints

### **Fase 2: Betaling & abonnement (2-3 uker)**
1. Stripe subscription setup
2. Abonnement-dashboard
3. Betalingshåndtering
4. Provisjonssystem

### **Fase 3: Avanserte features (2-4 uker)**
1. Real-time bud-oppdateringer
2. Automatiserte e-poster
3. Forhandler-verification
4. Rapporter og analytics

### **Fase 4: Optimalisering**
1. Performance tuning
2. Mobile app considerations
3. Advanced filtering
4. AI-basert anbefaling

---

## 🎯 Neste steg

**Umiddelbart (denne uken):**
1. **Utvide database schema** med auksjon/bud-tabeller
2. **Forhandler-registrering** flow
3. **Grunnleggende auction API**

**Følgende uke:**
1. **Stripe abonnement** setup
2. **Bud-interface** i forhandler dashboard
3. **Testing** av budsystem

Ønsker du å starte med database-utvidelsen og forhandler-registrering?