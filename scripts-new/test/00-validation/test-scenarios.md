# Test-Szenarien: Phase 00 (Environment Validation)

Diese Datei beschreibt manuelle Testfälle, um die Robustheit der `00-validation`-Skripte zu prüfen.

## Getestete Skripte

- `scripts-new/00-validation/00-validation_a1-validate-environment.ts`

---

## ✅ Positive Tests (Happy Path)

### Test 00-P1: Vollständige .env Datei

**Voraussetzung:**

- Eine `.env` Datei existiert im Root.
- Alle benötigten Keys (laut Skript) sind vorhanden und syntaktisch korrekt.

**Aktion:**

- Führe `npx tsx scripts-new/00-validation/00-validation_a1-validate-environment.ts` aus.

**Erwartetes Ergebnis:**

- **Status:** PASS (Exit Code 0)
- **Output:** "✨ ENVIRONMENT GUARD PASSED: All 3-tier configurations (including Flattened Firebase Admin) verified."

---

## ❌ Negative Tests (Failure Scenarios)

### Test 00-N1: Fehlende .env Datei

**Aktion:**

- Benenne `.env` kurzzeitig um (z.B. `.env.bak`).
- Führe Skript aus.

**Erwartetes Ergebnis:**

- **Status:** FAIL (Exit Code 1)
- **Erkannter Fehler:** "❌ CRITICAL ERROR: .env file is missing at root."

### Test 00-N2: Fehlender Required Key

**Aktion:**

- Kommentiere `VITE_FIREBASE_API_KEY` in der `.env` aus.
- Führe Skript aus.

**Erwartetes Ergebnis:**

- **Status:** FAIL (Exit Code 1)
- **Erkannter Fehler:** "❌ MISSING: VITE_FIREBASE_API_KEY (Firebase API Key)"

### Test 00-N3: Ungültiges Format (Regex Check)

**Aktion:**

- Ändere `VITE_FIREBASE_API_KEY` zu einem ungültigen Wert (z.B. "123").
- Das Pattern `/^AIza[0-9A-Za-z_-]{35}$/` muss fehlschlagen.
- Führe Skript aus.

**Erwartetes Ergebnis:**

- **Status:** FAIL (Exit Code 1)
- **Erkannter Fehler:** "❌ INVALID FORMAT: VITE_FIREBASE_API_KEY"
- **Grund:** "Does not match expected pattern"

### Test 00-N4: Ungültiger Private Key (Custom Check)

**Aktion:**

- Entferne `-----BEGIN PRIVATE KEY-----` aus `FIREBASE_ADMIN_PRIVATE_KEY`.
- Führe Skript aus.

**Erwartetes Ergebnis:**

- **Status:** FAIL (Exit Code 1)
- **Erkannter Fehler:** "❌ INVALID CONTENT: FIREBASE_ADMIN_PRIVATE_KEY"
- **Grund:** "Custom validation failed"
