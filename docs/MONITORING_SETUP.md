# Kulbruk Cron Monitoring Setup

## 🔔 Slack Webhooks for varsling

### Opprett Slack Webhook
1. Gå til Slack App Directory
2. Søk på "Incoming Webhooks"  
3. Add to Slack → Choose channel (#alerts)
4. Kopier Webhook URL

### Legg til GitHub Secret
```
SLACK_WEBHOOK_URL: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### Test Slack webhook
```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"🧪 Test melding fra Kulbruk cron monitoring"}' \
  YOUR_SLACK_WEBHOOK_URL
```

## 📧 E-post varsling (fallback)

### SendGrid/Postmark integration
Legg til i GitHub Secrets:
```
EMAIL_FROM: alerts@kulbruk.no
EMAIL_TO: admin@kulbruk.no
SENDGRID_API_KEY: din_sendgrid_key
```

## 📊 Cron job health endpoint

Lag et dashboard endpoint for å sjekke cron job status:

```
GET /api/admin/cron-status
→ Viser siste kjøring av alle cron jobs
→ Health check for overvåking
```

## 🚨 Critical alerts

**Umiddelbar varsling ved:**
- Fort gjort timeout feilet > 2 ganger
- Saved search digest ikke kjørt på 25 timer  
- Listings expiring ikke kjørt på 25 timer

**Daglig rapport:**
- Antall Fort gjort ordrer behandlet
- Antall e-poster sendt
- Antall annonser som utløper snart

## 📈 Metrics som bør overvåkes

1. **Fort gjort timeout:**
   - Antall ordrer behandlet
   - Antall automatiske utbetalinger
   - Antall utløpte ordrer
   - Response time

2. **Saved search digest:**
   - Antall brukere som fikk e-post
   - Antall nye annonser i digest
   - E-post delivery rate

3. **Listings expiring:**
   - Antall annonser som utløper snart
   - Antall varsler sendt
   - Response time

## ⚡ Quickstart

1. **Legg til Slack webhook i GitHub Secrets**
2. **Oppdater `.github/workflows/all-crons.yml`:**

```yaml
      - name: Send failure notification  
        run: |
          curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"🚨 Kulbruk Fort gjort timeout feilet! Sjekk umiddelbart."}' \
            ${{ secrets.SLACK_WEBHOOK_URL }}
```

3. **Test at alt fungerer:**
   - Trigger manuell GitHub Action
   - Sjekk at Slack får melding ved feil
   - Verifiser at alle 3 cron jobs kjører som forventet
