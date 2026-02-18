/**
 * APPLICATION ROUTES CONFIGURATION
 * 
 * EDITABLE SECTOR. AI Workspace.
 * This file is for marketing, content, and feature routes.
 */

import { RouteConfig } from './app.routes.config';

export const APP_CONTENT_ROUTES: RouteConfig[] = [
  { path: '/', title: 'Willkommen bei Qubits Digital', type: 'static', collection: 'static_pages/app/marketing/home' },
  { path: '/kontakt', title: 'Kontakt', type: 'static', collection: 'static_pages/app/marketing/kontakt' },

  // --- Dynamic Content ---
  { path: '/blog/:slug', title: 'Blog', type: 'dynamic', collection: 'dynamic_pages/blog/documents' },
  { path: '/produkte/:slug', title: 'Produkte', type: 'dynamic', collection: 'dynamic_pages/produkte/documents' }
];
