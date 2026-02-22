# Phase 04: Build, Injection & Preview Deployment

Dies ist die **"heiße Phase"** der Pipeline. Hier wird der eigentliche App-Build verarbeitet, mit den in Phase 03 erzeugten Metadaten verheiratet und auf einer temporären Test-Umgebung (Preview Channel) validiert.

## Zielsetzung

Überführung des Quellcodes in ein produktionsbereites Bundle und Verifizierung der Lauffähigkeit in einer produktionsnahen Umgebung (Firebase Hosting), bevor die Live-Seite angefasst wird.

## Skripte in dieser Phase

### [04-build-and-test-deploy_a0-validate-code-safety.ts](./04-build-and-test-deploy_a0-validate-code-safety.ts)

- **Hauptaufgabe**: Security Scan.
- **Details**: Prüft den gesamten Source-Code auf verbotene Patterns wie `dangerouslySetInnerHTML`.
- **Semantik**: Schutz vor XSS-Sicherheitslücken durch statische Analyse.

### [04-build-and-test-deploy_a0-validate-cookie-catalog.ts](./04-build-and-test-deploy_a0-validate-cookie-catalog.ts)

- **Hauptaufgabe**: Datenschutz-Check.
- **Details**: Verifiziert, dass der Cookie-Katalog (JSON) vorhanden und valide ist, damit der Consent-Banner korrekt funktionieren kann.

### [04-build-and-test-deploy_a1-inject-artifacts-to-dist.ts](./04-build-and-test-deploy_a1-inject-artifacts-to-dist.ts)

- **Hauptaufgabe**: "Verheiratung" von Code und Metadaten.
- **Details**:
  - Kopiert `sitemap.xml` und `robots.txt` in den `dist`-Ordner.
  - Mappt das React Router 7 Prerendering (`404/index.html`) auf die von Firebase erwartete `404.html`.
- **Semantik**: Vervollständigung des Build-Bundles mit dynamisch erzeugten SEO- und Infrastruktur-Files.

### [04-build-and-test-deploy_b1-firebase-preview-deploy.ts](./04-build-and-test-deploy_b1-firebase-preview-deploy.ts)

- **Hauptaufgabe**: Erstellung der Test-Umgebung.
- **Details**:
  - Deployt den aktuellen Stand auf einen temporären Firebase Preview Channel.
  - Speichert die generierte Preview-URL für die nachfolgenden E2E-Tests.
- **Semantik**: "Ein Sandkasten für die finale Abnahme."

### [04-build-and-test-deploy_c1-run-e2e-tests.ts](./04-build-and-test-deploy_c1-run-e2e-tests.ts)

- **Hauptaufgabe**: Funktionale Abnahme (Regression Testing).
- **Details**: Startet Playwright-Tests gegen die soeben erzeugte Preview-URL.
- **Semantik**: Automatisierte Bestätigung, dass die Seite im Browser wirklich so funktioniert, wie sie soll (inkl. Hydrierung, Routing, Klicks).

## Verknüpfte Features

- [04-DevOps](file:///c:/Users/Simon/Desktop/web-entwicklung/templates/agency-nx-template/docs/features/04-devops.md) (Abwicklung des Preview-Deployments)
- [06-Legal](file:///c:/Users/Simon/Desktop/web-entwicklung/templates/agency-nx-template/docs/features/06-legal.md) (Cookie-Katalog Validierung)
- [07-Quality](file:///c:/Users/Simon/Desktop/web-entwicklung/templates/agency-nx-template/docs/features/07-quality.md) (E2E Tests & Code Safety)
