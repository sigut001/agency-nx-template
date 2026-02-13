/**
 * CENTRAL ROUTE CONFIGURATION (Pure Data)
 * 
 * This file contains the route definitions used by BOTH the React Application and the E2E Tests.
 * It must NOT contain any React components, JSX, or imports that Node.js cannot execute.
 * 
 * Usage:
 * - App: Imports this to map paths to components in `routes.tsx`.
 * - Tests: Imports this to know which URLs to verify in `cms-sync.spec.ts`.
 */


export interface RouteConfig {
  path: string;
  title: string;
  type: 'static' | 'dynamic';
  collection?: string; // Firestore collection name (for dynamic routes) or specific doc (for static)
}

export const APP_ROUTES_CONFIG: RouteConfig[] = [
  // --- Static Pages ---
  { path: '/', title: 'Willkommen bei Qubits Digital', type: 'static', collection: 'static_pages/home' },
  { path: '/kontakt', title: 'Kontakt', type: 'static', collection: 'static_pages/contact' },
  { path: '/impressum', title: 'Impressum', type: 'static', collection: 'static_pages/imprint' },
  { path: '/datenschutz', title: 'Datenschutz', type: 'static', collection: 'static_pages/privacy' },
  { path: '/agb', title: 'AGB', type: 'static', collection: 'static_pages/terms' },

  // --- Dynamic Pages ---
  { path: '/blog/:slug', title: 'Blog', type: 'dynamic', collection: 'dynamic_pages/blog/posts' },
  { path: '/produkte/:slug', title: 'Produkte', type: 'dynamic', collection: 'dynamic_pages/products/items' }
];

