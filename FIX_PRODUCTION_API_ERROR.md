# PRODUCTION FIX: RateHawk API 500 Error

## 🔴 PROBLEM
`/api/hotels/destinations` gir 500 error på kulbruk.no (production)

## ✅ LØSNING

### Steg 1: Verifiser miljøvariabler på production server

Logg inn på production server (Vercel/Railway/etc.) og sjekk at disse er satt:

```bash
RATEHAWK_KEY_ID=14316
RATEHAWK_API_KEY=fafbc1f3-ced1-406d-9ba1-54a8e6133e76
RATEHAWK_BASE_URL=https://api.worldota.net/api/b2b/v3
```

### Steg 2: Sjekk error logs på production

Hvis du bruker:
- **Vercel**: Gå til dashboard → Logs
- **Railway**: Gå til dashboard → Deployments → View logs
- **Annen**: SSH inn og sjekk `pm2 logs` eller `docker logs`

### Steg 3: Mulige årsaker til 500 error:

1. **Mangler RateHawk credentials** i production environment
2. **CORS issue** - Production domain ikke whitelisted
3. **Network restrictions** - Server kan ikke nå RateHawk API
4. **Timeout** - API tar for lang tid (>10s default timeout)

### Steg 4: Debug mode

Legg til bedre error logging i `src/app/api/hotels/destinations/route.ts`:

```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    console.log('📍 API: Destination search:', query)
    console.log('📍 RateHawk credentials check:', {
      hasKeyId: !!process.env.RATEHAWK_KEY_ID,
      hasApiKey: !!process.env.RATEHAWK_API_KEY,
      baseUrl: process.env.RATEHAWK_BASE_URL
    })

    const destinations = await ratehawkClient.searchDestinations(query)

    console.log('📍 API: Found destinations:', destinations?.length || 0)

    return NextResponse.json({
      success: true,
      destinations: destinations || []
    })

  } catch (error: any) {
    console.error('❌ API: Destination search error:', {
      message: error.message,
      stack: error.stack,
      credentials: {
        hasKeyId: !!process.env.RATEHAWK_KEY_ID,
        hasApiKey: !!process.env.RATEHAWK_API_KEY
      }
    })
    
    return NextResponse.json(
      {
        success: false,
        destinations: [],
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
```

### Steg 5: Deploy og test

```bash
# Commit debug logging
git add src/app/api/hotels/destinations/route.ts
git commit -m "Add debug logging for RateHawk API"
git push origin main

# Vent på deploy, så sjekk logs
```

---

## 🛡️ MIDLERTIDIG FALLBACK

Hvis RateHawk API fortsetter å feile på production, legg til fallback-destinasjoner:

```typescript
export async function GET(request: NextRequest) {
  try {
    const destinations = await ratehawkClient.searchDestinations(query)
    return NextResponse.json({ success: true, destinations })
  } catch (error) {
    console.error('RateHawk API failed, using fallback', error)
    
    // FALLBACK: Hardkodede populære destinasjoner
    const fallbackDestinations = [
      { id: '2563', name: 'Oslo, Norway', type: 'city', country: 'Norway' },
      { id: '1953', name: 'Copenhagen, Denmark', type: 'city', country: 'Denmark' },
      { id: '1382', name: 'Berlin, Germany', type: 'city', country: 'Germany' },
      { id: '1775', name: 'Paris, France', type: 'city', country: 'France' },
      { id: '1869', name: 'London, United Kingdom', type: 'city', country: 'UK' },
      { id: '8473727', name: 'Test Hotel', type: 'hotel', country: 'Test' }
    ]
    
    return NextResponse.json({
      success: true,
      destinations: fallbackDestinations,
      _fallback: true
    })
  }
}
```

---

## ✅ VERIFISER FIX

1. Deploy endringer
2. Åpne https://kulbruk.no/hotell
3. Åpn Developer Tools (F12)
4. Sjekk Console for:
   - `📍 RateHawk credentials check` log
   - Om det vises destinasjoner
5. Sjekk Network tab for `/api/hotels/destinations?q=` response
