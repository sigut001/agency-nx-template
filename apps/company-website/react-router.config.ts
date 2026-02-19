/**
 * REACT ROUTER v7 CONFIGURATION
 *
 * ssr: false    → Kein Server benötigt, Firebase Hosting Static kompatibel
 * prerender     → Alle öffentlichen Routes werden zur Build-Zeit als statisches HTML generiert.
 *                 Dynamische Routen (blog/:slug, produkte/:slug) werden aus
 *                 Firestore geladen, um alle möglichen Pfade zu ermitteln.
 */

import type { Config } from '@react-router/dev/config';
import { PUBLIC_ROUTES_CONFIG } from './src/app/app.routes.config';
import { getAllDocIds } from './src/app/services/cms-build.service';

export default {
  appDirectory: 'src',
  ssr: false,

  async prerender() {
    const routes: string[] = [];

    for (const route of PUBLIC_ROUTES_CONFIG) {
      if (route.path === '*') continue; // Catch-all nicht prerendern

      if (route.type === 'static') {
        routes.push(route.path);
      } else if (route.type === 'dynamic' && route.collection) {
        // Dynamische Routen: alle Slugs aus Firestore laden
        const slugs = await getAllDocIds(route.collection);
        const basePath = route.path.replace('/:slug', '');
        routes.push(...slugs.map(slug => `${basePath}/${slug}`));
      }
    }

    console.log(`[Prerender] ${routes.length} Routes gefunden:`, routes);
    return routes;
  },
} satisfies Config;
