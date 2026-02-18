import { APP_ROUTES_CONFIG } from './app.routes.config';
import { PageComponent } from './shared/interfaces/cms.interfaces';

// --- Imports (System/Legal) ---
import { LegalPage } from './routes/system/legal/LegalPage';

// --- Imports (App) ---
import { Home } from './routes/app/Home';
import { Contact } from './routes/app/Contact';
import { BlogPost } from './routes/app/BlogPost';
import { ProductPage } from './routes/app/ProductPage';

/**
 * APPLICATION ROUTE DEFINITIONS
 * 
 * IMPORTANT FOR DEVELOPERS:
 * When adding new routes, please follow these steps to ensure E2E tests remain valid:
 * 
 * 1. Add the route path and title to `app.routes.app.ts` (App) OR `app.routes.system.ts` (System).
 * 2. Add the component mapping below in the respective MAP.
 */

// Protected System Mapping
const SYSTEM_MAP: Record<string, PageComponent> = {
  '/impressum': LegalPage,
  '/datenschutz': LegalPage,
  '/agb': LegalPage,
  '/lizenzen': LegalPage,
};

// Editable App Mapping
const APP_MAP: Record<string, PageComponent> = {
  '/': Home,
  '/kontakt': Contact,
  '/blog/:slug': BlogPost,
  '/produkte/:slug': ProductPage,
};

const COMPONENT_MAP = { ...SYSTEM_MAP, ...APP_MAP };

export const APP_ROUTES = APP_ROUTES_CONFIG.map(route => {
  // Select component based on path, fallback to NULL to force error if missing in map?
  // Or just use LegalPage as 'GenericPage'? 
  // Let's stick to the map. If not in map, we have a problem (or static generic?).
  // For now, assume all expected routes are in map. 
  // If we add new routes to config, we MUST add them here -> strictness!
  
  const Component = COMPONENT_MAP[route.path];
  
  if (!Component) {
    console.warn(`[Routes] No component mapped for path "${route.path}". Using Fallback (LegalPage).`);
  }

  const FinalComponent = Component || LegalPage;

  return {
    ...route,
    element: (
        <FinalComponent 
            collection={route.collection!} // (! assertion because config validation guarantees it)
            configTitle={route.title}
        />
    )
  };
});


