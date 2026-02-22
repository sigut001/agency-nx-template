import { createPage } from '../../../core/createPage';

export default createPage<void>({
  meta: () => ({
    title: 'Nicht gefunden',
    description: 'Diese Seite existiert nicht.',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "404 Not Found"
    }
  }),
  component: () => (
    <section className="not-found" data-hydrated="true">
      <h1>404 - Seite nicht gefunden</h1>
      <p>Leider konnten wir die gewünschte Seite nicht finden.</p>
      <a href="/">Zurück zur Startseite</a>
    </section>
  )
});
