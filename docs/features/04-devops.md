# 🚀 04 - DevOps & Automation

Die Automatisierung garantiert die Qualität bei jedem Release und ermöglicht eine schnelle Reaktion auf Änderungen.

## Workflow Architektur (Die 3 Säulen) ✅

Unsere Automatisierung folgt einer klaren 3-stufigen Hierarchie, um Fehl-Deployments zu vermeiden und die Umgebungsparität (Docker) zu garantieren.

### WF-1: [Template-Bootstrap]

- **Zweck**: Initiales Setup & Datenbank-Seeding.
- **Trigger**: `./scripts-new/docker-pipeline.ps1 -Mode full`.
- **Umgebung**: Lokal.
- **Script**: `wf-1-template-bootstrap.ts`.

### WF-2: [Project-Validation]

- **Zweck**: End-to-End Validierung des _echten_ Projekts auf einem Preview-Channel.
- **Trigger**: `./scripts-new/docker-pipeline.ps1` (Standard) & GitHub PR.
- **Umgebung**: **Docker (Linux)** für 100%ige Übereinstimmung mit GitHub.
- **Script**: `wf-2-project-validation.ts`.
- **Modus**: `./scripts-new/docker-pipeline.ps1 -Mode validate` (Standard).

### WF-3: [Production-Release]

- **Zweck**: Finale Auslieferung & Versionierung.
- **Trigger**: Automatisch nach Merge in `main`.
- **Umgebung**: GitHub Actions.
- **Features**: Live-Deploy, Git-Tagging, Release-Artifacts.

---

## Eindeutige Umgebungen (Docker) ✅

Um "flaky" Tests zu vermeiden, nutzen wir ein gemeinsames Docker-Image für alle Pipeline-Aktivitäten.

### Befehle

| Ziel               | Befehl                                         | Beschreibung                                                  |
| :----------------- | :--------------------------------------------- | :------------------------------------------------------------ |
| **Standard Check** | `./scripts-new/docker-pipeline.ps1`            | Führt Build & E2E-Tests im Container aus (Sicherer Push).     |
| **Full Reset**     | `./scripts-new/docker-pipeline.ps1 -Mode full` | Führt Wipe, Seeding, Build & E2E-Tests aus (Initialer Start). |

---

## Projekt-Initialisierung (Phase 14) 🏗️

### Beschreibung

Ziel ist die vollautomatische Erstellung von Kundenprojekten via CLI.

- Automatisches Erstellen von Firebase-Projekten via API.
- Generierung von Service Accounts und Sync zu GitHub Secrets.
- Repository-Setup.

### Offene Fragen

- Wie binden wir Git Submodule-Updates für den Template-Kern am besten ein?

---

## Technische Validierung & Pipeline

Die Automatisierung wird durch spezialisierte Master-Skripte gesteuert:

- **Gesamt-Steuerung**: `master-full-pipeline-test.ts` (Orchestriert alle Phasen von 00 bis 05).
- **Reset-Prozess**: [Phase 01](../../scripts-new/01-initialization/README.md) automatisiert den Infrastruktur-Reset und das Seeding.
- **Abnahme**: [Phase 04](../../scripts-new/04-build-and-test-deploy/README.md) sorgt für das Preview-Deployment und die anschließende E2E-Validierung.
