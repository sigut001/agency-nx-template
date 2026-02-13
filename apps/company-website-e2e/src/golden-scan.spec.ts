import { test, expect } from '@playwright/test';

/**
 * GOLDEN SCAN: Automated Quality Audit
 * This test suite runs headless and verifies SEO, A11y basics, and Structured Data.
 */

test.describe('Golden Scan: Quality Audit', () => {
  
  test.beforeEach(async ({ page }) => {
    // We expect the app to be running on 4301 (Preview)
    await page.goto('/');
  });

  test('SEO: Meta tags should be present and valid', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeDefined();
    
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveCount(1);
    
    // OpenGraph
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
  });

  test('SEO: Sitemap and Robots should be accessible', async ({ page }) => {
    const sitemap = await page.request.get('/sitemap.xml');
    expect(sitemap.ok()).toBeTruthy();
    expect(await sitemap.text()).toContain('<urlset');

    const robots = await page.request.get('/robots.txt');
    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).toContain('Sitemap:');
  });

  test('Structured Data: JSON-LD should be valid and present', async ({ page }) => {
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeAttached();
    
    const content = await jsonLd.first().innerHTML();
    const data = JSON.parse(content);
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBeDefined();
  });

  test('Performance: Core Web Vitals basics (Console Check)', async ({ page }) => {
    // Check if there are any significant console errors that would block rendering
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') logs.push(msg.text());
    });
    
    await page.reload({ waitUntil: 'load' });
    const filteredLogs = logs.filter(l => 
      !l.includes('reCAPTCHA') && 
      !l.includes('analytics') && 
      !l.includes('firestore') &&
      !l.includes('code=unavailable') // Suppress transient connection warnings in Webkit
    );
    expect(filteredLogs, `Unexpected console errors found:\n${filteredLogs.join('\n')}`).toHaveLength(0); 
  });

  test('SSG: Content should be available in the static markup', async ({ page }) => {
    // This tests if the content is there even before JS might finish hydrating fully
    const bodyHtml = await page.content();
    expect(bodyHtml).toContain('<main');
  });
});
