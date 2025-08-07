# 🛒 Kulbruk.no - Norsk Marketplace Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.13.0-2D3748)](https://www.prisma.io/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-purple)](https://clerk.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com/)

En moderne, full-stack marketplace-platform bygget for det norske markedet med avanserte funksjoner for bilsalg, eiendom og generell handel.

## 🌟 Hovedfunksjoner

### 🏪 **Marketplace**
- **3 hovedkategorier**: Bil, Eiendom, Torget
- **Avansert søk og filtrering** med Norge-spesifikke data
- **Sanntids annonser** med live-oppdateringer
- **Bil-spesifikt søk** med Vegvesen API-integrasjon
- **Bildeupplasting** med komprimering og galleri

### 👥 **Brukerroller**
- **Kunder**: Søke, kjøpe, selge annonser
- **Bedrifter**: Auksjoner, profittkalkulering, spesialdashboard  
- **Moderatorer**: Godkjenne annonser og håndtere rapporter
- **Administratorer**: Full systemkontroll og brukeradministrasjon

### 🔐 **Autentisering & Sikkerhet**
- **Clerk-integrasjon** med rollbasert tilgangskontroll
- **Webhooks** for brukersynkronisering
- **Sikre API-endepunkter** med proper validering
- **Session-håndtering** og metadata-synkronisering

### 🚗 **Bil-spesialiseringer**
- **Vegvesen API** for automatisk utfylling av kjøretøydata
- **AI-drevet prisestimering** for bruktbiler
- **Tekniske spesifikasjoner** (motor, drivstoff, EU-kontroll)
- **Merke/modell-intelligens** med auto-komplettering

### 💼 **Business Dashboard**
- **Live auksjoner** med sanntids bud-system
- **Profittkalkulering** med margin-analyse
- **Varslingssystem** for nye auksjoner
- **Abonnementshåndtering** og bedriftsprofiler

### ⚡ **Sanntids-funksjoner**
- **Server-Sent Events (SSE)** for live-oppdateringer
- **Automatiske varsler** til admin/moderatorer
- **Live auksjonsstatus** og budoppdateringer
- **Instant annonse-godkjenning** feedback

## 🛠️ Teknisk Stack

### **Frontend**
- **Next.js 15** - React framework med App Router
- **TypeScript** - Type-sikkerhet
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Moderne komponentbibliotek
- **Lucide React** - Ikonbibliotek

### **Backend & Database**
- **Next.js API Routes** - Serverløse API-endepunkter
- **Prisma** - Type-safe ORM
- **MySQL** - Produksjonsdatabase
- **Zod** - Runtime validering

### **Autentisering**
- **Clerk** - Komplett autentiseringsløsning
- **Webhook-synkronisering** - Automatisk brukersynk
- **Rollbasert tilgang** - Granulær tilgangskontroll

### **Integrasjoner**
- **Statens Vegvesen API** - Kjøretøyinformasjon
- **Amadeus API** - Reisesøk (planlagt)
- **AI/ML** - Prisestimering for biler

## 🚀 Installasjon og Oppsett

### **Forhåndskrav**
```bash
Node.js 18.17.0+
npm eller yarn
MySQL database
```

### **1. Klon repositoryet**
```bash
git clone https://github.com/mroizo75/kulbruk.git
cd kulbruk
```

### **2. Installer avhengigheter**
```bash
npm install
```

### **3. Miljøvariabler**
Opprett `.env.local` fil:
```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/kulbruk"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# External APIs
VEGVESEN_API_KEY=your_vegvesen_api_key
AMADEUS_API_KEY=your_amadeus_key (optional)
AMADEUS_API_SECRET=your_amadeus_secret (optional)
```

### **4. Database oppsett**
```bash
# Generer Prisma klient
npx prisma generate

# Kjør migrasjoner
npx prisma db push

# Seed database med testdata (valgfritt)
npm run seed
```

### **5. Start utviklingsserver**
```bash
npm run dev
```

Applikasjonen kjører nå på `http://localhost:3000`

## 📁 Prosjektstruktur

