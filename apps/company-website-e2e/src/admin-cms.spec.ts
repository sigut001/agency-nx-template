import { test, expect } from '@playwright/test';

test.describe('Admin CMS Editing Flow', () => {
  // We assume the user is already logged in or we bypass it for this functional test 
  // if we want to test just the Firestore update -> Frontend sync.
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
    });
  });

  test('should allow editing a page and verify changes on the public route', async ({ page }) => {
    test.setTimeout(60000); // Allow 60s for slow preview environment
    const testEmail = process.env.OWNER_USER_EMAIL;
    const testPass = process.env.OWNER_USER_PASSWORD;
    
    if (!testEmail || !testPass) {
      throw new Error('OWNER_USER_EMAIL or OWNER_USER_PASSWORD not set in environment');
    }

    const testContent = `Automated Test Content ${Date.now()}`;
    
    // 0. Login first (since /admin/edit is protected)
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPass);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*admin\/dashboard/);

    // CRITICAL: Wait for Admin Role to sync
    // The presence of "Benutzer verwalten" confirms the client has the 'owner' claim/role.
    await expect(page.locator('text=Benutzer verwalten')).toBeVisible({ timeout: 15000 });

    // 1. Go to Admin Edit Page
    await page.goto('/admin/edit/home');
    
    // 2. Change content
    // Wait for the "Loading..." state to disappear if it exists
    await expect(page.locator('text=Lädt...')).toBeHidden();
    
    const textarea = page.locator('#pageContent');
    await expect(textarea).toBeVisible();
    await textarea.fill(testContent);
    
    // 3. Save
    await page.click('button:has-text("Speichern")');
    await expect(page.locator('text=Gespeichert!')).toBeVisible();
    
    // 4. Verify on public home page
    await page.goto('/');
    await expect(page.locator('body')).toContainText(testContent);
    
    // 5. Cleanup (optional)
    await page.goto('/admin/dashboard');
    await page.click('button:has-text("Logout")');
  });
});
