# 🛫 FLYSELSKAP LOGOER - OPPSETT

Vi har funnet flere utmerkede kilder til flyselskap-logoer som kan brukes i prosjektet:

## 🎯 **ANBEFALTE KILDER:**

### 1. **[urbullet/iata-airelines-logos](https://github.com/urbullet/iata-airelines-logos)** ⭐ BESTE
- **1119 flyselskap-logoer** i PNG-format
- Navngitt etter **IATA-koder** (DY.png, SK.png, FR.png, etc.)
- Ferdig script for nedlasting
- Perfekt for vårt prosjekt!

### 2. **[Jxck-S/airline-logos](https://github.com/Jxck-S/airline-logos/tree/main/flightaware_logos)**
- FlightAware logoer
- Omfattende samling
- Høy kvalitet

### 3. **[milzer-tech/static-airlines](https://github.com/milzer-tech/static-airlines)**
- CSS-basert løsning
- Sprite-sheets
- 200+ flyselskaper

## 🚀 **RASK OPPSETT (ANBEFALT):**

### **Steg 1: Last ned logoer**
```bash
# Gå til public mappen
cd public

# Opprett flylogo mappe
mkdir flylogo

# Last ned urbullet repo
git clone https://github.com/urbullet/iata-airelines-logos.git temp-logos

# Kopier logoer til vår mappe
cd temp-logos/scripts/airlines-logos
cp *.png ../../../flylogo/

# Rens opp
cd ../../../
rm -rf temp-logos
```

### **Steg 2: Sjekk at logoene er der**
```bash
ls public/flylogo/
# Skal vise: DY.png, SK.png, FR.png, BA.png, etc.
```

## 📋 **VIKTIGE LOGOER FOR NORSKE RUTER:**

✅ **Norwegian (DY.png)**  
✅ **SAS (SK.png)**  
✅ **Ryanair (FR.png)**  
✅ **British Airways (BA.png)**  
✅ **Lufthansa (LH.png)**  
✅ **KLM (KL.png)**  
✅ **Air France (AF.png)**  
✅ **easyJet (U2.png)**  
✅ **Wizz Air (W6.png)**  

## 🔄 **FALLBACK-SYSTEM (ALLEREDE IMPLEMENTERT):**

Vårt system har 3-nivå fallback:

```javascript
1. /public/flylogo/{IATA_CODE}.png  (Lokal)
2. Daisycon API                     (Ekstern)
3. Fly-ikon SVG                     (Generisk)
```

## 🎨 **LOGO-FORMAT:**
- **Format:** PNG (transparent bakgrunn)
- **Størrelse:** 32x32px til 128x128px
- **Navngiving:** `{IATA_CODE}.png` (f.eks. `DY.png`)

## 🔧 **ALTERNATIV MANUAL NEDLASTING:**

Hvis automatisk nedlasting ikke fungerer:

1. Gå til: https://github.com/urbullet/iata-airelines-logos/tree/master/scripts/airlines-logos
2. Last ned individuelt:
   - DY.png (Norwegian)
   - SK.png (SAS) 
   - FR.png (Ryanair)
   - BA.png (British Airways)
   - LH.png (Lufthansa)
   - KL.png (KLM)
   - AF.png (Air France)
   - U2.png (easyJet)
   - W6.png (Wizz Air)

3. Plasser i `public/flylogo/` mappen

## ✅ **TESTING:**

Etter oppsett, test at logoene vises korrekt:
1. Gå til `/reiser`
2. Søk etter flyreiser (OSL → LHR)
3. Sjekk at riktige logoer vises for hvert flyselskap

---

**Kilder:**
- [urbullet/iata-airelines-logos](https://github.com/urbullet/iata-airelines-logos) - 1119 logoer
- [Jxck-S/airline-logos](https://github.com/Jxck-S/airline-logos) - FlightAware logoer  
- [milzer-tech/static-airlines](https://github.com/milzer-tech/static-airlines) - CSS sprites
