import { test, expect } from '@playwright/test';

/**
 * BOT Validation Test
 * Simulates a crawler to verify the "raw" HTML output for SEO and metadata.
 */

test.describe('Bot / Crawler Validation', () => {
  test('should have essential SEO meta tags on landing page', async ({ page }) => {
    await page.goto('/');
    
    // Check Title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    
    // Check Meta Description
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /.*/);

    // Check OpenGraph Tags (Social)
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.*/);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
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
    const response = await page.goto('/sitemap.xml');
    expect(response?.ok()).toBeTruthy();
    expect(await response?.text()).toContain('<urlset');
  });
});
