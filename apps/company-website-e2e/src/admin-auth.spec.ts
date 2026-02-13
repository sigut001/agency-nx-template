import { test, expect } from '@playwright/test';

test.describe('Admin Authentication', () => {
  test('should show login error with invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.admin-login')).toContainText('Login fehlgeschlagen');
  });

  test('should redirect to dashboard after successful login', async ({ page }) => {
    const testEmail = process.env.TEST_USER_EMAIL;
    const testPass = process.env.TEST_USER_PASSWORD;
    
    if (!testEmail || !testPass) {
      console.warn('Skipping login test: TEST_USER_EMAIL/PASSWORD not set');
      return;
    }

    await page.goto('/admin/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPass);
    await page.click('button[type="submit"]');
    
    // Adjust selector based on actual dashboard content
    await expect(page).toHaveURL(/.*admin\/dashboard/);
  });
});
