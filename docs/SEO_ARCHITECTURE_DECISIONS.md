# SEO & Architecture: Decisions & Concepts

Dieses Dokument beschreibt die fundamentalen Entscheidungen für SEO, Content-Management und Deployment in diesem Projekt. Es dient als "Single Source of Truth" für Entwickler und Projektmanager.

---

## 1. Sitemap (`sitemap.xml`)

### 🔍 Strategie & Aufbau

Unsere Sitemap wird **automatisch während der Build-Pipeline generiert** (`scripts/pipeline/02-generate-sitemap.ts`). Sie ist die zentrale Anlaufstelle für Suchmaschinen, um Inhalte zu finden.

**Datenquellen:**

1.  **Statische Routen:** Fest definiert im Code (z.B. `/`, `/kontakt`, `/impressum`).
2.  **Dynamische Routen (CMS):** Werden live aus **Firestore** gezogen (`dynamic_pages/blog/posts`, `dynamic_pages/products/items`).
    - Das Build-Skript holt alle Dokument-IDs/Slugs und generiert daraus URLs.
    - Dies garantiert, dass _jede_ veröffentlichte CMS-Seite auch in der Sitemap landet.

### 🚫 Warum keine `priority` oder `changefreq`?

Wir verzichten bewusst auf die Tags `<priority>` (z.B. `0.8`) und `<changefreq>` (z.B. `weekly`).

**Begründung (Stand 2025/2026):**

- **Google ignoriert diese Werte:** Aufgrund jahrelangem Missbrauchs (Webmaster setzten alles auf `1.0`) vertrauen Suchmaschinen diesen Angaben nicht mehr.
- **Kein Ranking-Faktor:** Sie haben keinen Einfluss auf das Crawling-Budget oder das Ranking.
- **Fokus auf `lastmod`:** Das einzige relevante Zeit-Signal ist `<lastmod>`. Unser Skript setzt dieses Datum automatisch (aktuell auf das Build-Datum, künftig idealerweise auf das `updatedAt` des CMS-Dokuments).
- **Clean Code:** Das Weglassen unnötiger Tags hält die Sitemap klein und übersichtlich.

---

## 2. Robots (`robots.txt`) & Indexierung

### 🤖 Unsere Philosophie: "Allow All"

Unsere generierte `robots.txt` ist extrem simpel:

```txt
User-agent: *
Allow: /
Sitemap: https://deine-domain.de/sitemap.xml
```

Wir erlauben Bots den Zugriff auf **alles**.

### 🛡️ Schutz von Test-Umgebungen (Preview Channels)

Warum taucht im Lighthouse-Report auf Preview-URLs trotzdem "Blocked from indexing" auf?

- **Automatismus von Firebase:** Wenn wir auf einen Firebase Preview Channel deployen (z.B. via Pull Request Pipeline), setzt Firebase Hosting **automatisch** den HTTP-Header `X-Robots-Tag: noindex`.
- **Sinn & Zweck:** Dies verhindert "Duplicate Content". Google soll nur die echte Live-Seite (`live` Channel) indexieren, nicht die 50 temporären Test-Versionen.
- **Kein Handlungsbedarf:** Dies ist ein Feature, kein Bug. Sobald auf `live` deployt wird, verschwindet der Header und die Seite ist indexierbar.

---

## 3. CMS & Content-Flow

Unsere "Business Logic" für Inhalte liegt vollständig in **Firestore** (NoSQL Datenbank).

- **Trennung von Layout & Inhalt:**
  - **React (Code):** Definiert _wie_ etwas aussieht (Templates, Komponenten).
  - **Firestore (Daten):** Definiert _was_ angezeigt wird (Texte, Bilder, SEO-Titel).
- **Build-Prozess (SSG):**
  - Beim Build (`npm run build`) werden die Inhalte _einmalig_ abgerufen (Prerendering).
  - Das Ergebnis sind statische HTML-Dateien im `dist/` Ordner.
  - **Vorteil:** Extrem schnell (keine Datenbank-Abfrage beim Seitenaufruf) und perfekt für SEO.

---

## 4. Metadata Management (React 19 & Duplikate)

Ein bekanntes technisches Detail in React 19 + Vite SSG Umgebungen ist das Handling von `<head>` Elementen (Title, Meta-Description).

### ⚠️ Das Problem: "Hydration Mismatch"

Beim Prerendering (Server-Seite) generiert React das HTML korrekt. Wenn jedoch React im Browser startet ("Hydration"), kann es passieren, dass React die bereits vorhandenen Meta-Tags nicht als "seine eigenen" erkennt und sie **erneut einfügt**.
-> Folge: Doppelte Tags im DOM (eines vom Server, eines vom Client).

### ✅ Unsere Lösung: "Clean Server, Native Client"

Wir haben uns gegen komplexe Riesen-Bibliotheken (wie `react-helmet-async`) entschieden, um nah am React-Standard zu bleiben.

**Die Strategie:**

1.  **Server (Priorität 1):**
    Wir nutzen ein eigenes **Post-Build Cleanup Skript** (`scripts/pipeline/03b-cleanup-html.ts`).
    - Dieses Skript läuft _nach_ dem Build über alle HTML-Dateien.
    - Es nutzt `jsdom`, um sicherzustellen, dass kritische Tags (Title, Description, Canonical) **exakt einmal** vorkommen.
    - **Ergebnis:** Das HTML, das GoogleBot sieht, ist 100% sauber und valide.

2.  **Client (Priorität 2):**
    Wir akzeptieren, dass React im Browser (für den menschlichen Besucher) eventuell kurzzeitig Duplikate im DOM erzeugt.
    - Dies hat **keine negativen Auswirkungen** auf SEO (da Google primär das statische HTML wertet).
    - Es spart uns unnötige Komplexität und Abhängigkeiten ("Bloat").

**Fazit:** Wir optimieren strikt auf das, was für das Ranking zählt (Server-Output), und halten den Code für Entwickler einfach (Native React Tags).

---

## 5. Cookie Consent (Research Pending)

- **Status:** In Evaluierung.
- **Anforderung:** DSGVO-konform, kostenlos/Open-Source, dynamisch konfigurierbar.
- **Strategie:** TBD.

---

## 6. Security Headers (Firebase) (Research Pending)

- **Status:** Geplant.
- **Ziel:** Härtung der Applikation via `firebase.json` headers (CSP, HSTS, X-Frame-Options).
