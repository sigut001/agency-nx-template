# 🔍 05 - SEO & Marketing

Damit die Webseite nicht nur gut aussieht, sondern auch gefunden wird. Fokus auf technische Indexierbarkeit und Social-Media Sichtbarkeit.

## Sitemap & Metadata Automation ✅

### Beschreibung

- **Dynamische Sitemap**: Unsere `sitemap.xml` wird automatisch während der Build-Pipeline generiert (`scripts/pipeline/02-generate-sitemap.ts`). Sie zieht Daten aus statischen Routen und dynamischen CMS-Slugs aus Firestore.
- **Robots.txt**: "Allow all" Strategie für maximale Sichtbarkeit. Auf Preview-Channels setzt Firebase automatisch ein `noindex`, um Duplicate Content zu vermeiden.
- **Head Cleanup**: Ein Post-Build Script nutzt `jsdom`, um sicherzustellen, dass Meta-Tags (Title, Description) exakt einmal vorkommen.

### Architektur-Entscheidungen

- **Keine Prioritäten**: Wir verzichten auf `<priority>` und `<changefreq>`, da moderne Suchmaschinen diese ignorieren. Wir fokussieren uns stattdessen auf das `<lastmod>` Datum.
- **Clean Server Output**: Wir optimieren primär das statische HTML für GoogleBot, auch wenn React im Client kurzzeitig Duplikate erzeugt.

### Offene Fragen

- Sollen wir für Blogposts automatisierte **JSON-LD (Schema.org)** Daten generieren?
- Brauchen wir ein Tool für automatisierte Keyword-Analyse Integration?

---

## OpenGraph & Social Cards ❌

### Beschreibung

Automatische Generierung von Vorschaubildern (OG-Images), wenn eine URL bei LinkedIn, Twitter oder WhatsApp geteilt wird.

### Offene Fragen

- Nutzen wir einen Cloud-Service (z.B. Cloudinary) oder eine Edge-Function (satori), um OG-Images dynamisch zu rendern?

---

## Analytics Integration ✅

### Beschreibung

Einbindung von Google Analytics 4 (GA4) über die Cookie-Consent Logik. Daten fließen nur, wenn der Benutzer explizit zugestimmt hat.

---

## Technische Validierung & Pipeline

SEO-Qualität ist ein integraler Bestandteil des Builds:

- **Architektur-Check**: [Phase 02](../../scripts-new/02-validation/README.md#02-validation_i1-validate-page-architecturets) erzwingt Metadaten pro Page.
- **Metadaten-Generierung**: [Phase 03](../../scripts-new/03-preparation/README.md#03-preparation_a1-generate-sitemapts) erzeugt automatisch `sitemap.xml` und `robots.txt`.
- **Performance & Audit**: [Phase 05](../../scripts-new/05-performance-audit-and-report/README.md) misst den SEO-Score via Lighthouse und bricht die Pipeline bei Fehlern ab.
