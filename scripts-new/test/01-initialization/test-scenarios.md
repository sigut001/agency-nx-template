# Test-Szenarien: Phase 01 (Initialisierung)

Diese Datei beschreibt manuelle Testfälle für Reset, Seeding und Secret-Sync.

## Getestete Skripte

- `scripts-new/01-initialization/` (Wipe, Seed, Sync)

---

## ✅ Positive Tests (Happy Path)

### Test 01-P1: Full Reset & Seeding

**Voraussetzung:**

- `.env` ist valide.
- Firestore enthält irrelevante Daten (wird gelöscht).

**Aktion:**

- Führe `npx nx run @temp-nx/company-website:v2:init:seeding:validate` aus.

**Erwartetes Ergebnis:**

- **Reset:** Alle Collections gelöscht, User gelöscht.
- **Seeding:** Admin angelegt, Static Pages angelegt.
- **Validation:** "Validation Success" für Seeding.
- **Status:** PASS

### Test 01-P2: Secret Sync Verification

**Voraussetzung:**

- `v2:init:seeding:validate` erfolgreich durchlaufen.
- GitHub Secrets existieren (oder werden neu angelegt).

**Aktion:**

- Führe `npx nx run @temp-nx/company-website:v2:init:sync-secrets:validate` aus.

**Erwartetes Ergebnis:**

- **Sync:** Keys werden zu GitHub hochgeladen.
- **Verify:** "Success: Secret ... verified."
- **Status:** PASS

---

## ❌ Negative Tests (Failure Scenarios)

### Test 01-N1: Validation failed after Wipe

**Szenario:** Der Wipe läuft durch, aber Firestore ist nicht leer (z.B. manuelle Interaktion während des Skripts).
**Aktion:**

- Führe `01_a1` (Wipe) aus.
- **Simuliere Fehler:** Lege manuell eine Collection `test_fail` in der Firebase Console an.
- Führe `01_b1` (Validate Wipe) aus.

**Erwartetes Ergebnis:**

- **Status:** FAIL (Exit Code 1)
- **Erkannter Fehler:** "❌ Error: Firestore is not empty."

### Test 01-N2: Corrupt Seeding Config

**Szenario:** Die Config `app.routes.config.ts` ist invalide oder Seeding schlägt fehl.
**Aktion:**

- Ändere temporär in `01_c1` Skript den Pfad zur Config auf eine nicht-existente Datei.
- Führe Seed-Skript aus.

**Erwartetes Ergebnis:**

- **Status:** FAIL
- **Grund:** Typescript-Fehler oder File Not Found.

### Test 01-N3: Secret Mismatch (Verify Only)

**Szenario:** Ein Secret in GitHub stimmt nicht mit `.env` überein (und Sync wurde übersprungen oder schlug fehl).
**Aktion:**

- Ändere lokal einen Wert in `.env` (z.B. `ADMIN_EMAIL`).
- Führe NUR das Verifikations-Skript `01_f1` aus (ohne vorherigen Sync).

**Erwartetes Ergebnis:**

- **Status:** FAIL (Exit Code 1)
- **Erkannter Fehler:** "❌ Mismatch: Secret ADMIN_EMAIL differs from local env."
