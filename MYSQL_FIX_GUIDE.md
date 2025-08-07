# MySQL sha256_password Fix Guide

## Problem
Feilen `Unknown authentication plugin 'sha256_password'` oppstår fordi MySQL 8.0+ bruker `sha256_password` som standard autentisering, men mange klienter (inkludert Prisma) støtter kun `mysql_native_password`.

## Løsninger

### Løsning 1: Endre DATABASE_URL (Anbefalt)
Legg til `authPlugin` i connection string:

```env
DATABASE_URL="mysql://user:password@host:port/database?authPlugin=mysql_native_password"
```

### Løsning 2: Oppdater MySQL bruker (Hvis du har admin-tilgang)
Koble til MySQL som admin:

```sql
-- Endre eksisterende bruker
ALTER USER 'kulbruk_user'@'%' IDENTIFIED WITH mysql_native_password BY 'ditt_passord';

-- Eller opprett ny bruker
CREATE USER 'kulbruk_user'@'%' IDENTIFIED WITH mysql_native_password BY 'ditt_passord';
GRANT ALL PRIVILEGES ON kulbruk_db.* TO 'kulbruk_user'@'%';
FLUSH PRIVILEGES;
```

### Løsning 3: MySQL 8.0 kompatibilitet
Hvis du bruker MySQL 8.0+, legg til i my.cnf:

```ini
[mysqld]
default-authentication-plugin=mysql_native_password
```

## For PlanetScale/Vercel/Hosting-tjenester

### PlanetScale
PlanetScale bruker `mysql_native_password` som standard, så dette bør ikke være et problem.

### Vercel MySQL
Bruk denne connection string format:
```env
DATABASE_URL="mysql://username:password@hostname:port/database?sslaccept=strict&authPlugin=mysql_native_password"
```

### Railway/DigitalOcean
Legg til `?authPlugin=mysql_native_password` i DATABASE_URL.

## Test tilkobling
Kjør for å teste:

```bash
npx prisma db pull
```

Hvis det fungerer, kjør:
```bash
npx prisma generate
npx prisma db push
```

## Alternativ: Bytt til PostgreSQL
Hvis MySQL fortsatt skaper problemer, vurder å bytte til PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
