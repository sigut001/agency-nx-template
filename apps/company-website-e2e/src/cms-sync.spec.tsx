
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { APP_ROUTES_CONFIG } from '../../company-website/src/app/app.routes.config';

/**
 * CMS SYNC & ROUTE AVAILABILITY TEST
 * 
 * This test suite dynamically verifies every route that is expected to exist.
 * It reads from `e2e-routes.json` (generated during the build pipeline) to
 * ensure that even dynamic content (blog posts, products) is reachable.
 */

// 1. Load Routes (Synchronously)
// We must do this at the top level so we can iterate and generate test() blocks.
const routesPath = path.resolve(__dirname, '../../../e2e-routes.json');
let routesToTest: string[] = [];

if (fs.existsSync(routesPath)) {
  try {
    const jsonContent = fs.readFileSync(routesPath, 'utf-8');
    routesToTest = JSON.parse(jsonContent);
    console.log(`✅ Loaded ${routesToTest.length} routes from e2e-routes.json`);
  } catch (e) {
    console.warn('⚠️ Failed to parse e2e-routes.json, using static fallback.');
  }
}

// 2. Fallback to Static Config
if (routesToTest.length === 0) {
  console.log('ℹ️ No dynamic routes found, testing static routes only.');
  routesToTest = APP_ROUTES_CONFIG
    .filter(r => typeof r.path === 'string' && !r.path.includes(':'))
    .map(r => r.path);
}

test.describe('Route Availability & CMS Sync', () => {
  
  test.use({ ignoreHTTPSErrors: true });

  for (const route of routesToTest) {
    test(`should load the ${route} route`, async ({ page }) => {
      console.log(`Testing route: ${route}`);
      const response = await page.goto(route);
      
      // We expect a successful status code (200-399)
      // 404 would mean the route is known but not found on server
      const status = response?.status() ?? 0;
      expect(status, `Route ${route} returned status ${status}`).toBeLessThan(400); 
    });
  }

});
