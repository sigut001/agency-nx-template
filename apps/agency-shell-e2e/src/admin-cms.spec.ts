import { test, expect } from '@playwright/test';

test.describe('Admin CMS Editing Flow', () => {
  // We assume the user is already logged in or we bypass it for this functional test 
  // if we want to test just the Firestore update -> Frontend sync.
  
  test('should allow editing a page and verify changes on the public route', async ({ page }) => {
    const testContent = `Automated Test Content ${Date.now()}`;
    
    // 1. Go to Admin Edit Page
    await page.goto('/admin/edit/home');
    
    // 2. Change content
    const textarea = page.locator('textarea');
    await textarea.fill(testContent);
    
    // 3. Save
    await page.click('button:has-text("Speichern")');
    await expect(page.locator('p:has-text("Gespeichert!")')).toBeVisible();
    
    // 4. Verify on public home page
    await page.goto('/');
    await expect(page.locator('body')).toContainText(testContent);
  });
});
