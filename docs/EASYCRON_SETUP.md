# EasyCron Setup Guide for Kulbruk

EasyCron er en dedikert cron-as-a-service løsning som er enkel å sette opp og meget pålitelig.

## 🌟 Fordeler
- ✅ Dedikert cron service (99.9% uptime)
- ✅ Webgui for administrasjon  
- ✅ Innebygd retry og feilhåndtering
- ✅ E-post varsling ved feil
- ✅ Logging og statistikk
- ✅ Gratis tier: 25 cron jobs

## 💰 Priser
- **Gratis:** 25 jobs, 100 executions/dag
- **Basic ($3/mnd):** 100 jobs, 1000 executions/dag  
- **Pro ($9/mnd):** 500 jobs, 5000 executions/dag

## 🚀 Setup instruksjoner

### 1. Registrer på EasyCron
Gå til https://www.easycron.com og opprett konto

### 2. Opprett Fort gjort timeout job
```
Name: Kulbruk Fort gjort Timeout
URL: https://kulbruk.no/api/cron/fort-gjort-timeout
Cron Expression: 15 * * * * (hver time på minutt 15)
HTTP Method: GET
Request Headers:
  Authorization: Bearer {CRON_SECRET}
  Content-Type: application/json
  User-Agent: EasyCron-Kulbruk/1.0
Timeout: 300 seconds
Retry: 3 attempts
Notification: Email on failure
```

### 3. Opprett backup timeout job
```
Name: Kulbruk Fort gjort Backup  
URL: https://kulbruk.no/api/cron/fort-gjort-timeout
Cron Expression: 0 8,20 * * * (kl 08:00 og 20:00 UTC)
HTTP Method: GET
Request Headers:
  Authorization: Bearer {CRON_SECRET}
  Content-Type: application/json
Timeout: 300 seconds
Retry: 2 attempts
Notification: Email on failure
```

### 4. Opprett Saved Search Digest job
```
Name: Kulbruk Saved Search Digest
URL: https://kulbruk.no/api/cron/saved-search-digest  
Cron Expression: 15 8 * * * (daglig kl 08:15 UTC)
HTTP Method: GET
Request Headers:
  Authorization: Bearer {CRON_SECRET}
  Content-Type: application/json
Timeout: 600 seconds
Retry: 2 attempts
Notification: Email on failure
```

### 5. Opprett Listings Expiring job
```
Name: Kulbruk Listings Expiring
URL: https://kulbruk.no/api/cron/listings-expiring
Cron Expression: 30 9 * * * (daglig kl 09:30 UTC)  
HTTP Method: GET
Request Headers:
  Authorization: Bearer {CRON_SECRET}
  Content-Type: application/json
Timeout: 300 seconds
Retry: 2 attempts
Notification: Email on failure
```

## 📊 Overvåking

EasyCron gir deg automatisk:
- ✅ Execution history og logs
- ✅ Success/failure statistikk  
- ✅ E-post varsling ved feil
- ✅ Webhook notifications (valgfritt)
- ✅ API for å sjekke job status

## 🔧 Avansert konfigurasjon

### Webhook notifications
Du kan sette opp webhook som sender til Slack/Discord:
```
Webhook URL: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
Content-Type: application/json
Body: {"text": "🚨 Kulbruk cron job {{job_name}} failed: {{failure_reason}}"}
```

### API integration
EasyCron har REST API for programmatisk administrasjon:
```bash
# Sjekk job status
curl -H "token: YOUR_API_TOKEN" \
  "https://www.easycron.com/rest/detail?id=JOB_ID"

# Trigger job manuelt  
curl -H "token: YOUR_API_TOKEN" \
  "https://www.easycron.com/rest/trigger?id=JOB_ID"
```

## ✅ Fordeler vs andre løsninger

| Feature | EasyCron | GitHub Actions | VPS Cron |
|---------|----------|----------------|-----------|
| Setup kompleksitet | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Pålitelighet | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Overvåking | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Kostnad | $3-9/mnd | Gratis* | Server kost |
| Vedlikehold | Null | Minimalt | Kontinuerlig |

*GitHub Actions har 2000 min/mnd gratis

## 🎯 Anbefaling
For Kulbruk anbefaler jeg **EasyCron Basic ($3/mnd)** fordi:
- Kritisk for Fort gjort betalinger
- Profesjonell overvåking 
- Null vedlikehold
- Meget pålitelig
- Billig forsikring for business-critical funktionalitet
