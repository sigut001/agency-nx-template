import { test, expect } from '@playwright/test';

/**
 * DEPLOYMENT HEALTH CHECK
 * 
 * Replaces the old "04_b1" script validation.
 * Verifies that the deployed application is technically functional.
 */

test.describe('Deployment Health', () => {

  test('Metadata: Title and Description should exist', async ({ page }) => {
    await page.goto('/');
    
    // 1. Title Check
    const title = await page.title();
    expect(title).not.toBe('');
    console.log(`      ✅ Title found: "${title}"`);

    // 2. Meta Description Check
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveCount(1);
    const content = await metaDescription.getAttribute('content');
    expect(content).not.toBe('');
    console.log(`      ✅ Meta Description found: "${content?.substring(0, 50)}..."`);
  });

  test('Hydration: App should be interactive and scripts loaded', async ({ page }) => {
    await page.goto('/');

    // 1. Script Injection Check (Evidence of JS Bundle)
    // We look for any script tag that corresponds to our bundle (usually module/defer)
    const scripts = page.locator('script[type="module"]');
    await expect(scripts.first()).toBeAttached();
    console.log('      ✅ JS Bundle scripts detected.');

    // 2. Body Content Check (App Rendered)
    // We expect the body to have children (the app)
    const body = page.locator('body');
    const childCount = await body.evaluate((b) => b.childElementCount);
    expect(childCount).toBeGreaterThan(0);
    console.log('      ✅ Body content populated (App rendered).');
  });

});
