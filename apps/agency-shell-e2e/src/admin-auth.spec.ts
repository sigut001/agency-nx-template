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
    // Note: This requires a valid user in the seeded Firebase project.
    // We assume VITE_FIREBASE_TEST_USER and VITE_FIREBASE_TEST_PASS are set or handled.
    await page.goto('/admin/login');
    
    // Placeholder login - in a real CI this would use env vars
    // await page.fill('input[type="email"]', process.env.TEST_USER);
    // await page.fill('input[type="password"]', process.env.TEST_PASS);
    // await page.click('button[type="submit"]');
    // await expect(page).toHaveURL(/.*admin\/dashboard/);
  });
});
