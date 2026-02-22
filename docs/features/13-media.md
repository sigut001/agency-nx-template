# 🖼️ 13 - Media CDN & Asset Management

Moderne Webanwendungen benötigen eine performante Auslieferung von Medieninhalten, um die Core Web Vitals (insbesondere LCP) zu optimieren.

## ImageKit.io Integration ✅

### Beschreibung

Wir nutzen **ImageKit.io** als spezialisiertes Media CDN und Echtzeit-Bildtransformations-Engine.

### Kernvorteile

- **Automatische Optimierung**: Bilder werden automatisch in modernen Formaten (WebP, Avif) und in der optimalen Qualität ausgeliefert.
- **Echtzeit-Transformationen**: Größenanpassung, Zuschneiden und Filter können direkt über URL-Parameter gesteuert werden (z.B. `tr:w-300,h-300`).
- **Globales CDN**: Schnelle Auslieferung durch weltweit verteilte Server.

- **Umgebungsvariablen**: Die Steuerung erfolgt über `VITE_IMAGEKIT_URL_ENDPOINT` und entsprechende Keys in den GitHub Secrets.

---

## Technische Validierung & Pipeline

Die Bildauslieferung wird durch dedizierte Health-Checks überwacht:

- **Funktionaler Check**: [Phase 02](../../scripts-new/02-validation/README.md#02-validation_b1-validate-imagekit-healthts) prüft Upload, CDN-Transformation und Cleanup eines Test-Assets.
- **Konnektivitäts-Audit**: [Phase 02](../../scripts-new/02-validation/README.md#02-validation_h1-functional-service-healthts) stellt die Erreichbarkeit der ImageKit-Endpunkte sicher.

---

## Offene Fragen

- Sollen wir für Kundenportale einen automatisierten Media-Upload direkt über das Admin-Panel in ImageKit-Ordner umsetzen?
- Nutzen wir die `imagekit-react` Library für optimierte Bilder-Komponenten im Frontend?
