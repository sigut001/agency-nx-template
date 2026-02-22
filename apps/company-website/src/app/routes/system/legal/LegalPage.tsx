/**
 * LEGAL PAGE — Gemeinsame Komponente für alle rechtlichen Seiten
 *
 * Diese Komponente wird für 4 Routen genutzt:
 *   /impressum  → static_pages/system/legal/impressum
 *   /datenschutz → static_pages/system/legal/datenschutz
 *   /agb        → static_pages/system/legal/agb
 *   /lizenzen   → static_pages/system/legal/lizenzen
 *
 * Der Pfad wird anhand der aktuellen URL automatisch bestimmt.
 */

import { useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { getPageAtBuildTime } from '../../../services/cms-build.service';
import type { BasePageDocument } from '../../../shared/interfaces/cms.interfaces';
import { createPage } from '../../../core/createPage';

const LEGAL_PATHS: Record<string, string> = {
  '/impressum':   'static_pages/system/legal/impressum',
  '/datenschutz': 'static_pages/system/legal/datenschutz',
  '/agb':         'static_pages/system/legal/agb',
  '/lizenzen':    'static_pages/system/legal/lizenzen',
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const firestorePath = LEGAL_PATHS[url.pathname];

  if (!firestorePath) {
    throw new Response('Not Found', { status: 404 });
  }

  const content = await getPageAtBuildTime(firestorePath);
  return { content: content as BasePageDocument | null };
}

export default createPage<Awaited<ReturnType<typeof loader>>>({
  meta: ({ content }) => ({
    title: content?.seo?.title || content?.title || 'Rechtliches',
    description: content?.seo?.description || 'Rechtliche Informationen der Qubits Digital.',
    structuredData: content?.seo?.structuredData || {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": content?.title || "Rechtliches"
    }
  }),
  component: ({ data: { content } }) => {
    return (
      <section className="legal">
        {content && (
          <>
            <h1>{content.title}</h1>
            <div style={{ whiteSpace: 'pre-wrap' }}>{String(content.content)}</div>
          </>
        )}
      </section>
    );
  }
});
