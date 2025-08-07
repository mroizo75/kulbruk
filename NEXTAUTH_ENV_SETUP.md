# NextAuth Miljøvariabler Setup

Opprett en `.env.local` fil i rot-mappen med følgende variabler:

## Påkrevde variabler

```env
# NextAuth konfiguration
NEXTAUTH_SECRET=generate-a-random-secret-key-here
NEXTAUTH_URL=http://localhost:3008

# Database
DATABASE_URL="mysql://username:password@localhost:3306/kulbruk"
```

## Valgfrie OAuth providers

### Google OAuth
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### GitHub OAuth
```env
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
```

### Email provider (for magic links)
```env
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=username
EMAIL_SERVER_PASSWORD=password
EMAIL_FROM=noreply@kulbruk.no
```

## Eksisterende variabler som beholdes

```env
# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Amadeus (for flyreiser)
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
```

## Generer NEXTAUTH_SECRET

Du kan generere en tilfeldig secret med:

```bash
openssl rand -base64 32
```

eller bruk online generator som https://generate-secret.vercel.app/32

## OAuth Setup

### Google OAuth Setup
1. Gå til [Google Cloud Console](https://console.cloud.google.com/)
2. Opprett nytt prosjekt eller velg eksisterende
3. Aktiver Google+ API
4. Opprett OAuth 2.0 credentials
5. Legg til `http://localhost:3008/api/auth/callback/google` som redirect URI

### GitHub OAuth Setup
1. Gå til GitHub Settings > Developer settings > OAuth Apps
2. Opprett ny OAuth App
3. Sett Authorization callback URL til `http://localhost:3008/api/auth/callback/github`
