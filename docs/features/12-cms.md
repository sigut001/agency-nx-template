# 📄 12 - Content Management System (Admin App)

Ein zentrales Thema für die Skalierbarkeit der Website-Factory ist die Trennung von Inhaltsverwaltung und technischer Entwicklung.

## Das Admin-Panel Konzept 🏗️

### Beschreibung

Die Inhaltsverwaltung erfolgt über eine separate **Admin-Anwendung**. Diese ist aktuell in Planung und wird als geschützter Bereich umgesetzt, in dem sich berechtigte Nutzer (Kunden) anmelden können.

### Kernfunktionalität

- **Formular-basiertes Editing**: Jede Seite der Webseite ist als Dokument in Firestore repräsentiert. Im Admin-Bereich wird dieses Dokument als dynamisches Formular dargestellt.
- **Keine Strukturänderung**: Nutzer können Texte, Bilder und Links anpassen, aber nicht das Design oder die grundlegende Struktur der Seite verändern. Dies sichert die Design-Qualität.
- **Dynamische Kollektionen**: Nutzer können neue Einträge in vordefinierten Kollektionen anlegen (z.B. neue Blogposts, Teammitglieder oder Produkte).
- **Entwurfsmodus**: Änderungen werden erst durch einen "Veröffentlichen"-Button aktiv, der ggf. einen neuen SSG-Build-Prozess triggert.

### Technische Umsetzung

- **Frontend**: React-Anwendung im gleichen Monorepo.
- **Backend**: Firebase Auth zur Zugriffskontrolle und Firestore als Single Source of Truth für die Inhalte.
- **Automatisierung**: Bei Speicherung von Inhalten kann via Cloud Functions automatisch die Build-Pipeline in GitHub Actions angestoßen werden.

### Aktuelle Implementierung (Hybrid-Loading)

Die Anwendung nutzt bereits eine duale Strategie für CMS-Inhalte:

- **Build-Zeit (Node.js)**: Der `cms-build.service.ts` nutzt das Firebase Admin SDK, um Daten für das Static Site Generation (SSG) vorzuladen.
- **Laufzeit (Browser)**: Der `cms.service.ts` nutzt das Client SDK, um dynamische Daten (z.B. User-History oder Echtzeit-Updates) direkt im Frontend nachzuladen.
- **Pfade**: Die Auflösung verschachtelter Firestore-Pfade ist über zentrale Helper (`firestore-path-helpers.ts`) vereinheitlicht.

---

## Offene Fragen

- Welches Form-Builder Framework nutzen wir für die dynamische Generierung der Admin-UI (z.B. React JSON Schema Form)?
- Wie visualisieren wir den Veröffentlichungs-Status ("Draft" vs. "Live") in Firestore am effizientesten?

---

## Technische Validierung & Pipeline

Die Integrität der CMS-Inhalte wird automatisiert sichergestellt:

- **Content-Seeding**: [Phase 01](../../scripts-new/01-initialization/README.md#01-initialization_c1-configuration-driven-firestore-seedingts) baut die Initialdaten basierend auf der App-Config auf.
- **Struktur-Validierung**: [Phase 02](../../scripts-new/02-validation/README.md#02-validation_g1-dynamic-route-and-firestore-schemats) verifiziert das Matching zwischen Firestore-Dokumenten und dem Code.
- **Build-Integrität**: [Phase 04](../../scripts-new/04-build-and-test-deploy/README.md#04-build-and-test-deploy_a1-inject-artifacts-to-distts) injiziert dynamisch erzeugte Metadaten in das finale Build-Bundle.
