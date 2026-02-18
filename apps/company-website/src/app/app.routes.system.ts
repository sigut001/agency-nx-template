/**
 * SYSTEM ROUTES CONFIGURATION
 * 
 * PROTECTED SECTOR. DO NOT EDIT OR DELETE.
 * This file contains infrastructure (Admin, Error) and legal routes.
 */

import { RouteConfig } from './app.routes.config';

export const SYSTEM_ROUTES: RouteConfig[] = [
  // --- Infrastructure ---
  { path: '/impressum', title: 'Impressum', type: 'static', collection: 'static_pages/system/legal/impressum' },
  { path: '/datenschutz', title: 'Datenschutz', type: 'static', collection: 'static_pages/system/legal/datenschutz' },
  { path: '/agb', title: 'AGB', type: 'static', collection: 'static_pages/system/legal/agb' },
  { path: '/lizenzen', title: 'Lizenzen', type: 'static', collection: 'static_pages/system/legal/lizenzen' },
];
