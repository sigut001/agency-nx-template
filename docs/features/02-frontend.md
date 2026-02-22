# 🎨 02 - Frontend Core

Die Schnittstelle zum Endbenutzer. In dieser Schicht wird der "Premium-Faktor" durch Design, Performance und UX entschieden.

## Modern UI Framework (React 19) ✅

### Beschreibung

Einsatz von **React 19** in Kombination mit **Vite** zur Erzielung maximaler Rendering-Geschwindigkeit und modernster Entwicklungsfeatures (z.B. React Compiler, verbesserte Server Components).

### Offene Fragen

- Wie gehen wir mit dem Übergang von `react-helmet-async` zu nativen React 19 Metadata Tags um?
- Sollen wir `useOptimistic` für CMS-Updates im Admin-Bereich standardmäßig implementieren?

---

## Dark Mode & Design System ✅

### Beschreibung

Vollständige Unterstützung für helle und dunkle Themes mittels CSS-Variablen. In `styles.css` sind die Tokens zentral definiert. Ein manueller Toggle (`ThemeToggle.tsx`) erlaubt dem User den Wechsel.

### Offene Fragen

- **Betriebssystem-Sync**: Wie verhält sich die App, wenn der User sein OS von Light auf Dark stellt? Wird das Thema live aktualisiert (EventListener) oder nur beim initialen Laden? Hier müssen wir prüfen, ob ein `matchMedia` Listener aktiv ist.
- Sollen wir eine "System-Default" Option im Toggle explizit als dritten Zustand anbieten?

---

## Responsive Design ✅

### Beschreibung

Mobile-First Konstruktion aller Layouts. Nutzung von CSS-Grid und Flexbox zur Anpassung an alle Bildschirmgrößen.

### Offene Fragen

- Gibt es Grenzfälle (z.B. sehr breite Ultrawide-Monitore), für die wir einen `max-width` Container standardmäßig einführen?
