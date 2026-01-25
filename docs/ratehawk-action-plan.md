# RateHawk Sertifisering - Action Plan

## 🎯 Oppsummering

Din RateHawk (ETG API) integrasjon er **80% komplett** og teknisk solid implementert. 

### ✅ Sterke sider:
- Alle required endpoints implementert
- God error handling
- Sikkerhet på plass (fersk audit!)
- Test hotel mappet
- Fallback-strategier implementert

### ⚠️ Må fullføres før sertifisering:
1. Test bookings i sandbox
2. Comparison diagram
3. Frontend display av policies
4. Price increase handling
5. Dokumentasjon av meal types

---

## 📋 Pre-Certification Checklist

### 🔴 KRITISK (Må gjøres FØR sertifisering)

#### 1. Test Bookings **[Høyeste prioritet]**
```
Status: ⏳ Ikke gjennomført
Tid: 2-3 timer
```

**Hva må testes:**
- [ ] Standard booking med test hotel (8473727)
- [ ] Booking med barn (2 Adults + 1 Child, 5 år)
- [ ] Multiroom booking (2 rom: 2+1 child, 2 adults)
- [ ] Residency "uz" (Uzbekistan) for testing
- [ ] Dokumenter alle order IDs

**Test scenario:**
```typescript
// Test 1: Standard booking
Hotel ID: 8473727
Dates: [Next week, 2 nights]
Guests: 2 adults
Residency: "no"

// Test 2: Child booking  
Hotel ID: 8473727
Dates: [Next week, 2 nights]
Guests: 2 adults + 1 child (5 years)
Residency: "uz"

// Test 3: Multiroom
Hotel ID: 8473727
Dates: [Next week, 2 nights]
Room 1: 2 adults + 1 child (5 years)
Room 2: 2 adults
Residency: "uz"
```

**Resultat:** Dokumenter order IDs i `systemsjekk-svar.md`

---

#### 2. Comparison Diagram **[Høy prioritet]**
```
Status: ⏳ Ikke opprettet
Tid: 1-2 timer
```

**Hva som trengs:**
Lag et diagram som viser:

```
USER REQUEST
    ↓
[Frontend: hotel-search-form.tsx]
    ↓
[API: /api/hotels/search]
    ↓
[Client: ratehawk-client.ts → searchHotels()]
    ↓
[ETG: /search/serp/region/ OR /geo/ OR /hotels/]
    ↓
[Response parsing & mapping]
    ↓
[Frontend: hotel-results.tsx]
    ↓
[User selects hotel]
    ↓
[API: /api/hotels/details]
    ↓
[Client: getHotelDetails()]
    ↓
[ETG: /search/hp/]
    ↓
[Display room rates]
    ↓
[User selects rate]
    ↓
[API: /api/hotels/prebook]
    ↓
[Client: prebookRate()]
    ↓
[ETG: /hotel/order/booking/form/]
    ↓
[Display booking form]
    ↓
[User fills form]
    ↓
[API: /api/hotels/book]
    ↓
[Client: finishBooking()]
    ↓
[ETG: /hotel/order/booking/finish/]
    ↓
[Polling: checkBookingStatus()]
    ↓
[ETG: /hotel/order/booking/finish/status/]
    ↓
[Status: "ok" → Get order info]
    ↓
[Client: getOrderInfo()]
    ↓
[ETG: /hotel/order/info/]
    ↓
[Display confirmation with HCN]
```

**Tool for diagram:** Excalidraw, Lucidchart, Draw.io, eller Mermaid

---

#### 3. IP Whitelist Avklaring **[Middels prioritet]**
```
Status: ⏳ Dynamiske IPs
Tid: 15 minutter
```

**Action:**
- [ ] Kontakt RateHawk via apisupport@ratehawk.com
- [ ] Informer at du bruker cloud hosting (Vercel/Railway)
- [ ] Spør om dynamic IP addresses er OK
- [ ] Be om confirmation

