# 📧 09 - Messaging & Communication

Strategien für die Verarbeitung von Kundenanfragen und die Anbindung externer Kommunikationsdienste.

## Core Approach: Firestore First ✅

### Beschreibung

Alle Anfragen über das Kontaktformular werden primär direkt in **Firebase Firestore** gespeichert.

- **Sicherheit**: Keine Nachricht geht verloren, selbst wenn E-Mail-Dienste ausfallen.
- **Admin-Vorteil**: Kunden können Anfragen direkt in ihrem geschützten Admin-Bereich einsehen.
- **Kosten**: Funktioniert vollständig im Firebase Spark (Free) Plan.

---

## Email Notifications (Brevo Integration) 🏗️

### Beschreibung

Optionale Echtzeit-Benachrichtigung per E-Mail via **Brevo API**.

- **Infrastruktur**: Erfordert den Firebase **Blaze Plan**, da externe APIs über Cloud Functions angesprochen werden.
- **Sicherheit**: API-Keys werden als private Environment Variables in Firebase Functions gespeichert und sind niemals im Client-Code sichtbar.

### Offene Fragen

- Sollen wir für verschiedene Formulare (Support, Sales, Recruiting) unterschiedliche Brevo-Templates automatisiert ansteuern?
- Benötigen wir ein Double-Opt-In Verfahren für Kontaktanfragen?

---

## Technische Validierung & Pipeline

Die Zuverlässigkeit der Kommunikation wird vor jedem Release geprüft:

- **Dienst-Konnektivität**: [Phase 02](../../scripts-new/02-validation/README.md#02-validation_h1-functional-service-healthts) führt einen schnellen Konnektivitäts-Audit gegen die Brevo API durch.
- **Funktionaler Versand**: [Phase 02](../../scripts-new/02-validation/README.md#02-validation_a1-validate-brevo-healthts) versendet eine echte Test-Mail, um den kompletten SMTP-Weg abzusichern.
