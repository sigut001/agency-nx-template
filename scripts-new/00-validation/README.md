# Phase 00: Environment Validation (The Guard)

Diese Phase fungiert als der **"Root-Wächter"** der gesamten Pipeline. Bevor destruktive Aktionen (Wipe) oder aufwendige Prozesse (Build) starten, wird hier sichergestellt, dass das lokale Fundament stabil ist.

## Zielsetzung

Verhinderung von Pipeline-Abbrüchen durch triviale Konfigurationsfehler. Es wird sichergestellt, dass alle für die Cloud-Dienste (Firebase, Brevo, ImageKit, reCAPTCHA) notwendigen Schlüssel vorhanden und syntaktisch korrekt sind.

## Skripte in dieser Phase

### [00-validation_a1-validate-environment.ts](./00-validation_a1-validate-environment.ts)

- **Hauptaufgabe**: Validierung der `.env` Datei gegen ein strenges Schema.
- **Details**:
  - Prüft die Existenz der `.env`.
  - Validiert **Firebase Client Config** (API Keys, Project IDs).
  - Validiert **Firebase Admin Config** (Private Keys für administrative Aktionen).
  - Validiert externe Integrationen (**Brevo**, **ImageKit**, **reCAPTCHA**).
  - Prüft **Identity Credentials** (Admin Login Daten).
- **Fehlerbehandlung**: Das Skript bricht sofort mit `process.exit(1)` ab, wenn auch nur ein einziger Pflichtschlüssel fehlt oder ein falsches Format (Regex) aufweist.

## Verknüpfte Features

- [01-Architecture](file:///c:/Users/Simon/Desktop/web-entwicklung/templates/agency-nx-template/docs/features/01-architecture.md) (Grundlagen der Konfiguration)
- [03-Backend](file:///c:/Users/Simon/Desktop/web-entwicklung/templates/agency-nx-template/docs/features/03-backend.md) (Firebase Setup)
- [13-Media](file:///c:/Users/Simon/Desktop/web-entwicklung/templates/agency-nx-template/docs/features/13-media.md) (ImageKit Credentials)
