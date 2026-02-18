# 📋 Next Steps: Compliance, Security & Architecture

Dieses Dokument definiert die verbleibenden Aufgaben zur Finalisierung der Plattform-Architektur.

---

## 1. Cookie Consent (DSGVO/GDPR)

- **Status:** 🧠 Konzept erstellt (`docs/concepts/COOKIE_CONSENT_ARCHITECTURE.md`).
- **Strategie:** "Factory Pattern" (Feature Flags statt manueller Texte).
- **Testing:** "Test-Scenario-as-Code" (Tests kommen aus der Definition).
- **Library:** `vanilla-cookieconsent` (v3).

### 📝 To-Do / Implementierung

- [ ] **Data:** `src/data/legal/cookie-catalog.ts` anlegen.
  - Muss Interface `CookieDefinition` inklusive `testScenario` (Erwartete Cookies, Trigger) enthalten.
- [ ] **Wrapper:** React-Komponente (`CookieBanner.tsx`) erstellen, die Feature-Flags liest.
- [ ] **E2E Automation:** `tests/cookies.spec.ts` erstellen.
  - Liest `project.config.json`.
  - Generiert dynamisch Tests für _jedes_ aktive Feature (Block-Check vor Consent, Allow-Check nach Consent).
- [ ] **Integration:** Einbindung in `App.tsx`.

---

## 2. Lizenz-Nachweis (Legal)

### 🎯 Ziel

Automatische Generierung einer `licenses.txt`, die alle NPM-Pakete auflistet.

### 📝 To-Do

- [ ] **Script:** `generate-license-file` in `package.json` einbinden.
- [ ] **Build-Hook:** Vor dem Build ausführen.
- [ ] **Footer:** Link einfügen.
- [ ] **E2E:** Validierung in `golden-scan.spec.ts`.

---

## 3. Security Headers (Firebase / CSP)

### 🎯 Ziel

Härtung der App via `firebase.json` headers (CSP, HSTS).

### 📝 To-Do

- [ ] **Update `firebase.json`:** "Permissive Template" (YouTube/Google friendly) einfügen.
- [ ] **Test:** Deployment auf Preview Channel & Prüfung via `securityheaders.com`.

---

## 4. Favicon Automatisierung & Brand Identity

### 🎯 Ziel

Kein Projekt geht mit Standard-Icons live.

### 📝 To-Do

- [ ] **E2E Hash-Check:** Test schreibt Fehler, wenn das Icon noch den Hash des Templates hat.
- [ ] **Prompting:** AI-Instruktion zur Generierung beim Setup.

---

## 5. Workflow Architektur (Abstraktion)

### 🎯 Ziel

Trennung von Core-Logik (gilt immer) und Projekt-Logik.

### 📝 To-Do

- [ ] **Init-Workflow:** `init-check.yml` (nur beim Setup).
- [ ] **Reusable Workflows:** `core-pipeline.yml` vs. `project-pipeline.yml`.

---

## 6. Erweiterte Web-Quality Automation

### 🎯 Ziel

Tiefere Prüfung als nur Lighthouse.

### 📝 To-Do

- [ ] **Accessibility:** `pa11y-ci` integrieren.
- [ ] **Security:** `OWASP ZAP` Action integrieren.
- [ ] **Bundle Size:** Warn-Limits in Vite Config.

---

## 7. Backup & Disaster Recovery (Firebase)

### 🎯 Ziel

Datensicherheit für Firestore.

### 📝 To-Do

- [ ] **Planung:** Blaze Plan Voraussetzung dokumentieren.
- [ ] **Setup:** Skript/CLI-Command für PITR-Aktivierung bereitstellen.

---

## 8. Rechtliches: AV-Verträge (DPA) Management

### 🎯 Ziel

Verwaltung der Kunden-Verträge ohne Datenschutz-Verstöße im Repo.

### 📝 To-Do

- [ ] **Requirements-Doku:** `docs/legal/requirements.md` anlegen (Checkliste für notwendige Verträge).
- [ ] **Prozess:** Definition, wo unterschriebene PDFs liegen (extern!).
