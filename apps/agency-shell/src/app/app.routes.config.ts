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

export const APP_ROUTES_CONFIG = [
  { path: '/', title: 'Willkommen bei Qubits Digital' },
  { path: '/kontakt', title: 'Kontakt' },
  { path: '/impressum', title: 'Impressum' },
  { path: '/datenschutz', title: 'Datenschutz' },
  { path: '/agb', title: 'AGB' }
];
