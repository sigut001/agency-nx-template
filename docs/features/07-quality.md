# 💎 07 - Quality & Performance

Der Unterschied zwischen einer Webseite, die "funktioniert", und einer, die "exzellent" ist.

## Lighthouse & Performance 🏗️

### Beschreibung

Automatisierte Prüfung der Core Web Vitals (LCP, FID, CLS) in der Pipeline. Ziel ist ein Score > 90 in allen Kategorien.

### Offene Fragen

- Integrieren wir Lighthouse CI als "Quality Gate", das den Build bei schlechten Werten abbricht?
- Sollen wir Critical CSS Inlining automatisiert für alle CMS-Seiten aktivieren?

---

## Accessibility (A11y) ❌

### Beschreibung

Einhaltung der WCAG 2.1 Standards, um die Webseite für Menschen mit Einschränkungen zugänglich zu machen.

### Offene Fragen

- Integrieren wir `pa11y-ci` als harten Stop in die Build-Pipeline?
- Wie schulen wir die Content-Manager im CMS, damit Bilder immer Alt-Texte erhalten?

---

## Security Scanning ❌

### Beschreibung

Automatisierte Suche nach Sicherheitslücken in Abhängigkeiten (Audit) und im laufenden Code via SAST/DAST Tools.

### Offene Fragen

- Nutzen wir GitHub Dependabot oder spezialisierte Tools wie Snyk oder OWASP ZAP?

---

## Technische Validierung & Pipeline

Qualitätssicherung ist ein mehrstufiger Prozess in der Pipeline:

- **Security Scan**: [Phase 04](../../scripts-new/04-build-and-test-deploy/README.md#04-build-and-test-deploy_a0-validate-code-safetyts) prüft auf unsichere Code-Muster.
- **Funktionale Abnahme**: [Phase 04](../../scripts-new/04-build-and-test-deploy/README.md#04-build-and-test-deploy_c1-run-e2e-teststs) führt Playwright E2E-Tests gegen ein Preview-Deployment durch.
- **Performance-Audit**: [Phase 05](../../scripts-new/05-performance-audit-and-report/README.md) generiert den finalen Qualitäts-Bericht (`FINAL_SUMMARY.md`) via Lighthouse.
