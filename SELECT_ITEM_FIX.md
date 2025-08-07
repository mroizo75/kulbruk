# Select.Item Feil - Løsning

## 🐛 **Problemet**
```
A <Select.Item /> must have a value prop that is not an empty string. 
This is because the Select value can be set to an empty string to clear 
the selection and show the placeholder.
```

## ✅ **Løsningen**

### 1. **Endret tomme strenger til beskrivende verdier**

**Før:**
```tsx
<SelectItem value="">Alle merker</SelectItem>
<SelectItem value="">Alle modeller</SelectItem>
<SelectItem value="">Alle områder</SelectItem>
<SelectItem value="">Alle</SelectItem>
```

**Etter:**
```tsx
<SelectItem value="alle_merker">Alle merker</SelectItem>
<SelectItem value="alle_modeller">Alle modeller</SelectItem>
<SelectItem value="alle_omrader">Alle områder</SelectItem>
<SelectItem value="alle_drivstoff">Alle</SelectItem>
```

### 2. **Oppdatert updateFilter logikk**

```tsx
const updateFilter = (key: keyof CarSearchFilters, value: any) => {
  // Håndter "alle_*" verdier som undefined
  const alleVerdier = [
    'alle_merker', 'alle_modeller', 'alle_omrader', 'alle_drivstoff',
    'alle_girkasser', 'alle_aarganger', 'alle_priser'
  ]
  
  const actualValue = alleVerdier.includes(value) ? undefined : value
  setFilters(prev => ({ ...prev, [key]: actualValue }))
  
  // Update available models when make changes
  if (key === 'make') {
    setSelectedModels(carModels[actualValue] || [])
    setFilters(prev => ({ ...prev, model: undefined }))
  }
}
```

### 3. **Oppdatert Select value props**

**Før:**
```tsx
<Select value={filters.make || ''} onValueChange={(value) => updateFilter('make', value)}>
```

**Etter:**
```tsx
<Select value={filters.make || 'alle_merker'} onValueChange={(value) => updateFilter('make', value)}>
```

## 🎯 **Fordeler med denne løsningen**

### ✅ **Shadcn/ui Compliance**
- Ingen tomme strenger som `value` props
- Følger komponentens design-prinsipper
- Unngår placeholder-kollisjon

### ✅ **Semantisk Klarhet**
- `'alle_merker'` er mer beskrivende enn `''`
- Lettere å debugge og vedlikeholde
- Tydeligere intent i koden

### ✅ **Konsistent API**
- `undefined` verdier i filters (som før)
- Samme filtrering-logikk på backend
- Ingen endringer nødvendig i API

### ✅ **Brukeropplevelse**
- Select-bokser viser riktig valgte verdier
- "Alle merker" fremstår som aktivt valg
- Ingen visuell forskjell for brukeren

## 🔄 **Flyt**

1. **Bruker velger "Alle merker"** → `value="alle_merker"`
2. **updateFilter kjører** → Konverterer til `undefined`
3. **Filter sendes til API** → `{ make: undefined }`
4. **API ignorerer undefined** → Ingen make-filter
5. **Resultater** → Alle merker inkluderes

## 📁 **Filer som ble endret**

- ✅ `src/components/car-search.tsx` - Bil-spesifikke filtere
- ✅ `src/components/advanced-filters.tsx` - Hadde allerede riktig logikk

## 🧪 **Testing**

```bash
# Ingen linter-feil
✅ src/components/car-search.tsx - Ingen feil
✅ src/components/advanced-filters.tsx - Ingen feil

# Siden laster uten feil
✅ /annonser/bil - Fungerer
✅ CarSearch komponenten - Fungerer
```

---

**🎉 Resultat: Shadcn/ui Select komponenter fungerer nå uten feil!**
