import { test, expect } from '@playwright/test';

/**
 * ADMIN RBAC & SEO INTEGRATION TEST
 * Verifies the full flow: Owner Login -> SEO Change -> User Creation -> Editor Login -> RBAC Check
 */

test.describe('Admin: RBAC & SEO Integration', () => {
  const OWNER_EMAIL = 'test-owner@qubits-digital.de';
  const OWNER_PASS = 'TestPass123!';
  const EDITOR_EMAIL = `test-editor-${Date.now()}@qubits-digital.de`;
  const EDITOR_PASS = 'EditorPass123!';

  test('Full Lifecycle: SEO Flag, User Creation and RBAC', async ({ page }) => {
    // 1. LOGIN AS OWNER
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', OWNER_EMAIL);
    await page.fill('input[type="password"]', OWNER_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin/dashboard');

    // 2. CHANGE SEO & VERIFY FLAG
    await page.click('text=Startseite'); // Click "Bearbeiten" link for home
    await page.waitForURL(/\/admin\/edit\/home/);
    
    const newTitle = `Audit Title ${Date.now()}`;
    await page.fill('#seoTitle', newTitle);
    await page.click('button:has-text("Speichern")');
    
    // Check for "Rebuild geplant" status
    await expect(page.locator('text=Gespeichert! (Rebuild geplant)')).toBeVisible();

    // 3. CREATE EDITOR USER
    await page.goto('/admin/dashboard');
    await page.click('text=Benutzer verwalten');
    await page.waitForURL('/admin/users');

    await page.fill('#userEmail', EDITOR_EMAIL);
    await page.fill('#userPassword', EDITOR_PASS);
    // Role is editor by default
    await page.click('button:has-text("Account erstellen")');
    await expect(page.locator('text=Benutzer erfolgreich angelegt!')).toBeVisible();

    // 4. LOGOUT & LOGIN AS EDITOR
    await page.click('text=Logout');
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', EDITOR_EMAIL);
    await page.fill('input[type="password"]', EDITOR_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin/dashboard');

    // 5. RBAC CHECK: No User Management for Editor
    const userMgmtBtn = page.locator('text=Benutzer verwalten');
    await expect(userMgmtBtn).not.toBeVisible();

    // 6. RBAC CHECK: Attempt direct access to /admin/users
    await page.goto('/admin/users');
    await expect(page).toHaveURL('/admin/dashboard'); // Should be redirected back

    // 7. CONTENT HISTORY CHECK
    await page.click('text=Startseite');
    await expect(page.locator('aside.history-sidebar')).toBeVisible();
    await expect(page.locator('li:has-text("Snapshot laden")')).toBeVisible();

    console.log(`✅ Lifecycle test passed for ${EDITOR_EMAIL}`);
  });
});
