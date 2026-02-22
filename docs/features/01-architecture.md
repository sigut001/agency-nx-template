# 🏗️ 01 - Basistechnologie & Architektur

Das Fundament, auf dem alle anderen Schichten dieses Projekts aufbauen. Hier geht es um Skalierbarkeit, Typsicherheit und standardisierte Entwicklungsabläufe.

## Monorepo (Nx) & TypeScript ✅

### Beschreibung

Wir nutzen **Nx** zur effizienten Verwaltung von Applikationen und Libraries in einem einzigen Repository. Dies ermöglicht:

- **Code-Sharing**: Gemeinsame Logik (z.B. API-Clients, Validierungsschemas) kann in Libs ausgelagert werden.
- **Dependency Management**: Klare Regeln, welche App was nutzen darf.
- **Performance**: Nx führt nur die Tasks (Build, Test) für die betroffenen Codeteile aus.
  **TypeScript** ist im gesamten Stack (Apps, Libs, Scripts) als Standard für Typsicherheit gesetzt.

---

### Vorteile für unsere Pipeline

- **Eindeutigkeit**: Ein Docker-Image stellt sicher, dass auf deinem lokalen PC und im GitHub Action Runner exakt dieselbe Umgebung besteht (Linux).
- **Playwright Stabilität**: Browser-Automatisierung läuft im optimierten Linux-Image ohne Host-Abhängigkeiten.
- **Workflow-Reproduzierbarkeit**: Fehler können im Container lokal debuggt werden.

### Implementierung (WF-2) ✅

Wir nutzen ein zentrales [Dockerfile](../../Dockerfile) basierend auf Microsoft Playwright. Die Ausführung erfolgt über das [Docker-Pipeline Script](../../scripts-new/docker-pipeline.ps1).

---

## Component Library Foundation 🏗️

### Beschreibung

Eine Sammlung von Basis-Komponenten (Atome), die über alle Apps hinweg ein konsistentes Design und Verhalten garantieren.

---

## Technische Validierung & Pipeline

Die Einhaltung der Architektur-Vorgaben wird automatisiert überwacht:

- **Konfigurations-Check**: [Phase 00](../../scripts-new/00-validation/README.md) validiert die Vollständigkeit der technischen Basis (`.env`).
- **Architektur-Check**: [Phase 02](../../scripts-new/02-validation/README.md#02-validation_i1-validate-page-architecturets) erzwingt die Nutzung des `createPage`-Wrappers zur SEO-Absicherung.
- **Code-Sicherheit**: [Phase 04](../../scripts-new/04-build-and-test-deploy/README.md#04-build-and-test-deploy_a0-validate-code-safetyts) prüft auf verbotene Code-Patterns.
