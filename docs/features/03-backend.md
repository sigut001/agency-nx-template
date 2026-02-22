# 🔋 03 - Backend & Infrastructure

Hier liegen die Daten, die Geschäftslogik und die Cloud-Infrastruktur. Das System ist auf maximale Skalierbarkeit und Sicherheit ausgelegt.

## Firebase Integration ✅

### Beschreibung

Nutzung des Firebase-Ökosystems:

- **Hosting**: Globales CDN für statische und dynamische Inhalte.
- **Firestore**: NoSQL Datenbank mit feingranularen Security Rules.
- **Auth**: Zentrales Identitätsmanagement.
- **Functions**: Serverless Backend für APIs (z.B. Messaging).

### Sicherheits-Konzept

- **Projekt-Isolation**: Jeder Kunde erhält ein eigenes Firebase-Projekt und einen eigenen Service Account Key. Dies garantiert, dass Kunde A niemals auf Daten von Kunde B zugreifen kann.
- **Secrets**: API-Keys and Service Accounts werden niemals im Code committet, sondern via GitHub Secrets verwaltet.

---

## Infrastructure Setup 🛠️

### Beschreibung

Vorkonfigurierte Skripte für das initiale Setup eines Kundenprojekts:

- `npm run init:firebase`: Deployt Rules und seedet CMS-Daten.
- `npm run create:owner`: Erstellt den ersten Admin-Account.

### Handlungsbedarf (Manuell)

Einige Firebase-Features müssen einmalig manuell in der Console aktiviert werden:

- Auth (Email/Passwort)
- Firestore (Datenbank erstellen)
- Analytics (Integration aktivieren)

---

## Automatisierte Backups ❌

### Beschreibung

Point-in-Time Recovery (PITR) für Firestore zur Absicherung gegen Datenverlust.

### Offene Fragen

- Ab welcher Projektgröße aktivieren wir den (kostenpflichtigen) Blaze Plan standardmäßig?

---

## Technische Validierung & Pipeline

Die Backend-Infrastruktur wird durch folgende Phasen der Pipeline abgesichert:

- **Initialisierung**: [Phase 01](../../scripts-new/01-initialization/README.md) übernimmt das "Tabula Rasa" (Wipe) und das strukturierte Seeding der Datenbank.
- **Daten-Integrität**: [Phase 02](../../scripts-new/02-validation/README.md#02-validation_g1-dynamic-route-and-firestore-schemats) prüft konsistent, ob Firestore-Pfade und App-Konfiguration (Routes) zusammenpassen.
- **Preview-Validierung**: [Phase 04](../../scripts-new/04-build-and-test-deploy/README.md#04-build-and-test-deploy_b1-firebase-preview-deployts) deployt den Stand auf einen isolierten Preview-Channel für finale Abnahmetests.
