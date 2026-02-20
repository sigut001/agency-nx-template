import { test, expect } from '@playwright/test';

/**
 * INFRASTRUCTURE: Verification of License and Error Routes
 * This suite ensures that the legal compliance and 404 behavior 
 * are correctly implemented and accessible.
 */

test.describe('Infrastructure: License and Error Routing', () => {
  
  test('404: Should show custom error page for non-existent routes', async ({ page }) => {
    console.log(`\n--- 🔍 CHECK: 404 Error Page ---`);
    const path = '/dieser-pfad-existiert-nicht-12345';
    console.log(`[ACTION] Navigating to: ${path}`);
    await page.goto(path);
    
    console.log(`[CHECK] Visibility of 404 Heading`);
    const errorHeading = page.locator('h1', { hasText: '404 - Seite nicht gefunden' });
    const isVisible = await errorHeading.isVisible();
    console.log(`  Expected: Visible`);
    console.log(`  Received: ${isVisible ? 'YES' : 'NO'}`);
    await expect(errorHeading).toBeVisible();
    
    console.log(`[CHECK] Home link presence and target`);
    const homeLink = page.locator('a', { hasText: 'Zurück zur Startseite' });
    const href = await homeLink.getAttribute('href');
    console.log(`  Expected href: "/"`);
    console.log(`  Received href: "${href}"`);
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute('href', '/');
    console.log(`--- ✅ 404 CHECK COMPLETE ---\n`);
  });

  test('Footer: Should contain links to all legal pages including Lizenzen', async ({ page }) => {
    console.log(`\n--- 🔍 CHECK: Footer Legal Links ---`);
    await page.goto('/');
    
    const footer = page.locator('footer');
    console.log(`[CHECK] Footer visibility`);
    await expect(footer).toBeVisible();
    
    const links = [
      { text: 'Impressum', href: '/impressum' },
      { text: 'Datenschutz', href: '/datenschutz' },
      { text: 'AGB', href: '/agb' },
      { text: 'Lizenzen', href: '/lizenzen' }
    ];
    
    for (const link of links) {
      console.log(`[CHECK] Link: ${link.text}`);
      const locator = footer.locator(`a:has-text("${link.text}")`);
      const isVisible = await locator.isVisible();
      const href = await locator.getAttribute('href');
      console.log(`  Expected: Visible, href="${link.href}"`);
      console.log(`  Received: ${isVisible ? 'YES' : 'NO'}, href="${href}"`);
      await expect(locator).toBeVisible();
      await expect(locator).toHaveAttribute('href', link.href);
    }
    console.log(`--- ✅ FOOTER CHECK COMPLETE ---\n`);
  });

  test('SEO: Sitemap and Robots.txt should be accessible', async ({ page }) => {
    console.log(`\n--- 🔍 CHECK: SEO Assets (Sitemap & Robots) ---`);
    
    // 1. Robots.txt
    console.log(`[ACTION] Fetching /robots.txt`);
    const robotsResponse = await page.goto('/robots.txt');
    
    console.log(`  Expected Status: 200`);
    console.log(`  Received Status: ${robotsResponse?.status()}`);
    expect(robotsResponse?.status()).toBe(200);

    const robotsText = await robotsResponse?.text() || '';
    console.log(`[CHECK] Robots.txt Content Patterns`);
    const hasAgent = robotsText.includes('User-agent: *');
    const hasSitemap = robotsText.includes('Sitemap:');
    console.log(`  Expected: User-agent and Sitemap keywords`);
    console.log(`  Received: User-agent=${hasAgent ? 'YES' : 'NO'}, Sitemap=${hasSitemap ? 'YES' : 'NO'}`);
    expect(robotsText).toContain('User-agent: *');
    expect(robotsText).toContain('Sitemap:');

    // 2. Sitemap.xml
    console.log(`[ACTION] Fetching /sitemap.xml`);
    const sitemapResponse = await page.goto('/sitemap.xml');
    
    console.log(`  Expected Status: 200`);
    console.log(`  Received Status: ${sitemapResponse?.status()}`);
    expect(sitemapResponse?.status()).toBe(200);

    const sitemapXml = await sitemapResponse?.text() || '';
    console.log(`[CHECK] Sitemap.xml Structure`);
    const isXml = sitemapXml.includes('<?xml');
    const hasUrlset = sitemapXml.includes('<urlset');
    console.log(`  Expected: xml tag and urlset root`);
    console.log(`  Received: xml=${isXml ? 'YES' : 'NO'}, urlset=${hasUrlset ? 'YES' : 'NO'}`);
    expect(sitemapXml).toContain('<?xml');
    expect(sitemapXml).toContain('<urlset');
    console.log(`--- ✅ SEO ASSETS CHECK COMPLETE ---\n`);
  });
});
