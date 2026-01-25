# Fjern docs/ og test-filer fra Git

## ✅ STEG 1: .gitignore er oppdatert

`.gitignore` er allerede oppdatert til å ignorere:
- `/docs/` - Alle dokumentasjonsfiler
- `/markdown/` - Markdown drafts
- `/test/` - Test-filer
- `test.png` - Test-bilder
- `*.test.md`, `*.draft.md`, osv.

---

## 🔴 STEG 2: Fjern filer fra Git (MEN BEHOLD LOKALT)

**Kjør disse kommandoene i terminalen:**

```bash
# Fjern fra git tracking (filer blir værende på disk)
git rm --cached -r docs/
git rm --cached test.png

# Hvis du får "index.lock" feil, slett låse-filen først:
rm .git/index.lock

# Prøv igjen
git rm --cached -r docs/
git rm --cached test.png
```

---

## 📝 STEG 3: Commit endringene

```bash
# Legg til .gitignore endringen
git add .gitignore

# Commit
git commit -m "Fjern lokale dokumentasjonsfiler fra git tracking

- Oppdatert .gitignore til å ekskludere docs/, markdown/, test/
- Fjernet docs/ og test.png fra repository
- Filene er fortsatt tilgjengelig lokalt for utvikling"

# Push til GitHub
git push origin main
```

---

## ✅ VERIFISER

```bash
# Sjekk at docs/ ikke lenger er tracked
git ls-files docs/

# Skal returnere tomt (ingen output)
```

---

## 📋 Filer som blir fjernet fra git:

- `docs/EASYCRON_SETUP.md`
- `docs/MONITORING_SETUP.md`
- `docs/ratehawk-action-plan.md`
- `docs/systemsjekk-svar.md`
- `docs/systemsjekk.md`
- `test.png`

**VIKTIG:** Filene blir IKKE slettet fra din lokale disk, de blir bare fjernet fra git tracking!

---

## 🔒 Fremover

Nå vil alle nye filer i `docs/`, `markdown/`, `test/` automatisk bli ignorert av git.

Du kan trygt jobbe med dokumentasjon lokalt uten at det committes.
