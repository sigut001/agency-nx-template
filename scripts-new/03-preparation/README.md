# Phase 03: Build Preparation & Metadata Generation

In dieser Phase werden alle **nicht-funktionalen Metadaten** erzeugt, die für den produktiven Betrieb und die rechtliche Compliance notwendig sind. Die Ergebnisse werden als Artefakte in `temp/artifacts/` zwischengespeichert.

## Zielsetzung

Vorbereitung von statischen Dateien, die zur Build-Zeit noch nicht im `static`-Ordner liegen können, da sie dynamisch aus der Datenbank (Firestore) oder dem Projektzustand (Dependencies) generiert werden müssen.

## Skripte in dieser Phase

### [03-preparation_a1-generate-sitemap.ts](./03-preparation_a1-generate-sitemap.ts)

- **Hauptaufgabe**: SEO-Vorbereitung.
- **Details**:
  - Liest alle statischen Pfade aus der Config.
  - Holt alle dynamischen Slugs (z.B. Blogposts) aus Firestore.
  - Generiert eine valide `sitemap.xml` und `robots.txt`.
- **Semantik**: Sichtbarkeit für Suchmaschinen sicherstellen.

### [03-preparation_a2-validate-sitemap-schema.ts](./03-preparation_a2-validate-sitemap-schema.ts)

- **Hauptaufgabe**: Qualitätsprüfung der SEO-Files.
- **Details**: Prüft die XML-Struktur der Sitemap auf Korrektheit.

### [03-preparation_c1-generate-license-report.ts](./03-preparation_c1-generate-license-report.ts)

- **Hauptaufgabe**: Rechtliche Absicherung (Open Source Compliance).
- **Details**:
  - Scant alle produktiven npm-Abhängigkeiten.
  - Erstellt einen textbasierten Report aller Lizenzen.
  - **Besonderheit**: Lädt diesen Report direkt in das Firestore-Dokument `static_pages/system/legal/lizenzen` hoch, damit er auf der Website angezeigt werden kann.
- **Semantik**: Automatisierte Erfüllung der Informationspflichten für Drittanbieter-Software.

### [03-preparation_c2-validate-license-report.ts](./03-preparation_c2-validate-license-report.ts)

- **Hauptaufgabe**: Aktualitäts-Check.
- **Details**: Verifiziert in Firestore, ob der Lizenz-Report wirklich neu generiert wurde (darf nicht älter als 15 Min. sein).

## Verknüpfte Features

- [05-SEO](file:///c:/Users/Simon/Desktop/web-entwicklung/templates/agency-nx-template/docs/features/05-seo.md) (Automatisierung von Sitemap & Robots)
- [06-Legal](file:///c:/Users/Simon/Desktop/web-entwicklung/templates/agency-nx-template/docs/features/06-legal.md) (Automatisierte Lizenz-Übersicht)
