import { Home } from './routes/Home';
import { Contact } from './routes/Contact';
import { LegalPage } from './routes/LegalPage';
import { APP_ROUTES_CONFIG } from './app.routes.config';

/**
 * APPLICATION ROUTE DEFINITIONS
 * 
 * IMPORTANT FOR DEVELOPERS:
 * When adding new routes, please follow these steps to ensure E2E tests remain valid:
 * 
 * 1. Add the route path and title to `app.routes.config.ts` FIRST.
 *    - This ensures `cms-sync.spec.ts` knows about the new route and tests its reachability.
 * 
 * 2. Add the component mapping below in `APP_ROUTES`.
 *    - Use the config object to link the path to the React Component.
 */

export const APP_ROUTES = APP_ROUTES_CONFIG.map(route => ({
  ...route,
  element: 
    route.path === '/' ? <Home /> : 
    route.path === '/kontakt' ? <Contact /> : 
    <LegalPage title={route.title} />
}));

