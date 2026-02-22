# Phase 01: Radical Initialization (Reset & Seed)

Diese Phase ist für den **"Tabula Rasa"**-Zustand verantwortlich. Sie sorgt dafür, dass die Infrastruktur (Firebase & GitHub) in einen definierten Ausgangszustand versetzt und anschließend mit den projektspezifischen Daten initialisiert wird.

## Zielsetzung

Herstellung einer konsistenten, sauberen Umgebung. Dies ist besonders wichtig für automatisierte Tests und neue Kunden-Deployments, um Altlasten in der Datenbank oder den Secrets auszuschließen.

## Skripte in dieser Phase

### [01-initialization_a1-radical-infrastructure-wipe...](./01-initialization_a1-radical-infrastructure-wipe-firebase-and-github.ts)

- **Hauptaufgabe**: Restlose Löschung aller Remote-Daten.
- **Details**:
  - Leert alle Firestore-Kollektionen.
  - Löscht alle Benutzer aus Firebase Authentication.
  - Entfernt alle Secrets aus dem GitHub-Repository via `gh cli`.
- **Semantik**: Der "Panic Button" für einen sauberen Neustart.

### [01-initialization_b1-validate-radical-wipe.ts](./01-initialization_b1-validate-radical-wipe.ts)

- **Hauptaufgabe**: Bestätigung des "Zero-State".
- **Details**: Prüft technisch nach, ob Firestore, Auth und GitHub wirklich leer sind.

### [01-initialization_c1-configuration-driven-firestore-seeding...](./01-initialization_c1-configuration-driven-firestore-seeding-and-admin-setup.ts)

- **Hauptaufgabe**: Aufbau der Datenstruktur basierend auf der zentralen App-Konfiguration.
- **Details**:
  - Erstellt alle statischen und dynamischen Seiten-Dokumente in Firestore.
  - Legt den initialen Admin-User an und weist die `owner`-Rolle zu.
  - Deployt die Firestore Security Rules.
- **Semantik**: Transformiert die technische Config in eine lebendige Datenbankstruktur.

### [01-initialization_d1-validate-firebase-seeding.ts](./01-initialization_d1-validate-firebase-seeding.ts)

- **Hauptaufgabe**: Integritätsprüfung nach dem Seeding.
- **Details**: Verifiziert, ob alle erwarteten Dokumente (Statisch/Dynamisch) im richtigen Schema angelegt wurden.

### [01-initialization_e1-environment-to-github-secret-synchronization.ts](./01-initialization_e1-environment-to-github-secret-synchronization.ts)

- **Hauptaufgabe**: Cloud-Konfiguration.
- **Details**: Überträgt die lokale `.env` sicher in die GitHub Secrets, damit die CI/CD Pipeline (Phase 04/05) dort arbeiten kann.

### [01-initialization_f1-validate-github-secrets.ts](./01-initialization_f1-validate-github-secrets.ts)

- **Hauptaufgabe**: Verifizierung der Secret-Synchronisation.

### [01-initialization_g1-validate-initialization.ts](./01-initialization_g1-validate-initialization.ts)

- **Hauptaufgabe**: Finaler Checkpoint der Phase 01.
- **Details**: Kombinierter Test aus Auth, Firestore und GitHub Secrets, um das "Go" für Phase 02 zu geben.

## Verknüpfte Features

- [03-Backend](file:///c:/Users/Simon/Desktop/web-entwicklung/templates/agency-nx-template/docs/features/03-backend.md) (Firebase Struktur & Rollen)
- [04-DevOps](file:///c:/Users/Simon/Desktop/web-entwicklung/templates/agency-nx-template/docs/features/04-devops.md) (CI/CD Vorbereitung)
- [12-CMS](file:///c:/Users/Simon/Desktop/web-entwicklung/templates/agency-nx-template/docs/features/12-cms.md) (Initiales Content-Seeding)
