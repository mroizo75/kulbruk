# Stripe Integrasjon - Oppsettguide

Dette dokumentet forklarer hvordan du setter opp Stripe for betalingsløsningen i Kulbruk.no.

## 🚀 Trinn 1: Opprett Stripe-konto

1. Gå til [https://stripe.com](https://stripe.com)
2. Registrer en ny konto eller logg inn
3. Aktiver Business-konto for Norge
4. Fullfør verifikasjonsprosessen

## 🔑 Trinn 2: Hent API-nøkler

### Test Environment
1. Gå til Stripe Dashboard → Developers → API keys
2. Kopier **Publishable key** (pk_test_...)
3. Kopier **Secret key** (sk_test_...)

### Legg til i .env.local:
```env
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

## 💰 Trinn 3: Opprett produkter og priser

### Bil-annonse (engangsgebyr)
1. Gå til Products → Add product
2. **Navn**: "Bil-annonse"
3. **Beskrivelse**: "Gebyr for bil-annonse (1 måned)"
4. **Pricing**: One-time, 49.00 NOK
5. Kopier Price ID

### Business Basic (abonnement)
1. Products → Add product
2. **Navn**: "Business Basic"
3. **Beskrivelse**: "5 bil-annonser per måned"
4. **Pricing**: Recurring, 99.00 NOK, Monthly
5. Kopier Price ID

### Business Standard (abonnement)
1. Products → Add product
2. **Navn**: "Business Standard" 
3. **Beskrivelse**: "10 bil-annonser per måned"
4. **Pricing**: Recurring, 199.00 NOK, Monthly
5. Kopier Price ID

### Legg til i .env.local:
```env
STRIPE_BASIC_PRICE_ID="price_..."
STRIPE_STANDARD_PRICE_ID="price_..."
```

## 🔔 Trinn 4: Webhook-oppsett

### Opprett webhook endpoint
1. Gå til Webhooks → Add endpoint
2. **URL**: `https://ditt-domene.no/api/webhooks/stripe`
3. **Beskrivelse**: "Kulbruk Payment Events"

### Velg events å lytte på:
```
payment_intent.succeeded
payment_intent.payment_failed
invoice.payment_succeeded
invoice.payment_failed
customer.subscription.updated
customer.subscription.deleted
```

### Kopier webhook secret
1. Klikk på webhook endpointet
2. Kopier **Signing secret** (whsec_...)

### Legg til i .env.local:
```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## 🧪 Trinn 5: Test betalinger

### Test med Stripe test cards:
- **Vellykket**: `4242 4242 4242 4242`
- **Mislykket**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`

### Ekspirasjonsdato: Hvilken som helst fremtidig dato
### CVC: Hvilken som helst 3-sifret kode

## 🔄 Trinn 6: Database migrasjon

Kjør database migrasjon for å opprette betalingstabeller:

```bash
npx prisma db push
```

## ✅ Trinn 7: Test hele flyten

1. **Opprett bil-annonse** → Betalingsskjema skal vises
2. **Fullfør betaling** → Annonse skal publiseres
3. **Opprett bedriftskonto** → Abonnementsskjema skal vises
4. **Velg abonnement** → Recurring payment skal starte

## 🚨 Produksjon

### For å gå live:
1. Aktiver live mode i Stripe Dashboard
2. Oppdater API-nøkler til live keys (pk_live_, sk_live_)
3. Oppdater webhook URL til produksjonsdomenet
4. Test med ekte betalingskort

## 💡 Viktige notater

- **Sikkerhet**: Aldri eksponér secret keys på frontend
- **Webhooks**: Verifiser alltid webhook signatures
- **Testing**: Test alle betalingsflyten før produksjon
- **Logging**: Stripe Dashboard viser alle transaksjoner og events

## 🛠️ Feilsøking

### Vanlige problemer:
1. **Webhook feil**: Sjekk at URL er tilgjengelig og HTTPS
2. **API key feil**: Sjekk at test/live mode matcher
3. **Price ID feil**: Sjekk at Price ID eksisterer i riktig mode

### Debug-kommandoer:
```bash
# Test API connection
curl -X GET https://api.stripe.com/v1/products \
  -u sk_test_...:

# Sjekk webhook events
stripe logs tail --live
```

## 📞 Support

- **Stripe Support**: [https://support.stripe.com](https://support.stripe.com)
- **Kulbruk Support**: [kontakt-oss](/kontakt-oss)
- **Dokumentasjon**: [https://stripe.com/docs](https://stripe.com/docs)
