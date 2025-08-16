# Kulbruk.no – Teknisk spesifikasjon

## 📌 Prosjektoversikt

**Navn:** Kulbruk.no  
**Formål:** Et brukervennlig og profesjonelt markedsplass-alternativ hvor privatpersoner og bedrifter kan legge ut annonser til en rimelig pris – uten spam, med manuell godkjenning og fokus på kvalitet og tillit.  
**Målgruppe:** Folk som selger brukte varer, småbedrifter, håndverkere, bilselgere m.m.

---

## ⚙️ Teknologivalg

| Del | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router) |
| UI-bibliotek | shadcn/ui |
| Backend | Next.js API Routes / Edge Functions |
| Database | MySQL (PlanetScale eller Supabase) |
| Autentisering | NextAuth v5 (med sosiale innlogginger: Google, GitHub etc.) |
| Adminsystem | Admin-panel med Next.js + RBAC |
| Bildehåndtering | Cloudinary (med base64 fallback) |
| Søkeoptimalisering | MySQL fulltekst + ev. Algolia |
| Notifikasjoner | Epost + valgfri SMS (Twilio) |
| Betaling | Stripe |
| Anti-spam | hCaptcha eller reCAPTCHA + manuell godkjenning |

---

## 📐 Funksjonalitet

### 🧍 Brukerroller

- **Bruker:** Kan opprette annonser, lagre favoritter, sende meldinger.
- **Moderator/Admin:** Kan godkjenne, endre og slette annonser.

---

### 📄 Annonsering

- Tittel, beskrivelse, kategori, sted, pris, bilder (max 10), kontaktinfo.
- **Forhåndsvisning** før publisering.
- Status: `Venter på godkjenning`, `Publisert`, `Avvist`.
- **Rapporteringsfunksjon:** Brukere kan rapportere upassende annonser.

#### 🚗 Ekstra for bilannonser:

- **Registreringsnummer-søk:** Automatisk henting av bilinfo fra API.
  - Eksempel på integrasjon: [vegvesen.no](https://autosys-kjoretoy-api.atlas.vegvesen.no/api-ui/index-api.html?apiId=enkeltoppslag)
  API nøkkelen ligger i .env filen under VEGVESEN_API=
  - Henter info som merke, modell, årsmodell, girtype, drivstoff, farge m.m.
  - Brukeren kan overstyre feltene etterpå.
- Automatisk generering av tekniske spesifikasjoner.
- Lagre bil som "favoritt" med varsling ved prisendring (senere).

---

### 🔍 Søk og filtrering

- Kategorier: Møbler, biler, elektronikk, eiendom, jobb etc.
- Lokasjon (basert på kommune/fylke + radius)
- Prisområde
- Sortering: Nyeste, lavest pris, høyest pris
- Søkehistorikk (lokalt eller via brukerprofil)

---

### 💬 Meldingssystem

- Innebygget meldingssystem
- Push/email-varsling
- Blokkering/rapportering av spam

---

### 🧾 Admin-panel

- Dashboard:
  - Antall annonser
  - Aktive brukere
  - Annonser til godkjenning
- Godkjenn / avvis / rediger annonser
- Brukerblokkering
- RBAC via Clerk

---

## 💰 Inntektsmodell

| Modell | Forklaring |
|---|---|
| Gratis basisannonser | 1 gratis annonse/måned |
| Boost | Vises på topp i søkeresultater |
| Abonnement | F.eks. 99 kr/mnd for 10 annonser |
| Bedriftskontoer | Logo + firmaside |
| **Fort gjort** | **2.5% fee på sikre transaksjoner (Torget)** |
| Affiliate-annonser | Kommisjonsbaserte |

---

## 🚀 Konkurransefortrinn

| Finn.no | Kulbruk.no |
|--------|-------------|
| Dyr annonsering | Rimelig eller gratis |
| Tungt grensesnitt | Moderne, rask UI |
| Mye uønsket kontakt | Meldingsfilter og spamkontroll |
| Lite SMB-støtte | Firmaprofiler inkludert |
| **Ingen sikker handel** | **Fort gjort - escrow system** |
| **Kompleks brukerflyt** | **Smart redirect etter login** |

---

## 🌐 SEO og markedsføring

- SEO-optimaliserte sider (Next.js SSG)
- Rich snippets (Schema.org)
- Delbare lenker (Open Graph)
- Blogginnhold (organisk trafikk)
- Videoannonsering via TikTok/Reels

---

## 🔮 Fremtidige utvidelser

- Mobilapp
- AI-kategorisering (fra bilde eller tittel)
- Selgervurderinger
- Utleiemarked
- Kartvisning

---

## 📅 Utviklingsfaser

| Fase | Innhold |
|------|---------|
| 1. MVP | Opprette og vise annonser, godkjenning, innlogging |
| 2. Meldinger | Meldingssystem og epostvarsling |
| 3. Betaling | Stripe-integrasjon |
| 4. Adminpanel | Dashboard og moderasjon |
| 5. SEO/design | Optimalisering for synlighet |
| 6. Mobilvennlighet | Responsivt design og evt. app

---
