# 🔗 Webhook Setup Guide

## 📋 Automatisk brukersynkronisering

For at nye brukere automatisk skal synkroniseres til databasen når de registrerer seg, må webhooks være konfigurert.

## 🚀 Rask Setup (Utvikling)

### 1. Sett opp miljøvariabler
```bash
# Kopier eksempel-filen
cp .env.local.example .env.local

# Rediger .env.local med dine faktiske verdier
```

### 2. Konfigurer Clerk Dashboard

1. **Gå til:** [Clerk Dashboard](https://dashboard.clerk.com)
2. **Velg ditt project**
3. **Navigate:** Webhooks → "Add Endpoint"
4. **Endpoint URL:** `http://localhost:3000/api/webhooks/clerk-simple`
5. **Events:** Velg følgende:
   - ✅ `user.created`
   - ✅ `user.updated` 
   - ✅ `user.deleted`
6. **Klikk "Create"**
7. **Kopier "Signing Secret"** til `CLERK_WEBHOOK_SECRET` i `.env.local`

### 3. Restart serveren
```bash
npm run dev
```

## 🧪 Test Setup

### Automatisk test
1. **Gå til:** http://localhost:3000/debug
2. **Sjekk at webhook endpoint er aktiv**
3. **Registrer en ny testbruker på** http://localhost:3000/sign-up
4. **Sjekk terminalen** - du skal se webhook-logging
5. **Sjekk database** - ny bruker skal være opprettet automatisk

### Manuell test
```bash
# Test webhook endpoint
curl http://localhost:3000/api/webhooks/clerk-simple

# Test brukersynkronisering
curl -X POST http://localhost:3000/api/manual-user-sync
```

## 🌐 Produksjon Setup

### 1. Webhooks for produksjon
- **URL:** `https://ditt-domene.no/api/webhooks/clerk`
- **Bruker svix-verifisering for sikkerhet**
- **Krever gyldig `CLERK_WEBHOOK_SECRET`**

### 2. Lokal testing med ngrok
```bash
# Installer ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3000

# Bruk ngrok URL i Clerk Dashboard
# Eksempel: https://abc123.ngrok.io/api/webhooks/clerk-simple
```

## 🔧 Feilsøking

### Webhook kalles ikke
- ✅ Sjekk at URL er riktig i Clerk Dashboard
- ✅ Sjekk at serveren kjører på riktig port
- ✅ Sjekk at firewall ikke blokkerer

### Webhook feiler
- ✅ Sjekk `CLERK_WEBHOOK_SECRET` i `.env.local`
- ✅ Sjekk terminal for feilmeldinger
- ✅ Test med `/api/webhooks/clerk-simple` først

### Database-feil
- ✅ Sjekk `DATABASE_URL` i `.env.local`
- ✅ Sjekk at database kjører
- ✅ Kjør `npx prisma db push` for schema-synkronisering

## 📞 Support

Hvis du fortsatt har problemer:
1. **Sjekk terminal** for feilmeldinger
2. **Test debug-siden:** http://localhost:3000/debug
3. **Kjør manuell sync** for å bekrefte at database fungerer
4. **Sjekk Clerk Dashboard** webhook logs

## ✅ Verifiser at det fungerer

**Vellykket setup når:**
- ✅ Ny brukerregistrering → automatisk i database
- ✅ Terminal viser webhook-logging
- ✅ `/api/test-sync` returnerer 200 OK
- ✅ Debug-siden viser `isAuthenticated: true`