**Email template:**
```
Subject: IP Whitelisting - Dynamic IPs for Kulbruk.no

Hi RateHawk Team,

We are completing the certification process for our website kulbruk.no.

Regarding IP whitelisting:
- We use cloud hosting (Vercel/Railway) with dynamic outgoing IPs
- We cannot provide a fixed IP list
- We authenticate using API Key ID + API Key in Authorization header

Question: Is API key authentication sufficient, or do we need static IPs?

If static IPs are required, we can set up a proxy server with fixed IP.

Best regards,
Kenneth Kristiansen
Kulbruk.no
```

---

### 🟡 VIKTIG (Bør gjøres før certifisering)

#### 4. Frontend: Metapolicy Display **[Viktig]**
```
Status: ⚠️ Delvis implementert (backend klar)
Tid: 2-3 timer
```

**Backend:** ✅ Parser `metapolicy_struct` og `metapolicy_extra_info`  
**Frontend:** ⚠️ Må vises i UI

**Hva må vises:**
- Check-in / check-out tider
- Cancellation policies (med deadline og timezone)
- Hotel policies (smoking, pets, etc.)
- Important information

**Hvor:**
- Hotel details page
- Booking confirmation
- Booking summary

**Eksempel kode:**
```typescript
// I hotel-details komponenten
{hotel.metapolicy_struct && (
  <PolicySection>
    <h3>Important Information</h3>
    <ul>
      {hotel.metapolicy_struct.checkin && (
        <li>Check-in: {hotel.metapolicy_struct.checkin}</li>
      )}
      {hotel.metapolicy_struct.checkout && (
        <li>Check-out: {hotel.metapolicy_struct.checkout}</li>
      )}
    </ul>
  </PolicySection>
)}

{rate.cancellation_penalties && (
  <CancellationPolicy>
    <h4>Cancellation Policy</h4>
    {rate.cancellation_penalties.free_cancellation_before && (
      <p>Free cancellation until: 
        {new Date(rate.cancellation_penalties.free_cancellation_before)
          .toLocaleString('no-NO', { 
            timeZone: 'Europe/Oslo',
            dateStyle: 'medium',
            timeStyle: 'short' 
          })}
        (Local time)
      </p>
    )}
  </CancellationPolicy>
)}
```

---

#### 5. Price Increase Handling **[Viktig]**
```
Status: ⏳ Ikke implementert
Tid: 1 time
```

**Implementer:**
```typescript
// I prebookRate() eller frontend
const priceIncreasePercent = 10 // 10% tolerance

if (newPrice > originalPrice * (1 + priceIncreasePercent / 100)) {
  // Vis varsel til bruker
  return {
    priceChanged: true,
    originalPrice,
    newPrice,
    increase: ((newPrice - originalPrice) / originalPrice) * 100
  }
}
```

**Frontend notification:**
```tsx
{priceChanged && (
  <Alert variant="warning">
    <AlertTitle>Prisendring</AlertTitle>
    <AlertDescription>
      Prisen har økt fra {originalPrice} til {newPrice} NOK 
      ({increase.toFixed(1)}% økning).
      Vil du fortsette?
    </AlertDescription>
    <Button onClick={acceptNewPrice}>Aksepter ny pris</Button>
    <Button onClick={cancelBooking} variant="outline">Avbryt</Button>
  </Alert>
)}
```

---

#### 6. Meal Type Mapping **[Medium prioritet]**
```
Status: ⚠️ Delvis (viser engelske navn)
Tid: 30 minutter
```

