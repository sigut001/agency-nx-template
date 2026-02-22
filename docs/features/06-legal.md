# ⚖️ 06 - Legal & Compliance

Sicherheit und Rechtssicherheit sind keine "Add-ons", sondern müssen tief in der Architektur verankert sein (Privacy by Design).

## Cookie Consent (v3) 🏗️

### Beschreibung

Integration von `vanilla-cookieconsent` v3. Das System folgt dem **"Factory Pattern"**:

- **Logik**: Kennt alle möglichen Dienste (Katalog).
- **Konfiguration**: Schaltet Dienste pro Projekt aktiv/inaktiv (`project.config.json`).
  Dies verhindert manuelle Fehler beim Einbinden von Skripten.

### Test-Automatisierung

Wir generieren automatisch Tests gegen eine **Consent-Matrix**:

- Wenn ein Dienst aktiv ist, aber abgelehnt wird -> Keine Cookies.
- Wenn ein Dienst inaktiv ist, aber zugestimmt wird -> Keine Cookies (Sicherheits-Check gegen Code-Leichen).

### Offene Fragen

- Wie garantieren wir, dass neue NPM-Pakete automatisch in den Scan/die Liste der Cookies aufgenommen werden?
- Sollen wir für verschiedene Regionen (EU vs. USA) unterschiedliche Consent-Level anbieten?

---

## Impressum & Datenschutz ✅

### Beschreibung

Vorkonfigurierte Routen und Komponenten für rechtlich notwendige Seiten. Texte sind über das CMS pflegbar.

---

## Härtung (Security Headers) 🏗️

### Beschreibung

Konfiguration strikter HTTP-Security-Header in der `firebase.json` (CSP, HSTS, X-Frame-Options). Ziel ist ein A+ Rating bei `securityheaders.com`.

### Offene Fragen

- Wie restriktiv können wir die CSP setzen, ohne YouTube/GTM zu blockieren?

---

## Technische Validierung & Pipeline

Rechtliche Anforderungen werden automatisiert geprüft:

- **Lizenz-Reporting**: [Phase 03](../../scripts-new/03-preparation/README.md#03-preparation_c1-generate-license-reportts) generiert den Drittanbieter-Report und spiegelt ihn direkt in die Live-Datenbank.
- **Cookie-Check**: [Phase 04](../../scripts-new/04-build-and-test-deploy/README.md#04-build-and-test-deploy_a0-validate-cookie-catalogts) validiert die Integrität des Cookie-Katalogs vor dem Build.
- **E2E Consent-Test**: [Phase 04](../../scripts-new/04-build-and-test-deploy/README.md#04-build-and-test-deploy_c1-run-e2e-teststs) verifiziert die funktionale Einhaltung der Cookie-Entscheidungen im Browser.
