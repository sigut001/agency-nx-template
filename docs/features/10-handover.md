# 🤝 10 - Handover & Onboarding

Dieser Leitfaden unterstützt Entwickler und Projektmanager beim Aufsetzen neuer Projekte und der Übergabe an den Kunden.

## Automatisierte Features ✅

- **Test-User**: Automatisierte Erstellung von Test-Accounts basierend auf dem Kunden-Slug.
- **Secret Sync**: Automatische Synchronisierung von Credentials zu GitHub Secrets via GitHub CLI (`gh`).
- **Preview Channels**: Automatische Deployment-Vorschauen, die nach einem vordefinierten Zeitraum (z.B. 1h) verfallen.

---

## Onboarding Checkliste 🚀

### 1. Lokal Setup

- Repo klonen.
- `npm install`.
- `gh auth login` (erforderlich für Secret Sync).

### 2. Firebase Initialisierung

- Auth, Firestore und Analytics in der Console aktivieren.
- Service Account Key herunterladen und lokal als `firebase-service-account.json` speichern.
- `npm run init:firebase` und `npm run create:owner` ausführen.

### 3. Erste Validierung

- `npm run test:pipeline` starten, um den gesamten Workflow (Build, Deploy, E2E) zu testen.

---

## Wichtige Dokumentations-Quellen 📚

Für ein tiefes Verständnis der technischen Abläufe stehen folgende Ressourcen zur Verfügung:

- **Pipeline-Details**: In den Verzeichnissen von `scripts-new/` findest du semantische `README.md` Dateien für jede Phase (00-05). Diese erklären genau, was technisch passiert.
- **Feature-Mapping**: Jedes Dokument in `docs/features/` enthält nun eine Sektion "Technische Validierung & Pipeline", die den direkten Link zwischen dem Feature und den absichernden Skripten schlägt.

---

## Offene Fragen

- Sollen wir ein automatisiertes PDF-Reporting für den Kunden am Ende des Onboardings generieren?
