# 🗺️ Modern Web App Map & Checklist

Dieses Dokument ist der Einstiegspunkt und die strategische Übersicht für das `agency-nx-template`. Detaillierte Beschreibungen und offene Fragen finden sich in den jeweiligen Fachdokumenten.

## 📊 Feature-Übersicht & Detail-Links

### [01 - Architektur](features/01-architecture.md) ✅

- **Monorepo (Nx) & TypeScript**: Struktur, Code-Sharing und Typsicherheit.
- **Docker Support**: Eindeutige Umgebungen für stabile CI/CD und Playwright.
- **Component Library Foundation**: Basis für wiederverwendbare UI-Elemente.

### [02 - Frontend Core](features/02-frontend.md) 🏗️

- **Modern UI Framework (React 19)**: Performance und modernste Features.
- **Dark Mode & Design System**: Theme-Unterstützung und Design-Tokens.
- **Responsive Design**: Mobile-First Layouts und Flexibilität.

### [03 - Backend & Infra](features/03-backend.md) ✅

- **Firebase Integration**: Hosting, Firestore, Auth und Functions.
- **Infrastructure Setup**: Automatisierte Initialisierung und CMS-Seeding.
- **Automatisierte Backups**: PITR-Konzept für Datensicherheit.

### [12 - CMS & Admin Panel](features/12-cms.md) 🏗️

- **Admin-Anwendung**: Geschützter Bereich für Kunden zur Inhaltsverwaltung.
- **Formar-basiertes Editing**: Dokumente als Formulare ohne Struktur-Bruch.
- **Dynamische Kollektionen**: Eigenständiges Anlegen von Blogposts/Produkten.

### [13 - Media CDN (ImageKit)](features/13-media.md) ✅

- **ImageKit.io Integration**: Echtzeit-Transformation und WebP-Optimierung.
- **Automatische Validierung**: Script-basierter Health-Check in der Pipeline.

### [04 - DevOps & Automation](features/04-devops.md) ✅

- **CI/CD Pipeline & Phasen**: Strukturierter Release-Prozess (Phase 0-14).
- **Projekt-Initialisierung (Phase 14)**: Automatisches Kunden-Setup via API.

### [05 - SEO & Marketing](features/05-seo.md) 🏗️

- **Sitemap & Metadata Automation**: Dynamische Indexierung und Head-Cleanup.
- **OpenGraph & Social Cards**: Dynamische Vorschaubilder für Social Media.
- **Analytics Integration**: GA4 Einbindung via Consent-Logik.

### [06 - Legal & Compliance](features/06-legal.md) 🏗️

- **Cookie Consent (v3)**: Factory-Pattern und Test-Automatisierung.
- **Impressum & Datenschutz**: Rechtlich notwendige Standard-Seiten.
- **Härtung (Security Headers)**: CSP, HSTS und X-Frame-Options.

### [07 - Qualität & Performance](features/07-quality.md) ❌

- **Lighthouse & Performance**: Überwachung der Core Web Vitals.
- **Accessibility (A11y)**: Einhaltung von WCAG-Standards.
- **Security Scanning**: SAST/DAST Audits für Code und Dependencies.

### [08 - i18n Concept](features/08-i18n.md) 🧠

- **Zentrale Sprachsteuerung**: Konfiguration und UI-Logik.
- **Firebase CMS Struktur**: Datenhaltung für Multi-Language Content.
- **Prerendering & SEO**: Sprachspezifische Pfade und Hreflang Tags.

### [09 - Messaging](features/09-messaging.md) 🏗️

- **Core Approach: Firestore First**: Verlustfreie Speicherung von Anfragen.
- **Email Notifications (Brevo)**: Optionale Mail-Benachrichtigung via Functions.

### [10 - Handover & Process](features/10-handover.md) ✅

- **Automatisierte Features**: Test-User und Secret-Synch.
- **Onboarding Checkliste**: Schritte für das initiale Projekt-Setup.

### [11 - Roadmap](features/11-roadmap.md) 🚀

- **Kurzfristig**: Cookie-Banner, Lizenzen, CSP.
- **Mittelfristig**: Visual Testing, A11y Automation.
- **Langfristig**: Full Terraform Automation, Multi-Cloud Backups.

---

## 🛠️ Benutzung dieser Map

1. **Status prüfen**: Die Icons (✅, 🏗️, ❌, 🧠, 🚀) zeigen den aktuellen Fortschritt.
2. **Details klären**: Klicke auf die Überschriften, um in die **Detail-Spezifikation** und die **offenen Fragen** einzusteigen.

---

> [!NOTE]
> Legende: ✅ = Umgesetzt | 🏗️ = In Arbeit / Konzept vorhanden | ❌ = Fehlt noch | 🧠 = Theoretisches Konzept | 🚀 = Zukunftsprojekt
