import { test, expect } from '@playwright/test';

test.describe('CMS Content Synchronization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display global navigation items from Firestore', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check for standard navigation items seeded earlier
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Leistungen' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Kontakt' })).toBeVisible();
  });

  test('should load dynamic page content from Firestore (Home)', async ({ page }) => {
    // The home page should display the seeded title
    // "Willkommen bei Qubits Digital"
    await expect(page.locator('h1')).toContainText('Willkommen bei Qubits Digital');
  });

  test('should navigate to imprint and display CMS content', async ({ page }) => {
    await page.goto('/imprint');
    await expect(page.locator('h1')).toContainText('Impressum');
    // Content seeded: "Hier stehen die rechtlichen Informationen..."
    await expect(page.locator('section')).toContainText('Hier stehen die rechtlichen Informationen');
  });
});
