# Admin Setup - Kulbruk.no

## 🎯 3 måter å registrere admin med Clerk

### Metode 1: Første bruker blir automatisk admin ⭐ (Anbefalt)

**Den første personen som registrerer seg blir automatisk admin!**

1. Gå til: http://localhost:3000/sign-up
2. Registrer deg med din e-post (f.eks. kenneth@kksas.no)
3. Verifiser e-post i Clerk
4. Du blir automatisk admin! 🎉

### Metode 2: Hardkodede admin e-poster

Disse e-postene blir automatisk admin når de registrerer seg:
- `kenneth@kksas.no` (din e-post)
- `admin@kulbruk.no` 
- `kenneth@kulbruk.no`

**For å legge til flere admin e-poster:**
1. Rediger `src/lib/admin-setup.ts`
2. Legg til e-post i `ADMIN_EMAILS` array
3. Restart serveren

### Metode 3: Promover brukere via admin dashboard

**Hvis du allerede er admin kan du promovere andre:**

1. Gå til: http://localhost:3000/dashboard/admin/brukere
2. Finn brukeren du vil gjøre til admin
3. Klikk på "..." menyen til høyre
4. Velg "Admin" rolle

## 🔐 Tilgjengelige roller

- `admin` - Full tilgang til alt (kan godkjenne annonser, endre roller, osv.)
- `moderator` - Kan godkjenne annonser  
- `business` - Bedriftskonto (for forhandlere i fremtiden)
- `customer` - Vanlig bruker (standard)

## 🚀 Logg inn som Admin

1. Gå til: http://localhost:3000/sign-in
2. Bruk din admin e-post
3. Du blir automatisk dirigert til admin-dashboard på: http://localhost:3000/dashboard/admin

## 🧪 Test admin-funksjonalitet

### Admin Dashboard
- http://localhost:3000/dashboard/admin

### Godkjenn annonser  
- http://localhost:3000/dashboard/admin/annonser

### Brukeradministrasjon
- http://localhost:3000/dashboard/admin/brukere

## 🐛 Feilsøking

- Sørg for at serveren kjører på port 3000
- Sjekk at .env.local har riktige Clerk-nøkler
- Kontroller at database er tilgjengelig  
- Se server-logger for detaljer ved feil
- Hvis rolle ikke oppdateres: Refresh siden eller logg ut/inn