import { test, expect } from '@playwright/test';

/**
 * ADMIN RBAC & SEO INTEGRATION TEST
 * Verifies the full flow: Owner Login -> SEO Change -> User Creation -> Editor Login -> RBAC Check
 */

test.describe('Admin: RBAC & SEO Integration', () => {
  const OWNER_EMAIL = process.env.OWNER_USER_EMAIL || 'test-owner@qubits-digital.de';
  const OWNER_PASS = process.env.OWNER_USER_PASSWORD || 'TestPass123!';
  const EDITOR_EMAIL = `test-editor-${Date.now()}@qubits-digital.de`;
  const EDITOR_PASS = 'EditorPass123!';

  test('Full Lifecycle: SEO Flag, User Creation and RBAC', async ({ page }) => {
    test.setTimeout(90000); // Allow 90s for full lifecycle with multiple logins
    // 1. LOGIN AS OWNER
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', OWNER_EMAIL);
    await page.fill('input[type="password"]', OWNER_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin/dashboard');

    // CRITICAL: Wait for Admin Role to sync
    // The presence of "Benutzer verwalten" confirms the client has the 'owner' claim/role.
    await expect(page.locator('text=Benutzer verwalten')).toBeVisible({ timeout: 15000 });

    // 2. CHANGE SEO & VERIFY FLAG
    await page.locator('li', { hasText: 'Startseite' }).getByText('Bearbeiten').click();
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
    // Navigate to dashboard first to ensure consistent state/menu
    await page.goto('/admin/dashboard'); 
    await expect(page).toHaveURL('/admin/dashboard');
    
    // Use a specific locator for the logout button in the dashboard
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('/admin/login');

    await page.fill('input[type="email"]', EDITOR_EMAIL);
    await page.fill('input[type="password"]', EDITOR_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin/dashboard');
 
    // 5. RBAC CHECK: No User Management for Editor
    const userMgmtBtn = page.locator('text=Benutzer verwalten');
    await expect(userMgmtBtn).toBeHidden();
 
    // 6. RBAC CHECK: Attempt direct access to /admin/users
    await page.goto('/admin/users');
    await expect(page).toHaveURL('/admin/dashboard'); // Should be redirected back
 
    // 7. CONTENT HISTORY CHECK
    await page.locator('li', { hasText: 'Startseite' }).getByText('Bearbeiten').click();
    
    // Webkit/Safari often times out on 'networkidle' due to background Firebase polling.
    // We rely on waitForURL and the high-timeout toBeVisible check instead.
    await page.waitForURL(/\/admin\/edit\/home/);
    
    // Increased timeout for slow rendering engines (Webkit/Safari)
    await expect(page.locator('aside.history-sidebar')).toBeVisible({ timeout: 15000 });

    // Retry logic for history entry (Firestore Eventual Consistency)
    try {
      await expect(page.locator('li:has-text("Snapshot laden")').first()).toBeVisible({ timeout: 5000 });
    } catch (_e) {
      console.log('History entry not found immediately, refreshing page to force fetch...');
      await page.reload();
      await page.waitForURL(/\/admin\/edit\/home/);
      await expect(page.locator('aside.history-sidebar')).toBeVisible();
      // Give it more time after reload
      await expect(page.locator('li:has-text("Snapshot laden")').first()).toBeVisible({ timeout: 15000 });
    }

    console.log(`✅ Lifecycle test passed for ${EDITOR_EMAIL}`);
  });
});
