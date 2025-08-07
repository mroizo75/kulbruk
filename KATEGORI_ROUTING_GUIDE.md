# Kategori-routing Guide for Kulbruk.no

## 🎯 Problemet som ble løst
- Mange 404-feil på `/annonser/kategori/` ruter
- Ustrukturerte kategorier som ikke matchet hovedfokuset
- Forvirrende navigasjon med for mange kategorier

## ✅ Løsningen: 3 Hovedkategorier

### 📱 **Bil** (`/annonser/bil`)
**Inkluderer alle motoriserte kjøretøy:**
- Bil, Biler, Motorsykkel, Motorsykler
- Moped, Scooter, ATV, Snøscooter
- Båt, Båter, Campingvogn, Tilhenger
- Reservedeler, Bildeler, Dekk, Felger

### 🏠 **Eiendom** (`/annonser/eiendom`)
**Inkluderer alt som har med eiendom å gjøre:**
- Leilighet, Leiligheter, Enebolig, Eneboliger
- Rekkehus, Tomannsbolig, Hytte, Hytter
- Fritidsbolig, Tomt, Tomter, Næringseiendom
- Kontor, Lager, Industrieiendom, Gård, Skog

### 🛍️ **Torget** (`/annonser/torget`)
**Alt annet som ikke er bil eller eiendom:**
- Elektronikk, PC, TV, Gaming, Mobil
- Møbler, Sofa, Bord, Stol, Seng
- Klær, Sko, Sport, Fritid, Hobby
- Barn, Baby, Kjæledyr, Hage, Verktøy
- Bøker, Kunst, Mat, Helse, Diverse

## 🔄 Automatiske Redirects

### Gamle URL → Ny URL
```
/annonser/elektronikk    → /annonser/torget
/annonser/mobler         → /annonser/torget
/annonser/leiligheter    → /annonser/eiendom
/annonser/motorsykkel    → /annonser/bil
/annonser/kategori/X     → /annonser/[hovedkategori]
```

### Smart Søk-redirects
```
/annonser/bil?search=Tesla       ✅ Fungerer
/annonser/eiendom?search=Hytte   ✅ Fungerer  
/annonser/torget?search=iPhone   ✅ Fungerer
```

## 🛠️ Teknisk Implementering

### 1. **Kategori-mapper** (`src/lib/category-mapper.ts`)
- Definerer hovedkategorier og underkategorier
- Intelligent mapping fra gamle til nye kategorier
- Validering av gyldige kategorier

### 2. **Middleware** (`src/middleware.ts`)
- Automatiske redirects for ugyldige kategorier
- Preserverer query parameters ved redirect
- Håndterer både `/annonser/X` og `/annonser/kategori/X`

### 3. **API-oppdatering** (`src/app/api/annonser/list/route.ts`)
- Validerer kun gyldige hovedkategorier
- Smart kategori-filtrering basert på underkategorier
- Torget ekskluderer bil og eiendom automatisk

### 4. **Dynamic routing** (`src/app/annonser/[category]/page.tsx`)
- Støtter kun de 3 hovedkategoriene
- Automatisk redirect hvis ugyldig kategori
- Static generation for beste ytelse

## 🎨 Brukeropplevelse

### Hovedsiden (`/annonser`)
- Viser kun de 3 hovedkategoriene tydelig
- Populære underkategorier som søke-shortcuts
- Fargekodede kategorier (blå=bil, grønn=eiendom, lilla=torget)

### Kategori-sider
- **Bil**: Avansert bil-søk med merke/modell/år filtre
- **Eiendom**: Standard filtre tilpasset eiendom
- **Torget**: Generelle filtre for alt annet

### Søkefunksjon
- Smart auto-kompletter som forstår underkategorier
- "Tesla" → foreslår bil-kategorien automatisk
- "Leilighet" → foreslår eiendom-kategorien

## 📊 Statistikk og Analyse

### Kategori-fordeling
```typescript
// API returnerer automatisk riktig fordeling
{
  "bil": { annonser: X, populære: ["Tesla", "BMW"] },
  "eiendom": { annonser: Y, populære: ["Leilighet", "Hytte"] },
  "torget": { annonser: Z, populære: ["iPhone", "Sofa"] }
}
```

## 🚀 Fremtidige Forbedringer

1. **Analytics**: Spore hvilke redirects som brukes mest
2. **SEO**: Automatiske canonical URLs for SEO
3. **Admin**: Dashboard for å administrere kategori-mapping
4. **Lokalisering**: Støtte for regionale variasjoner

## ⚠️ Migrering

### For eksisterende lenker:
- Alle gamle kategorier redirecter automatisk
- Ingen 404-feil lenger
- Query parameters preserveres

### For utviklere:
- Bruk kun: `bil`, `eiendom`, `torget`
- Andre kategorier vil automatisk redirecte
- Test alle lenker med nye URLer

---

**🎉 Resultatet: Enklere navigasjon, ingen 404-feil, og bedre brukeropplevelse!**
