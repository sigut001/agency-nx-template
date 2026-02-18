import { test, expect } from '@playwright/test';

/**
 * INFRASTRUCTURE: Verification of License and Error Routes
 * This suite ensures that the legal compliance and 404 behavior 
 * are correctly implemented and accessible.
 */

test.describe('Infrastructure: License and Error Routing', () => {
  
  test('License: Should be accessible and contain content', async ({ page }) => {
    await page.goto('/lizenzen');
    
    // Check for the heading which we know is in the Firestore content
    const heading = page.locator('h1', { hasText: 'Drittanbieter-Lizenzen' });
    await expect(heading).toBeVisible({ timeout: 10000 });
    
    // Check for the timestamp which we just added
    const timestamp = page.locator('p', { hasText: 'Stand:' });
    await expect(timestamp).toBeVisible();
    
    // Check if the table contains at least some packages (searching for common ones)
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    const firebasePackage = page.locator('td', { hasText: 'firebase' }).first();
    await expect(firebasePackage).toBeVisible();
  });

  test('404: Should show custom error page for non-existent routes', async ({ page }) => {
    // Navigate to a guaranteed non-existent route
    await page.goto('/dieser-pfad-existiert-nicht-12345');
    
    const errorHeading = page.locator('h1', { hasText: '404 - Seite nicht gefunden' });
    await expect(errorHeading).toBeVisible();
    
    const homeLink = page.locator('a', { hasText: 'Zurück zur Startseite' });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute('href', '/');
  });

  test('Footer: Should contain links to all legal pages including Lizenzen', async ({ page }) => {
    await page.goto('/');
    
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    const links = [
      { text: 'Impressum', href: '/impressum' },
      { text: 'Datenschutz', href: '/datenschutz' },
      { text: 'AGB', href: '/agb' },
      { text: 'Lizenzen', href: '/lizenzen' }
    ];
    
    for (const link of links) {
      const locator = footer.locator(`a:has-text("${link.text}")`);
      await expect(locator).toBeVisible();
      await expect(locator).toHaveAttribute('href', link.href);
    }
  });
});
