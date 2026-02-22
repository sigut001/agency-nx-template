import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { PUBLIC_ROUTES_CONFIG } from '../../company-website/src/app/app.routes.config';

/**
 * PAGE QUALITY AUDIT (Global)
 * 
 * This suite iterates through every public route discovered during build
 * or defined in the config. It enforces fundamental quality standards:
 * 1. Accessibility (HTTP 200/404)
 * 2. Structure (Exactly 1 non-empty H1)
 * 3. SEO (Title and Description present)
 * 4. Content (Minimum visible text content)
 */

// 1. Load Routes (Synchronously)
const routesPath = path.resolve(__dirname, '../../../e2e-routes.json');
let routesToTest: string[] = [];

if (fs.existsSync(routesPath)) {
  try {
    const jsonContent = fs.readFileSync(routesPath, 'utf-8');
    routesToTest = JSON.parse(jsonContent);
  } catch (e) {
    console.warn('⚠️ Failed to parse e2e-routes.json, using static fallback.');
  }
}

// 2. Fallback to Static Config (Public routes only)
if (routesToTest.length === 0) {
  routesToTest = PUBLIC_ROUTES_CONFIG
    .filter(r => typeof r.path === 'string' && !r.path.includes(':'))
    .map(r => r.path);
}

test.describe('Global Page Quality Audit', () => {
  
  test.use({ ignoreHTTPSErrors: true });

  for (const route of routesToTest) {
    test(`Quality Audit: ${route}`, async ({ page }) => {
      console.log(`\n--- 🔍 AUDIT START: ${route} ---`);
      
      const response = await page.goto(route);
      const status = response?.status() ?? 0;

      // A. HTTP Status Check
      console.log(`[CHECK] HTTP Status`);
      if (route === '*') {
        console.log(`  Expected: 404 (Wildcard)`);
        console.log(`  Received: ${status}`);
        expect(status, `Wildcard route should return 404`).toBe(404);
      } else {
        console.log(`  Expected: < 400 (Accessible)`);
        console.log(`  Received: ${status}`);
        expect(status, `Route ${route} should be accessible`).toBeLessThan(400); 
        
        // --- Fundamental SEO & Structure Checks ---
        
        // B. Structure: Exactly one non-empty h1
        console.log(`[CHECK] H1 Count & Content`);
        const h1s = page.locator('h1');
        const count = await h1s.count();
        console.log(`  Expected Count: 1`);
        console.log(`  Received Count: ${count}`);
        await expect(h1s).toHaveCount(1);
        
        const h1Text = (await h1s.innerText()).trim();
        console.log(`  Expected: Non-empty string`);
        console.log(`  Received: "${h1Text}"`);
        expect(h1Text.length).toBeGreaterThan(0);

        // C. SEO: Title
        console.log(`[CHECK] Page Title`);
        const pageTitle = await page.title();
        console.log(`  Expected: Non-empty string`);
        console.log(`  Received: "${pageTitle}"`);
        expect(pageTitle.trim().length).toBeGreaterThan(0);

        // D. SEO: Description
        console.log(`[CHECK] Meta Description`);
        const description = await page.locator('meta[name="description"]').getAttribute('content');
        console.log(`  Expected: Description to exist`);
        console.log(`  Received: "${description ?? 'MISSING'}"`);
        expect(description?.trim().length).toBeGreaterThan(0);

        // E. SEO: Structured Data (JSON-LD)
        console.log(`[CHECK] Structured Data (JSON-LD)`);
        const jsonLd = page.locator('script[type="application/ld+json"]');
        const ldCount = await jsonLd.count();
        console.log(`  Expected Count: 1`);
        console.log(`  Received Count: ${ldCount}`);
        await expect(jsonLd).toHaveCount(1);
        
        const ldContent = await jsonLd.first().innerText();
        console.log(`  JSON-LD Length: ${ldContent.length} chars`);
        expect(ldContent.length).toBeGreaterThan(20);

        // F. Hydration Check (SPA Activation)
        console.log(`[CHECK] Hydration (JS Bundles)`);
        // Pattern: Vite/RR7 uses modulepreload for assets and an inline module script to boot entry.client
        const modulePreloads = page.locator('link[rel="modulepreload"]');
        const bootScript = page.locator('script[type="module"]');
        
        const preloadCount = await modulePreloads.count();
        const bootCount = await bootScript.count();
        
        console.log(`  Expected: Module markers (Preloads & Boot Scripts)`);
        console.log(`  Received: ${preloadCount} preloads, ${bootCount} module scripts`);
        
        // Ensure the infrastructure for SPA handover is present
        expect(preloadCount, `Route ${route} missing modulepreload markers`).toBeGreaterThan(0);
        expect(bootCount, `Route ${route} missing inline module boot script`).toBeGreaterThan(0);

        // Verify the boot script contains the entry.client call (the "Pattern")
        const bodyHtml = await page.innerHTML('body');
        const hasClientEntry = bodyHtml.includes('entry.client');
        console.log(`  Pattern Check: entry.client found in body? ${hasClientEntry ? 'YES' : 'NO'}`);
        expect(hasClientEntry, `Route ${route} missing SPA entry point (entry.client)`).toBe(true);

        // G. Content Volume
        console.log(`[CHECK] Text Content volume`);
        const main = page.locator('main');
        const contentContainer = (await main.count()) > 0 ? main : page.locator('body');
        const textContent = (await contentContainer.innerText()).trim();
        console.log(`  Expected: > 0 characters of text content`);
        console.log(`  Received: ${textContent.length} characters`);
        expect(textContent.length).toBeGreaterThan(0);
      } 
      console.log(`--- ✅ AUDIT COMPLETE: ${route} ---\n`);
    });
  }
});
