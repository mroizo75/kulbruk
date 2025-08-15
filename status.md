## Kulbruk – Status og veikart

Oppdatert: fylles ved commit

### 1) Nåværende status (kort)
- Kjerne: Opprette/visning av annonser (kortkode), godkjenning, admin-slett, betaling (listing fee/abonnement), bilinfo (Vegvesen), "Mer som dette", kart, lånekalkulator.
- Autentisering: NextAuth v5 (JWT), roller (admin/moderator/business/customer).
- DB: Prisma (MySQL). Kortkode `Listing.shortCode` i bruk. Bilspesifikasjoner lagres i `VehicleSpec`.
- UI/UX: App Router, shadcn/ui, responsiv, CSS-fallback lagt inn.

### 2) Prod‑ready (høyeste prioritet)
- [ ] Flytt prosjekt ut av OneDrive (unngå Prisma EPERM-låsing). Anbefalt sti: `C:\dev\kulbruk`
- [x] CI/CD: build, lint, prisma generate/db push på PR/merge (GitHub Actions)
- [x] Error‑sider: 404/500 lagt til
- [x] CSP/Headers: satt opp (dev mer liberal; prod strammes senere med nonce/hash)
- [ ] Logging/monitorering
  - [x] Sentry (basic init klient/server + exception‑capture i middleware)
  - [ ] Better Stack (opsjon for oppetid/logg/varsling)
- [x] Audit‑logg i DB for adminhandlinger
- [x] SEO: robots og sitemap + grunnleggende OpenGraph metadata
- [x] Ytelse: caching for `public/uploads` (immutable)
- [x] Indekser i DB: `Listing(categoryId,status,isActive,expiresAt)` + fulltekst på `title`
- [x] E‑postleverandør: Postmark integrert (From satt til verifisert `info@kksas.no` inntil `kulbruk.no`-domene er verifisert)

### 3) Produkt-funksjoner (MVP‑gap)
- Meldinger
  - [x] Modeller: Conversation, Message
  - [x] API: opprett/send/list
  - [ ] Blokkering/rapportering i meldingstråd
  - [x] UI: chat i dashboard
  - [x] Varsling: e‑post ved ny melding
  - [x] Varsling: SSE (inkl. ulest‑teller‑badge i sidebar for kunde)
- Rapporteringssystem
  - [x] Model: Report { listingId, reporterId, reason, comment, status, handledBy }
  - [x] API + Admin‑UI: liste/kø og status
  - [x] Koble hurtighandlinger i UI til PUT `/api/reports/[id]`
  - [x] Audit‑logg
- Vurderinger (rating)
  - [x] Model: Review { revieweeId, reviewerId, listingId?, rating, comment }
  - [x] API: opprett/list
  - [x] UI: legg igjen vurdering; vis snitt på selger
  - [x] Regler: rate limit + én pr relasjon (enforced via unique/upsert og 10 min cooldown)
- Favoritter/lagrede søk
  - [x] Favorite { userId, listingId }
  - [x] SavedSearch { userId, queryParams(json) }
- [x] SavedSearch: e‑post ved nye treff

### 4) Betalings‑ og salgsflyt (valg)
- Beslutning: skal kjøp skje i plattformen?
  - A (senere): Ordre + Stripe Connect/Transfers (payouts/escrow)
    - [ ] Model: Order { buyerId, sellerId, listingId, amount, status }
    - [ ] Checkout, betaling, refund, disputter
  - B (nå): fortsatt listing fee/abonnement, handel avtales via meldinger

### 5) Admin og moderasjon
- [x] Admin‑liste: søk/filter (status/kategori/kortkode), paginering (server‑side)
- [x] Admin‑liste: bulk actions – UI og backend (APPROVE/REJECT/DELETE) med audit‑logg
- [x] "Rapporter"‑tab
- [ ] AuditLog { userId, action, targetType, targetId, data, createdAt }
- [x] Global kortkodesøk i admin header

### 6) Søk/dataforbedring
- [x] "Mer som dette": match også `vehicleSpec.make/model`
- [x] Fulltekst på `title` (triggere vurderes senere)
- [ ] V2: Meilisearch/Algolia

### 7) Varslinger
- [x] E‑post: ny melding, rapport, godkjenning/avvisning, utløper snart (cron)
- [x] SSE for bruker (meldinger)
  - [x] Ulest‑teller i sidebar (kunde)
- [x] Cron‑endepunkter sikret med `X-CRON-KEY`/`CRON_SECRET`
- [x] SavedSearch digest via cron – API klart; VPS‑oppsett dokumentert i `CRON_VPS_SETUP.md`

### 8) Juridisk og personvern
- [x] Samtykke‑banner for cookies/lokal lagring (lokal søkehistorikk med brukerens samtykke)
- [x] Vilkår‑samtykke i registrering og ved opprettelse av annonse (kreves i UI og valideres i API)
- [x] Slett meg / dataeksport (UI‑flow i dashboard)
- [ ] Oppdatert personvern/cookie‑samtykke (juridiske tekster – finpuss m/juridisk gjennomgang)
- [ ] DPA med tredjepart (Stripe, e‑postleverandør)

### 9) Hurtigvinninger
- [x] Vis `shortCode` i detaljside og admin‑liste
- [x] Vis `shortCode` i Mine annonser + kvittering/toast etter opprettelse
- [x] Admin: bekreftelsesdialog før slett
- [x] SEO: kanoniske URL‑er + Product structured data på detaljsiden (videre utvidelser står igjen)
- [x] Tom‑tilstander i lister

### 10) Sprintplan
- Sprint 1: Meldinger + Rapporter (DB, API, UI, epost/SSE)
- Sprint 2: Rating + Favoritter + SavedSearch
- Sprint 3: Admin‑filter/bulk, audit‑log, SEO/monitor
- Sprint 4: (valgfritt) Ordre/payouts (hvis valgt)

---

Notat: CSS‑fallback er implementert (`public/base-fallback.css`). Når CSP strammes i prod, verifiser at Next preloads og Tailwind CSS ikke blokkeres.
