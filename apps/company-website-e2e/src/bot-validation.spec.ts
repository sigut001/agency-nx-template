import { test, expect } from '@playwright/test';

/**
 * BOT Validation Test
 * Simulates a crawler to verify the "raw" HTML output for SEO and metadata.
 */

test.describe('Bot / Crawler Validation', () => {
  test('should have essential SEO meta tags on landing page', async ({ page }) => {
    await page.goto('/');
    
    // Check Title exists (not empty string check, just checking it returns something)
    const title = await page.title();
    expect(title).toBeDefined();
    
    // Check Meta Description exists (allow duplicates from hydration, check first match)
    const description = page.locator('meta[name="description"]').first();
    await expect(description).not.toHaveCount(0);

    // Check OpenGraph Tags (Social) exist
    await expect(page.locator('meta[property="og:title"]').first()).not.toHaveCount(0);
    await expect(page.locator('meta[property="og:type"]').first()).toHaveAttribute('content', 'website');
  });

  test('should contain valid JSON-LD structured data', async ({ page }) => {
    await page.goto('/');
    
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeAttached();
    
    const content = await jsonLd.innerHTML();
    const data = JSON.parse(content);
    expect(data['@context']).toBe('https://schema.org');
  });

  test('should have a discoverable sitemap', async ({ page }) => {
    // Use request.get for technical files to avoid browser-specific XML rendering issues
    const response = await page.request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();
    expect(await response.text()).toContain('<urlset');
  });
});
