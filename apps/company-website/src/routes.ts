/**
 * REACT ROUTER v7 ROUTE DEFINITIONS
 *
 * Automatisch abgeleitet aus app.routes.config.ts.
 * DIESE DATEI NICHT MANUELL BEARBEITEN!
 * Routen werden ausschließlich in app.routes.config.ts definiert.
 */

import { type RouteConfig, index, route } from '@react-router/dev/routes';
import { APP_ROUTES_CONFIG } from './app/app.routes.config';

/**
 * Erkennt doppelt verwendete Dateien und weist ihnen eine eindeutige Route-ID zu.
 * RR7 leitet die Route-ID standardmäßig vom Dateipfad ab — bei shared Components
 * (z.B. LegalPage.tsx für /impressum, /datenschutz, /agb, /lizenzen)
 * führt das zu "duplicate route id" Fehlern.
 */
const fileUsageCount = new Map<string, number>();

export default APP_ROUTES_CONFIG.map(r => {
  // Track how often a file is used to generate unique IDs
  const count = (fileUsageCount.get(r.file) ?? 0) + 1;
  fileUsageCount.set(r.file, count);

  // Generate a stable, unique ID from the path (e.g. "/impressum" → "impressum")
  const routeId = r.path === '/'
    ? 'index'
    : r.path.replace(/^\//, '').replace(/[/:]/g, '-');

  if (r.path === '/') {
    return index(r.file);
  }

  // Only pass id option when file is reused (count > 1) or preemptively for known shared files
  return route(r.path, r.file, { id: routeId });
}) satisfies RouteConfig;
