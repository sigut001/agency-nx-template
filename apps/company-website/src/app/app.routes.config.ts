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


import { SYSTEM_ROUTES } from './app.routes.system';
import { APP_CONTENT_ROUTES } from './app.routes.app';

export interface RouteConfig {
  path: string;
  title: string;
  type: 'static' | 'dynamic';
  collection?: string; // Firestore collection name (for dynamic routes) or specific doc (for static)
}

export const APP_ROUTES_CONFIG: RouteConfig[] = [
  ...APP_CONTENT_ROUTES,
  ...SYSTEM_ROUTES
];
