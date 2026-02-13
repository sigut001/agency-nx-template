import { test, expect } from '@playwright/test';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { APP_ROUTES_CONFIG } from '../../agency-shell/src/app/app.routes.config';

test.describe('Route Availability & CMS Sync', () => {
  
  test.use({ ignoreHTTPSErrors: true });

  for (const route of APP_ROUTES_CONFIG) {
    // Only test if it's a static path (string), not regex/dynamic params if any exist in future
    if (typeof route.path === 'string' && !route.path.includes(':')) {
      test(`should load the ${route.title || route.path} route`, async ({ page }) => {
        const response = await page.goto(route.path);
        expect(response?.ok()).toBeTruthy();
      });
    }
  }

});
