# TODO - Kulbruk.no MVP (Fase 1)

## 🎯 Mål for MVP
Opprette og vise annonser, godkjenning, innlogging (Clerk allerede satt opp ✅)

---

## 📋 Overordnet progresjon

### ✅ Fullført
- [x] Next.js 15 installert og konfigurert
- [x] Clerk autentisering satt opp med middleware
- [x] shadcn/ui installert og konfigurert
- [x] Tailwind CSS satt opp
- [x] Basis layout med bruker-knapper

### 🔄 Pågående/Neste

---

## 🗄️ Database & Skjema

### Database-oppsett
- [ ] Sett opp MySQL database (PlanetScale eller Supabase)
- [ ] Installer Prisma: `npm install prisma @prisma/client`
- [ ] Initialiser Prisma: `npx prisma init`
- [ ] Konfigurer DATABASE_URL i `.env.local`
- [ ] Oppdater `schema.prisma` med MySQL provider
- [ ] Generer Prisma client: `npx prisma generate`

### Database-skjemaer
- [ ] **Brukere** (sync med Clerk)
  - [ ] `users` tabell med Clerk user_id
  - [ ] Profil-informasjon (navn, telefon, sted)
- [ ] **Kategorier** 
  - [ ] `categories` tabell (møbler, biler, elektronikk, etc.)
- [ ] **Annonser**
  - [ ] `listings` tabell (tittel, beskrivelse, pris, sted, status)
  - [ ] Relasjoner til bruker og kategori
  - [ ] Status: 'pending', 'approved', 'rejected', 'active', 'sold'
- [ ] **Bilder**
  - [ ] `images` tabell koblet til annonser
- [ ] **Bil-spesifikasjoner** (for bil-annonser)
  - [ ] `vehicle_specs` tabell med info fra Vegvesen API

---

## 🎨 UI Komponenter (shadcn/ui)

### Grunnleggende komponenter
- [ ] Installer nødvendige shadcn komponenter:
  - [ ] `npx shadcn@latest add button`
  - [ ] `npx shadcn@latest add form`
  - [ ] `npx shadcn@latest add input`
  - [ ] `npx shadcn@latest add textarea`
  - [ ] `npx shadcn@latest add select`
  - [ ] `npx shadcn@latest add card`
  - [ ] `npx shadcn@latest add badge`
  - [ ] `npx shadcn@latest add dialog`
  - [ ] `npx shadcn@latest add toast`

### Egne komponenter
- [ ] **Navbar** komplett
  - [ ] Logo/branding
  - [ ] Hovednavigasjon
  - [ ] Søkebar
  - [ ] "Legg ut annonse" knapp
- [ ] **AnnonseKort** - for annonselister
  - [ ] Hovedbilde, tittel, pris, sted
  - [ ] Status-badge (venter/godkjent)
- [ ] **AnnonseDetaljer** - full annonsevisning
- [ ] **AnnonseSkjema** - for opprettelse/redigering
  - [ ] Alle feltene fra spesifikasjonen
  - [ ] Bildeopplasting (max 10)
  - [ ] Forhåndsvisning

---

## 📄 Sider (app router)

### Hovedsider
- [ ] **Hjemmeside** (`/`)
  - [ ] Hero-seksjon med søk
  - [ ] Nyeste annonser
  - [ ] Kategorier-oversikt
- [ ] **Søkeresultater** (`/annonser`)
  - [ ] Filtreringsmuligheter (kategori, sted, pris)
  - [ ] Sortering (nyeste, pris)
  - [ ] Paginering
- [ ] **Annonse-detaljer** (`/annonser/[id]`)
  - [ ] Full annonsevisning
  - [ ] Bildegalleri
  - [ ] Kontaktinfo (hvis bruker er logget inn)
- [ ] **Opprett annonse** (`/opprett`)
  - [ ] Krever innlogging
  - [ ] Annonse-skjema med validering
  - [ ] Forhåndsvisning før innsending

### Brukersider
- [ ] **Min profil** (`/profil`)
  - [ ] Rediger profil-informasjon
- [ ] **Mine annonser** (`/mine-annonser`)
  - [ ] Liste over egne annonser med status
  - [ ] Rediger/slett muligheter

