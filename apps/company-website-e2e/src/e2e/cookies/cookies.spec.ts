import { test, expect } from '@playwright/test';
import { projectConfig } from '../../../../company-website/src/app/config/project-config';
import { COOKIE_CATALOG } from '../../../../company-website/src/app/config/cookie-catalog';
import { CookieDefinition } from '../../../../company-website/src/app/config/cookie-types';

test.describe('🍪 Automated "Test Matrix" - Cookie Consent', () => {
    
    // Helper to reset state
    test.beforeEach(async ({ page }) => {
        // Listen to console logs for debugging
        page.on('console', msg => {
            if (msg.type() === 'error') console.log(`[BROWSER ERROR] ${msg.text()}`);
            else console.log(`[BROWSER LOG] ${msg.text()}`);
        });

        await page.context().clearCookies();
        await page.goto('/');
        // Clear local storage to reset consent 
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        await page.reload();
    });

    /**
     * LOOP 1: Verify ACTIVE features
     */
    Object.keys(projectConfig.features).forEach(featureKey => {
        const isEnabled = projectConfig.features[featureKey];
        const definition = COOKIE_CATALOG[featureKey];

        if (!definition || !isEnabled) return;

        test.describe(`[ACTIVE] Feature: ${definition.name}`, () => {
            
            test('Scenario A: Reject All -> Should NOT have cookies', async ({ page }) => {
                console.log(`[Test] Checking for banner presence for ${definition.name}...`);
                
                try {
                    const banner = page.locator('#cc-main');
                    await banner.waitFor({ state: 'attached', timeout: 15000 });
                } catch (e) {
                    console.log(`[Test] TIMEOUT: Banner #cc-main not found. Taking diagnostic screenshot...`);
                    const screenshotPath = 'C:/Users/Simon/Desktop/web-entwicklung/templates/agency-nx-template/apps/company-website-e2e/test-results/cookies-fail-chromium.png';
                    await page.screenshot({ path: screenshotPath });
                    console.log(`[Test] Screenshot saved to ${screenshotPath}`);
                    throw e;
                }
                
                // Click the reject button (Necessary Only)
                const rejectBtn = page.locator('button[data-cc="accept-necessary"]');
                await rejectBtn.waitFor({ state: 'visible', timeout: 5000 });
                await rejectBtn.click();

                // Trigger Action (if needed)
                await triggerCookieAction(page, definition);

                // Verify NO cookies found
                const cookies = await page.context().cookies();
                for (const cookieName of definition.test.cookies) {
                    const found = cookies.find(c => c.name === cookieName);
                    expect(found, `Cookie '${cookieName}' should NOT be present after rejection`).toBeUndefined();
                }
            });

            test('Scenario B: Accept All -> Should HAVE cookies', async ({ page }) => {
                const banner = page.locator('#cc-main');
                await banner.waitFor({ state: 'attached', timeout: 10000 });
                
                // Click "Accept All"
                await page.click('button[data-cc="accept-all"]');

                // Trigger Action
                await triggerCookieAction(page, definition);

                // Verify Cookies FOUND
                await expect(async () => {
                    const cookies = await page.context().cookies();
                    for (const cookieName of definition.test.cookies) {
                        const found = cookies.find(c => c.name === cookieName);
                        expect(found, `Cookie '${cookieName}' SHOULD be present after consent`).toBeDefined();
                    }
                }).toPass({ timeout: 5000 });
            });
        });
    });

    /**
     * LOOP 2: Verify INACTIVE features
     */
    Object.keys(projectConfig.features).forEach(featureKey => {
        const isEnabled = projectConfig.features[featureKey];
        const definition = COOKIE_CATALOG[featureKey];

        if (!definition || isEnabled) return;

        test.describe(`[INACTIVE] Feature: ${definition.name}`, () => {
            test('Safety Check: Accept All -> Should STILL NOT have cookies', async ({ page }) => {
                const banner = page.locator('#cc-main');
                await banner.waitFor({ state: 'attached', timeout: 10000 });
                await page.click('button[data-cc="accept-all"]');

                // Trigger Action (Simulate user trying to use it)
                try {
                     await triggerCookieAction(page, definition);
                } catch (e) {
                    // Failures ignored for disabled features
                }

                // Verify NO cookies
                const cookies = await page.context().cookies();
                for (const cookieName of definition.test.cookies) {
                    const found = cookies.find(c => c.name === cookieName);
                    expect(found, `Cookie '${cookieName}' from DISABLED feature '${definition.name}' leaked!`).toBeUndefined();
                }
            });
        });
    });
});

/**
 * Helper to perform the necessary action to trigger a cookie
 */
async function triggerCookieAction(page: any, definition: CookieDefinition) {
    if (definition.test.trigger === 'page_load') {
        await page.waitForTimeout(1000);
    } else if (definition.test.trigger === 'interaction' && definition.test.interactionSelector) {
        const el = page.locator(definition.test.interactionSelector);
        if (await el.count() > 0 && await el.isVisible()) {
             await el.click();
             await page.waitForTimeout(1000);
        }
    }
}