**Opprett mapping fil:**
```typescript
// src/lib/meal-types.ts
export const mealTypeTranslations: Record<string, string> = {
  'all-inclusive': 'Alt inklusiv',
  'american-breakfast': 'Amerikansk frokost',
  'asian-breakfast': 'Asiatisk frokost',
  'breakfast': 'Frokost inkludert',
  'breakfast-buffet': 'Frokostbuffet',
  'breakfast-for-1': 'Frokost for 1',
  'breakfast-for-2': 'Frokost for 2',
  'chinese-breakfast': 'Kinesisk frokost',
  'continental-breakfast': 'Kontinental frokost',
  'dinner': 'Middag inkludert',
  'english-breakfast': 'Engelsk frokost',
  'full-board': 'Helpensjon',
  'half-board': 'Halvpensjon',
  'half-board-dinner': 'Halvpensjon med middag',
  'half-board-lunch': 'Halvpensjon med lunsj',
  'irish-breakfast': 'Irsk frokost',
  'israeli-breakfast': 'Israelsk frokost',
  'japanese-breakfast': 'Japansk frokost',
  'lunch': 'Lunsj inkludert',
  'nomeal': 'Kun rom',
  'scandinavian-breakfast': 'Skandinavisk frokost',
  'scottish-breakfast': 'Skotsk frokost',
  'soft-all-inclusive': 'Soft all inclusive',
  'some-meal': 'Måltid inkludert',
  'super-all-inclusive': 'Super all inclusive',
  'ultra-all-inclusive': 'Ultra all inclusive',
}

export function translateMealType(mealType: string): string {
  return mealTypeTranslations[mealType] || mealType
}
```

**Bruk i komponenter:**
```tsx
import { translateMealType } from '@/lib/meal-types'

<MealBadge>
  {translateMealType(rate.meal)}
</MealBadge>
```

---

### 🟢 NICE TO HAVE (Kan vente til etter certifisering)

#### 7. Webhook Implementation **[Lav prioritet]**
```
Status: ⏳ Ikke implementert
Tid: 2-3 timer
```

**Webhook endpoint:** `/api/webhooks/ratehawk/route.ts`

Du har allerede en webhook fil! Sjekk om den trenger oppdatering:
```bash
cat src/app/api/webhooks/ratehawk/route.ts
```

**Hva må gjøres:**
1. Verifiser webhook signature
2. Handle booking status updates
3. Update database
4. Send notification til bruker

---

#### 8. Incremental Dump **[Lav prioritet]**
```
Status: ⏳ Ikke implementert
Tid: 3-4 timer
```

**Implementer:**
```typescript
async updateHotelDumpIncremental() {
  // Hent incremental dump siden siste oppdatering
  const lastUpdate = await this.getLastDumpTimestamp()
  
  const response = await this.makeRequest('/hotel/info/incremental_dump/', {
    language: 'en',
    from_date: lastUpdate
  }, 'POST')
  
  // Prosesser og merge med existing dump
  // ...
}
```

**Scheduling:** Daglig via cron job

---

## 🚀 Recommended Implementation Order

### Week 1: Kritiske items
1. **Day 1-2:** Test bookings (alle scenarios)
2. **Day 3:** Comparison diagram
3. **Day 4:** IP whitelist kommunikasjon
4. **Day 5:** Dokumenter test results

### Week 2: Viktige items
1. **Day 1-2:** Frontend metapolicy display
2. **Day 3:** Price increase handling
3. **Day 4:** Meal type mapping
4. **Day 5:** Final testing og review

### Week 3: Certification
1. **Day 1:** Send inn completed checklist
2. **Day 2-5:** ETG review og feedback
3. **Ongoing:** Implementer feedback

---

## 📞 Kontakt Info

**RateHawk Support:**
- Email: apisupport@ratehawk.com
- Dokumentasjon: https://docs.worldota.net/

**Dine kontaktpersoner hos RateHawk:**
- [Legg til navn når du får det]

---

## ✅ Quick Win Checklist (Gjør i dag!)

- [ ] Les gjennom `systemsjekk-svar.md` nøye
- [ ] Verifiser at alle endpoints fungerer i Postman/Insomnia
- [ ] Test søk etter test hotel (8473727) på frontend
- [ ] Send IP whitelist email til RateHawk
- [ ] Skriv ned 3 testdatoer for neste uke (for test bookings)
- [ ] Installer diagram tool (Excalidraw/Draw.io)
- [ ] Commit og push denne dokumentasjonen til git

---

**Lykke til med sertifiseringen! 🎉**

Du har gjort mye bra arbeid allerede. De gjenværende punktene er stort sett dokumentasjon og testing.

**Estimert tid til sertifisering:** 2-3 uker (avhengig av RateHawk responstid)

