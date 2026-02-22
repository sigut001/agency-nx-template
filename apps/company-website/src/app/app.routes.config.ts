/**
 * CENTRAL ROUTE CONFIGURATION — Single Source of Truth
 *
 * Alle Routen der Anwendung werden hier definiert.
 * Daraus wird automatisch abgeleitet:
 *   - React Router v7 Routing  (routes.ts)
 *   - Firestore Seeding        (Scripts)
 *   - Sitemap Generierung      (Scripts)
 *   - E2E Tests                (company-website-e2e)
 *   - Prerendering             (react-router.config.ts)
 *
 * WICHTIG: Beim Hinzufügen neuer Routen NUR diese Datei ändern!
 *
 * Kein React, kein JSX — reine Datenstruktur,
 * damit Node.js-Scripts diese Datei direkt importieren können.
 */

// ─── Typen ──────────────────────────────────────────────

export interface RouteConfig {
  /** URL-Pfad der Route */
  path: string;
  /** Seitentitel (Fallback für SEO) */
  title: string;
  /** 'static' = fester Pfad, 'dynamic' = mit :slug Parameter */
  type: 'static' | 'dynamic';
  /** Firestore-Pfad zum Inhalt */
  collection?: string;
  /** Dateipfad zur Route-Komponente (relativ zum src/-Verzeichnis) */
  file: string;
}

// ─── App-Routen (Marketing, Content, Features) ─────────

const APP_CONTENT_ROUTES: RouteConfig[] = [
  { path: '/',              title: 'Willkommen bei Qubits Digital', type: 'static',  collection: 'static_pages/app/marketing/home',        file: './app/routes/app/Home.tsx' },
  { path: '/kontakt',       title: 'Kontakt',                      type: 'static',  collection: 'static_pages/app/marketing/kontakt',     file: './app/routes/app/Contact.tsx' },

  // Dynamic Content
  { path: '/blog/:slug',    title: 'Blog',                         type: 'dynamic', collection: 'dynamic_pages/blog/documents',           file: './app/routes/app/BlogPost.tsx' },
  { path: '/produkte/:slug',title: 'Produkte',                     type: 'dynamic', collection: 'dynamic_pages/produkte/documents',       file: './app/routes/app/ProductPage.tsx' },
];

// ─── System-Routen (Legal, Infrastruktur) ───────────────

const SYSTEM_ROUTES: RouteConfig[] = [
  { path: '/impressum',     title: 'Impressum',                    type: 'static',  collection: 'static_pages/system/legal/impressum',    file: './app/routes/system/legal/LegalPage.tsx' },
  { path: '/datenschutz',   title: 'Datenschutz',                  type: 'static',  collection: 'static_pages/system/legal/datenschutz',  file: './app/routes/system/legal/LegalPage.tsx' },
  { path: '/agb',           title: 'AGB',                          type: 'static',  collection: 'static_pages/system/legal/agb',          file: './app/routes/system/legal/LegalPage.tsx' },
  { path: '/lizenzen',      title: 'Lizenzen',                     type: 'static',  collection: 'static_pages/system/legal/lizenzen',     file: './app/routes/system/legal/LegalPage.tsx' },
];

// ─── Admin-Routen (ausgelagert in separate Anwendung) ─────
const ADMIN_ROUTES: RouteConfig[] = [];

// ─── Infrastruktur ──────────────────────────────────────

const INFRA_ROUTES: RouteConfig[] = [
  { path: '/404',  title: 'Nicht gefunden',  type: 'static',  file: './app/routes/system/infrastructure/NotFound.tsx' },
  { path: '*',     title: 'Nicht gefunden',  type: 'static',  file: './app/routes/system/infrastructure/NotFound.tsx' },
];

// ─── Kombinierter Export ────────────────────────────────

export const APP_ROUTES_CONFIG: RouteConfig[] = [
  ...APP_CONTENT_ROUTES,
  ...SYSTEM_ROUTES,
  ...INFRA_ROUTES,
];

/** Nur öffentliche Routen (für Prerendering, Sitemap, E2E — ohne Admin) */
export const PUBLIC_ROUTES_CONFIG: RouteConfig[] = [
  ...APP_CONTENT_ROUTES,
  ...SYSTEM_ROUTES,
  ...INFRA_ROUTES,
];
