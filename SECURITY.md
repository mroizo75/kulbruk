# Sikkerhetsanvisninger for Kulbruk

## 🔒 Secrets Management

### KRITISK: Rotere alle secrets før produksjon

Hvis dette prosjektet har vært i git med ekte secrets, MÅ du:

1. **Rotere ALLE API-nøkler og secrets:**
   - Stripe API keys (generer nye)
   - OpenAI API key
   - Database passord
   - NextAuth secret
   - Alle OAuth credentials
   - Cloudinary credentials
   - Resend/Postmark keys
   - Admin setup token
   - Cron secret
   - RateHawk API credentials
   - Sentry DSN (valgfritt, men anbefalt)

2. **Fjern sensitiv git historikk:**
   ```bash
   # ADVARSEL: Dette omskriver git historikk!
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Eller bruk BFG Repo Cleaner (raskere):
   # https://rtyley.github.io/bfg-repo-cleaner/
   bfg --delete-files .env.local
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

3. **Force push til remote (OBS: koordiner med team):**
   ```bash
   git push origin --force --all
   git push origin --force --tags
   ```

### Fremtidig secrets management

- **ALDRI** commit `.env*` filer
- Bruk `.env.local.example` som template
- I produksjon: bruk miljøvariabler via hosting platform (Vercel, Railway, etc.)
- Vurder å bruke secrets management som AWS Secrets Manager, Vault, eller Doppler

## 🛡️ Sikkerhetskonfigurasjon

### Før produksjonsdeploy - SJEKKLISTE:

- [ ] Alle secrets er rotert
- [ ] `.gitignore` inkluderer `.env*`
- [ ] Git historikk er renset for secrets
- [ ] `trustHost: false` i NextAuth (prod)
- [ ] CSP policy er strammet til (fjern unsafe-*)
- [ ] Rate limiting er aktivert
- [ ] CORS er konfigurert riktig
- [ ] Database bruker separate dev/prod databaser
- [ ] Admin endpoints krever autentisering
- [ ] Webhook secrets er konfigurert
- [ ] HTTPS er påkrevd i produksjon

## 🚨 Rapportere sikkerhetsproblemer

Send epost til: kenneth@kksas.no

**IKKE** opprett offentlige GitHub issues for sikkerhetsproblemer.

## 📋 Sikkerhetsressurser

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/pages/building-your-application/configuring/content-security-policy)
- [Stripe Security](https://stripe.com/docs/security)
