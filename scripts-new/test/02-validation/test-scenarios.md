# Test-Szenarien: Phase 02 (Validierung & Integrity)

Diese Datei beschreibt manuelle Testfälle für Service-Validierung und Route-Integrity.

## Getestete Skripte

- `scripts-new/02-validation/` (g1, services)

---

## ✅ Positive Tests (Happy Path)

### Test 02-P1: Current State Integrity

**Voraussetzung:**

- System ist resettet und geseedet (Phase 01).
- Config, Code und DB sind synchron.

**Aktion:**

- Führe `npx tsx scripts-new/02-validation/02-validation_g1-dynamic-route-and-firestore-schema-integrity-check.ts` aus.

**Erwartetes Ergebnis:**

- **Status:** PASS (Exit Code 0)
- **Output:** "✨ INTEGRITY AUDIT PASSED: Single Source of Truth verified."

### Test 02-P2: Service Health Checks

**Aktion:**

- Führe `npx nx run @temp-nx/company-website:v2:init:validate:services` aus.

**Erwartetes Ergebnis:**

- **Status:** PASS
- **Checks:** Brevo, ImageKit, Recaptcha, Analytics melden Success.

---

## ❌ Negative Tests (Failure Scenarios)

### Test 02-N1: Code Mismatch (Missing Route in Code)

**Szenario:** Eine Route ist in der Config definiert, aber nicht im React-Router implementiert.
**Aktion:**

1. Füge in `app.routes.config.ts` eine neue Route hinzu:
   ```typescript
   { path: '/missing-page', title: 'Missing', type: 'static', collection: 'static_pages/missing' }
   ```
2. Führe `02_g1` aus.

**Erwartetes Ergebnis:**

- **Status:** FAIL (Exit Code 1)
- **Erkannter Fehler:** "❌ Code Mismatch: Route "/missing-page" not found in COMPONENT_MAP or explicit check."

### Test 02-N2: Database Mismatch (Missing Collection)

**Szenario:** Eine statische Route erwartet eine Collection, die in Firestore fehlt.
**Aktion:**

1. Lösche manuell das Dokument `static_pages/kontakt` in Firestore.
2. Führe `02_g1` aus.

**Erwartetes Ergebnis:**

- **Status:** FAIL
- **Erkannter Fehler:** "❌ Static Missing: /kontakt expects doc 'static_pages/kontakt' in Firestore."

### Test 02-N3: Schema Violation (Wrong Suffix)

**Szenario:** Eine dynamische Route nutzt nicht die vorgeschriebene `/documents` Endung.
**Aktion:**

1. Ändere in `app.routes.config.ts` die Collection für Blog zu `dynamic_pages/blog/items`.
2. Führe `02_g1` aus.

**Erwartetes Ergebnis:**

- **Status:** FAIL
- **Erkannter Fehler:** "❌ Invalid Naming: Dynamic route /blog/:slug collection MUST end with '/documents'"

### Test 02-N4: Service Credential Fail

**Szenario:** Ein API Key ist falsch.
**Aktion:**

1. Ändere lokal `BREVO_API_KEY` zu einem ungültigen Wert.
2. Führe `02_a1` (Brevo Health) aus.

**Erwartetes Ergebnis:**

- **Status:** FAIL
- **Erkannter Fehler:** "❌ Brevo API Check failed." (HTTP 401 Unauthorized)