---

## 🔧 API Routes

### Annonse-håndtering
- [ ] **GET** `/api/annonser` - hent annonser med filtrering
- [ ] **POST** `/api/annonser` - opprett ny annonse
- [ ] **GET** `/api/annonser/[id]` - hent spesifikk annonse
- [ ] **PUT** `/api/annonser/[id]` - oppdater annonse
- [ ] **DELETE** `/api/annonser/[id]` - slett annonse

### Bildehåndtering
- [ ] **POST** `/api/bilder/upload` - last opp bilder
- [ ] Integrasjon med UploadThing eller Cloudinary

### Vegvesen API (for bil-annonser)
- [ ] **GET** `/api/bil/[regnr]` - hent bilinfo fra registreringsnummer
- [ ] Proxy til Vegvesen API med nøkkel fra `.env`

### Admin-funksjoner
- [ ] **PUT** `/api/admin/annonser/[id]/godkjenn` - godkjenn annonse
- [ ] **PUT** `/api/admin/annonser/[id]/avvis` - avvis annonse

---

## 🛠️ Middleware & Sikkerhet

### Clerk-integrasjon
- [ ] Oppdater middleware for å beskytte admin-ruter
- [ ] Legg til brukerroller (admin/moderator)
- [ ] Beskytt API-ruter med autentisering

### Validering
- [ ] Input-validering på alle skjemaer
- [ ] Server-side validering i API-ruter
- [ ] Rate limiting for API-er

---

## 🎯 Bil-annonse spesialfunksjonalitet

### Vegvesen API-integrasjon
- [ ] Registreringsnummer-søk i annonse-skjema
- [ ] Automatisk utfylling av bil-spesifikasjoner
- [ ] Mulighet for bruker å overstyre automatisk data
- [ ] Håndter API-feil elegant

### Bil-spesifikke felt
- [ ] Merke, modell, årsmodell
- [ ] Kilometerstand, girtype, drivstoff
- [ ] Farge, effekt, CO2-utslipp
- [ ] Neste EU-kontroll, forsikring

---

## 📱 Metadata & SEO

### Basis SEO
- [ ] Oppdater metadata i layout.tsx til Kulbruk.no
- [ ] Legg til favicon og ikoner
- [ ] Open Graph tags for deling
- [ ] Sitemap generering

---

## 🧪 Testing & Feilhåndtering

### Grunnleggende testing
- [ ] Error boundaries for React-komponenter
- [ ] Toast-notifikasjoner for brukerhandlinger
- [ ] Loading states for API-kall
- [ ] 404-side for ikke-eksisterende annonser

---

## 🚀 Deploy og produksjon

### Forberedelser
- [ ] Environment variabler dokumentert
- [ ] Database migreringer testet
- [ ] Build-prosess fungerer
- [ ] Velg hosting-platform (Vercel/Netlify)

---

## 📝 Dokumentasjon

### Utviklerdokumentasjon
- [ ] README.md oppdatert med setup-instruksjoner
- [ ] API-dokumentasjon
- [ ] Database-skjema dokumentert
- [ ] Environment variabler dokumentert

---

## 🎉 MVP-lansering

### Før lansering
- [ ] Alle hovefunksjoner testet
- [ ] Admin-panel for godkjenning fungerer
- [ ] Grunnleggende sikkerhet på plass
- [ ] Backup-strategi for database

### Etter lansering (Fase 2 forberedelser)
- [ ] Meldingssystem planlegging
- [ ] Stripe-integrasjon vurdering
- [ ] Ytelsesoptimalisering

---

## 🔄 Neste steg
1. Start med MySQL database-oppsett (PlanetScale eller Supabase) og Prisma ORM-konfigurering
2. Definer database-skjemaer i Prisma schema og kjør migreringer
3. Lag grunnleggende shadcn/ui komponenter
4. Implementer annonse CRUD-operasjoner  
5. Legg til Vegvesen API-integrasjon for bil-annonser
6. Sett opp admin-godkjenning og moderasjon
7. Testing og deploy

**Estimert tid for MVP:** 3-4 uker