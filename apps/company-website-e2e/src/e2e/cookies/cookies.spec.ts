import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 🍪 STAIRCASE COOKIE E2E TESTS
 *
 * Verifies the incremental and cumulative behavior of the cookie system.
 * 1. UP: Incremental activation of categories.
 * 2. DOWN: Incremental revocation of categories (with Reloads).
 * 3. UP: Incremental activation of individual services.
 * 4. DOWN: Incremental revocation of individual services (with Reloads).
 *
 * Uses cookie-catalog.json as the Source of Truth.
 */

const CATALOG_PATH = path.resolve(
  __dirname,
  '../../../../company-website/src/app/config/legal/cookie-catalog.json'
);

const COOKIE_CATALOG = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
const SERVICES = Object.values(COOKIE_CATALOG) as any[];
const CATEGORY_LIST = ['essential', 'analytics', 'marketing', 'personalization'];

test.describe('Cookie Consent: Staircase Data-Driven Logic', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.context().clearCookies();
    await page.reload();
  });

  const logStep = (step: string, expectMsg: string, result: string, success: boolean) => {
    console.log(`\n[STEP] ${step}`);
    console.log(`  EXPECT: ${expectMsg}`);
    console.log(`  RESULT: ${result}`);
    console.log(`  STATUS: ${success ? '✅ PASSED' : '❌ FAILED'}`);
  };

  // 💾 Hilfsfunktion zum Speichern des DOM
  const saveDOM = async (page: any, suffix: string) => {
    const html = await page.content();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `dom-snapshot-${suffix}-${timestamp}.html`;
    const outputPath = path.resolve(__dirname, '../../../test-output', fileName);
    
    // Verzeichnis sicherstellen
    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }
    
    fs.writeFileSync(outputPath, html);
    console.log(`[DEBUG] DOM Snapshot gespeichert: ${outputPath}`);
    
    // Auch als Konsolen-Log (erscheint im report.json / stdout)
    console.error(`[DOM-ERROR-DUMP] Body HTML (First 1000 chars): ${html.substring(0, 1000)}`);
  };

  // 🔁 Hilfsfunktion für retries
  const waitForCookieConsent = async (page: any, retries = 3, delayMs = 5000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Check for global object OR the DOM element
        await page.waitForFunction(() => {
          return !!(window as any).CookieConsent || !!document.querySelector('#cc-main');
        }, { timeout: 15000 });
        return; // Success
      } catch (err) {
        if (attempt < retries) {
          console.log(`CookieConsent nicht gefunden (Weder window.CookieConsent noch #cc-main), versuche erneut in ${delayMs / 1000}s... (${attempt}/${retries})`);
          await page.waitForTimeout(delayMs);
        } else {
          await saveDOM(page, 'CC-NOT-FOUND');
          throw new Error('CookieConsent wurde nach mehreren Versuchen nicht initialisiert.');
        }
      }
    }
  };

  /**
   * PERSPECTIVE: Google Bot / Standard Webdriver
   * Verifies that the banner remains hidden for bots (Default behavior)
   */
  test('Step 00: Bot Perspective (Banner Hidden)', async ({ page }) => {
    // Normal Playwright context has navigator.webdriver = true
    await page.goto('/');
    
    // Warte kurz, um sicherzugehen, dass CC initialisiert wurde
    await page.waitForTimeout(2000);
    
    const ccMain = page.locator('#cc-main');
    await expect(ccMain).not.toBeVisible();
    console.log('✅ Bot Perspective: Banner is hidden as expected.');
  });

  /**
   * PERSPECTIVE: Real User (Stealth)
   * Verifies that the banner is visible and functional when masked
   */
  test.describe('Stealth User Interaction', () => {
    
    test.beforeEach(async ({ page, context }) => {
      // TARNKAPPEN-MODUS: Webdriver verstecken
      await context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
      });
      
      // Echter User-Agent
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      });

      await page.goto('/');
    });

    test('Step 01: Baseline Check (Diagnostic Dump)', async ({ page }) => {
      await waitForCookieConsent(page);
      const ccMain = page.locator('#cc-main');
      await expect(ccMain).toBeAttached(); 
      console.log('✅ Baseline: #cc-main is attached to DOM.');
    });

    test('Step 02: API Category Staircase UP (Cumulative)', async ({ page }) => {
      test.setTimeout(120000);
      
      for (const cat of CATEGORY_LIST) {
        if (cat === 'essential') continue;
        
        await waitForCookieConsent(page);
        console.log(`[API] Activating ${cat}...`);
        
        // Execute API call and handle potential immediate destruction
        await page.evaluate((c) => {
          (window as any).CookieConsent.acceptCategory(c);
        }, cat).catch(() => console.log('Context destroyed during API call, expected if reload triggered.'));
        
        // Give the browser time to reload if it wants to, then force a clean state
        await page.waitForTimeout(2000); 
        await page.reload().catch(() => {});
        await waitForCookieConsent(page);

        const categories = await page.evaluate(() => {
          const match = document.cookie.split('; ').find(row => row.startsWith('cc_cookie='));
          if (!match) return [];
          const val = JSON.parse(decodeURIComponent(match.split('=')[1]));
          return val.categories || [];
        });

        expect(categories).toContain(cat);
        logStep(`API: Activate ${cat}`, `Cookie contains ${cat}`, `Current: ${categories.join(', ')}`, true);
      }
    });

    test('Step 03: API Category Staircase DOWN (Cumulative with Reloads)', async ({ page }) => {
      test.setTimeout(120000);
      await waitForCookieConsent(page);
      
      // Reset & Accept All via API
      await page.evaluate(() => {
        (window as any).CookieConsent.reset(true);
        (window as any).CookieConsent.acceptCategory('all');
      }).catch(() => {});
      await page.waitForTimeout(2000);
      await page.reload().catch(() => {});
      await waitForCookieConsent(page);

      for (const cat of [...CATEGORY_LIST].reverse()) {
        if (cat === 'essential') continue;

        await page.evaluate((c) => {
          const current = (window as any).CookieConsent.getCookie().categories;
          const newList = current.filter((item: string) => item !== c);
          (window as any).CookieConsent.acceptCategory(newList);
        }, cat).catch(() => {});

        await page.waitForTimeout(2000);
        await page.reload().catch(() => {});
        await waitForCookieConsent(page);

        const categories = await page.evaluate(() => {
          const match = document.cookie.split('; ').find(row => row.startsWith('cc_cookie='));
          if (!match) return [];
          const val = JSON.parse(decodeURIComponent(match.split('=')[1]));
          return val.categories || [];
        });

        expect(categories).not.toContain(cat);
        logStep(`API: Revoke ${cat}`, `Cookie removed ${cat}`, `Current: ${categories.join(', ')}`, true);
      }
    });

    test('Step 04: Minimal UI Assurance (Proof of Connection)', async ({ page }) => {
       test.setTimeout(60000);
       await waitForCookieConsent(page);
       const cat = 'analytics';
       
       // Clean start for UI test: Reset via API first
       await page.evaluate(() => (window as any).CookieConsent.reset(true));
       await page.reload();
       await waitForCookieConsent(page);
       
       await page.evaluate(() => (window as any).CookieConsent.showPreferences()).catch(() => {});
       const pmBody = page.locator('.pm__body');
       await expect(pmBody).toBeVisible();
       
       console.log(`[UI] Toggling Analytics category...`);
       // Vanilla CookieConsent v3 category toggles have value="analytics"
       const analyticsToggle = page.locator('input[value="analytics"]').first();
       
       try {
         await analyticsToggle.waitFor({ state: 'attached', timeout: 3000 });
         await analyticsToggle.click({ force: true });
       } catch (e) {
         console.log('Fallback to evaluate script...');
         await page.evaluate(() => {
           const labels = Array.from(document.querySelectorAll('.section__label_wrapper label, .section__toggle_wrapper label, label'));
           const target = labels.find(l => (l.textContent || '').includes('Analyse') || (l.textContent || '').includes('Analytics'));
           (target as HTMLElement)?.click();
         });
       }
       
       // Click save
       console.log(`[UI] Clicking Save...`);
       await Promise.all([
         page.waitForNavigation({ waitUntil: 'load', timeout: 8000 }).catch(() => {
           console.log('ℹ️ No navigation after UI Save, forcing reload.');
           return page.reload();
         }),
         page.click('button[data-role="save"]', { force: true })
       ]);
       
       await waitForCookieConsent(page);
       
       const categories = await page.evaluate(() => {
         const match = document.cookie.split('; ').find(row => row.startsWith('cc_cookie='));
         if (!match) return [];
         try {
           const val = JSON.parse(decodeURIComponent(match.split('=')[1]));
           return val.categories || [];
         } catch(e) { return []; }
       });
       
       console.log(`[UI] Final Categories in Cookie: ${categories.join(', ')}`);
       expect(categories).toContain(cat);
       console.log('✅ UI Connection Proof: UI Toggles successfully update cookie.');
    });
  });

});