```
kulbruk/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Test data seeding
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/             # API routes
│   │   ├── dashboard/       # Role-based dashboards
│   │   ├── annonser/        # Listing pages
│   │   └── auth/            # Authentication pages
│   ├── components/          # React komponenter
│   │   ├── ui/             # shadcn/ui komponenter
│   │   ├── admin/          # Admin-spesifikke komponenter
│   │   └── homepage/       # Hjemmeside-seksjoner
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities og konfigurasjon
│   └── middleware.ts       # Next.js middleware
├── public/                 # Statiske filer
└── docs/                  # Dokumentasjon og guider
```

## 🔧 API Endepunkter

### **Annonser**
- `GET /api/annonser/list` - Hent annonser med filtrering
- `POST /api/annonser` - Opprett ny annonse
- `GET /api/annonser/[id]` - Hent enkelt annonse

### **Admin**
- `GET /api/admin/notifications` - Admin varsler
- `POST /api/admin/listings/[id]/approve` - Godkjenn annonse
- `GET /api/admin/users` - Brukeradministrasjon

### **Business**
- `GET /api/business/auctions` - Live auksjoner
- `POST /api/business/bid` - Legg inn bud
- `GET /api/business/live-auctions` - SSE stream

### **Bil-spesifikt**
- `GET /api/vegvesen?regNumber=ABC123` - Hent kjøretøydata
- `GET /api/cars/popular-searches` - Populære søk
- `POST /api/cars/search` - Avansert bilsøk

## 👥 Brukerroller

### **Kunde (Customer)**
- Søke og browse annonser
- Opprette egne annonser
- Administrere favoritter
- Kontakte selgere

### **Bedrift (Business)**
- Delta i auksjoner
- Profittkalkulering
- Spesialiserte varsler
- Bedriftsprofil

### **Moderator**
- Godkjenne/avvise annonser
- Håndtere rapporter
- Moderere innhold

### **Administrator**
- Full brukeradministrasjon
- Systemstatistikk
- Database-administrasjon
- Rollehåndtering

## 🌐 Kategori-system

### **Bil** (`/annonser/bil`)
Alle motoriserte kjøretøy:
- Biler, motorsykler, båter
- Bildeler og tilbehør
- Vegvesen API-integrasjon
- Avanserte bilfiltre

### **Eiendom** (`/annonser/eiendom`)
All eiendom:
- Leiligheter, hus, hytter
- Tomter og næringseiendom
- Området-spesifikke filtre

### **Torget** (`/annonser/torget`)
Alt annet:
- Elektronikk, møbler, klær
- Sport, hobby, barn
- Diverse kategorier

## 🔄 Deployment

### **Vercel (anbefalt)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Docker**
```bash
# Build image
docker build -t kulbruk .

# Run container
docker run -p 3000:3000 kulbruk
```

## 📚 Viktige Guider

- [**Admin Setup**](ADMIN_SETUP.md) - Hvordan sette opp admin-brukere
- [**Kategori Routing**](KATEGORI_ROUTING_GUIDE.md) - Kategori-systemet
- [**Webhook Setup**](WEBHOOK_SETUP.md) - Clerk webhook-konfigurasjon
- [**Prisestimering**](PRICE_ESTIMATION_PLAN.md) - AI-prisestimering for biler

## 🤝 Bidrag

Vi ønsker bidrag velkommen! Se vår [bidragsguide](CONTRIBUTING.md) for mer informasjon.

### **Utviklingsguide**
1. Fork repositoryet
2. Opprett feature branch (`git checkout -b feature/ny-funksjon`)
3. Commit endringer (`git commit -m 'Legg til ny funksjon'`)
4. Push til branch (`git push origin feature/ny-funksjon`)
5. Opprett Pull Request

## 📄 Lisens

Dette prosjektet er lisensiert under [MIT License](LICENSE).

## 🙋‍♂️ Support

- **GitHub Issues**: [Opprett issue](https://github.com/mroizo75/kulbruk/issues)
- **Email**: support@kulbruk.no
- **Dokumentasjon**: Se `/docs` mappen

## ⭐ Takk til

- **Statens Vegvesen** - For API tilgang til kjøretøydata
- **Clerk** - For robust autentiseringsløsning  
- **Vercel** - For hosting og deployment
- **shadcn/ui** - For vakre UI-komponenter

---

**🚀 Bygget med ❤️ for det norske markedet**