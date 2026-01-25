# 🔒 KRITISK SIKKERHETSINFORMASJON

## ⚠️ UMIDDELBAR HANDLING PÅKREVD

Din nåværende `.env.local` inneholder **EKTE API-NØKLER OG SECRETS** som HAR VÆRT i git historikken.

### 🚨 Steg 1: ROTERE ALLE SECRETS (KRITISK!)

Du MÅ rotere følgende nøkler umiddelbart:

#### 1. Stripe
- Gå til https://dashboard.stripe.com/apikeys
- Generer NYE API keys
- Oppdater både `STRIPE_SECRET_KEY` og `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Generer ny webhook secret: https://dashboard.stripe.com/webhooks

#### 2. OpenAI  
- Gå til https://platform.openai.com/api-keys
- Revoke eksisterende key: `sk-proj-5J_9V-7UJaICzr6mZcEgK_...`
- Generer ny key

#### 3. Cloudinary
- Gå til Cloudinary dashboard
- Generer ny API key og secret

#### 4. Resend
- Gå til https://resend.com/api-keys
- Revoke `re_Fuxu6QhJ_8p8QLL6Ezsv3Qae1zUmsqSP2`
- Generer ny key

#### 5. Postmark
- Revoke `d8f75317-f2c2-4475-ac28-09ed1d856642`
- Generer ny API token

#### 6. RateHawk
- Kontakt RateHawk support for å rotere credentials

#### 7. Amadeus
- Gå til Amadeus developer portal
- Generer nye credentials

#### 8. Vegvesen API
- Generer ny API key hvis mulig

#### 9. Interne secrets
Generer nye secrets med:
```bash
openssl rand -base64 32
```

Oppdater disse:
- `NEXTAUTH_SECRET`
- `ADMIN_SETUP_TOKEN`
- `CRON_SECRET`

### 🗑️ Steg 2: Fjern secrets fra git historikk

**ADVARSEL: Dette omskriver git historikk!**

```bash
# Installer git-filter-repo (anbefalt metode)
pip install git-filter-repo

# Backup repo først!
cp -r . ../kulbruk-backup

# Fjern .env.local fra hele historikken
git filter-repo --invert-paths --path .env.local

# Eller bruk BFG Repo Cleaner (enklere)
# Last ned fra: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files .env.local

# Rydd opp
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (KOORDINER MED TEAM FØRST!)
git push origin --force --all
git push origin --force --tags
```

### ✅ Steg 3: Sjekkliste før produksjon

- [ ] Alle API keys er rotert
- [ ] Nye secrets er lagt til i `.env.local` (ikke commit!)
- [ ] `.env.local` er i `.gitignore`
- [ ] Git historikk er renset
- [ ] Produksjonsmiljø (Vercel/Railway) har nye secrets
- [ ] Database passord er endret
- [ ] Test at alt fungerer med nye credentials
- [ ] Team er informert om nye credentials
- [ ] Backup av nye credentials på sikkert sted (password manager)

### 🛡️ Steg 4: Implementerte sikkerhetstiltak

Jeg har implementert følgende forbedringer:

✅ Rate limiting på alle sensitive endpoints
✅ Sterkere passordvalidering (12+ tegn, kompleksitet)
✅ Input sanitization og validering
✅ Forbedret error handling (ingen sensitive data lekkes)
✅ Timing-safe comparison for secrets
✅ File upload validering med magic bytes
✅ Strammere CSP (fjernet unsafe-eval i prod)
✅ Begrenset image sources til kjente domener
✅ Autentisering på upload endpoint
✅ HTTPS enforcement i produksjon

### 📋 Neste steg

1. FØRST: Rotere alle secrets (se over)
2. Rens git historikk
3. Test applikasjonen lokalt med nye keys
4. Oppdater produksjonsmiljø
5. Deploy til produksjon

### 🆘 Trenger hjelp?

Hvis du er usikker på noe, IKKE deploy til produksjon ennå.
Send epost til: kenneth@kksas.no

**HUSK: Gamle secrets i git historikk forblir der til du renser historikken!**
