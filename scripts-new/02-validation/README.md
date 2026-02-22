# Phase 02: Service Health & Integrity Audit

In dieser Phase verlassen wir die reine Konfigurationsebene und führen echte **funktionale "Pings"** gegen alle angebundenen Cloud-Systeme aus. Zudem wird die Architektur-Konformität des Codes geprüft.

## Zielsetzung

Sicherstellung, dass alle API-Endpunkte nicht nur "konfiguriert", sondern auch "erreichbar und funktional" sind. Dies verhindert, dass ein Build durchläuft, aber später auf der Live-Seite z.B. das Kontaktformular (Brevo) oder die Bildanzeige (ImageKit) versagt.

## Skripte in dieser Phase

### [02-validation_a1-validate-brevo-health.ts](./02-validation_a1-validate-brevo-health.ts)

- **Hauptaufgabe**: Funktionaler E-Mail-Check.
- **Details**: Versendet eine echte Test-Mail über die Brevo API an die hinterlegte Customer-Email.
- **Semantik**: "Kann mein System im Ernstfall Kunden benachrichtigen?"

### [02-validation_b1-validate-imagekit-health.ts](./02-validation_b1-validate-imagekit-health.ts)

- **Hauptaufgabe**: End-to-End Media Check.
- **Details**: Lädt ein Test-Bild hoch, prüft die CDN-Transformation (URL-Generierung) und löscht das Bild wieder.
- **Semantik**: "Funktioniert die Echtzeit-Bildoptimierung?"

### [02-validation_c1-validate-recaptcha-health.ts](./02-validation_c1-validate-recaptcha-health.ts) & [02-validation_d1-validate-analytics-health.ts](./02-validation_d1-validate-analytics-health.ts)

- **Hauptaufgabe**: Integration-Checks für Google Services.
- **Details**: Versuchen die jeweiligen Client-Bibliotheken mit den konfigurierten Keys zu laden.

### [02-validation_f1-data-agnostic-remote-sync...](./02-validation_f1-data-agnostic-remote-sync-and-identity-verification.ts)

- **Hauptaufgabe**: Konsistenz-Abgleich.
- **Details**: Vergleicht die lokale Identität (`.env`) mit den Remote-Einträgen in Firebase Auth und GitHub Secrets.

### [02-validation_g1-dynamic-route-and-firestore-schema...](./02-validation_g1-dynamic-route-and-firestore-schema-integrity-check.ts)

- **Hauptaufgabe**: Single-Source-of-Truth Validation.
- **Details**: Prüft, ob die in der Config definierten Firestore-Pfade auch wirklich in der Datenbank existieren (Matching zwischen Code & Daten).

### [02-validation_h1-functional-service-health...](./02-validation_h1-functional-service-health-and-connectivity-audit.ts)

- **Hauptaufgabe**: Sammel-Audit.
- **Details**: Führt schnelle Konnektivitäts-Tests (Pings) gegen alle Dienste durch und erstellt eine Übersichtstabelle.

### [02-validation_i1-validate-page-architecture.ts](./02-validation_i1-validate-page-architecture.ts)

- **Hauptaufgabe**: SEO-Police.
- **Details**: Scannt den Source-Code der Pages und erzwingt die Nutzung des `createPage`-Wrappers.
- **Semantik**: "Hat jedes Thema zwingend die erforderlichen SEO-Metadaten?"

## Verknüpfte Features

- [05-SEO](file:///c:/Users/Simon/Desktop/web-entwicklung/templates/agency-nx-template/docs/features/05-seo.md) (Validierung der SEO-Architektur)
- [09-Messaging](file:///c:/Users/Simon/Desktop/web-entwicklung/templates/agency-nx-template/docs/features/09-messaging.md) (Brevo Health)
- [13-Media](file:///c:/Users/Simon/Desktop/web-entwicklung/templates/agency-nx-template/docs/features/13-media.md) (ImageKit Health)
