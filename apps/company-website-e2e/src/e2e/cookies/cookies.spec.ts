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
const CATEGORIES = ['essential', 'analytics', 'marketing', 'personalization'];

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

  // 🔁 Hilfsfunktion für retries
  const waitForCookieConsent = async (page:any, retries = 3, delayMs = 5000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
await page.waitForFunction(() => !!(window as any).CookieConsent, { timeout: 15000 });        return; // CookieConsent gefunden
      } catch (err) {
        if (attempt < retries) {
          console.log(`CookieConsent nicht gefunden, versuche erneut in ${delayMs / 1000}s... (${attempt}/${retries})`);
          await page.waitForTimeout(delayMs);
        } else {
          throw new Error('CookieConsent wurde nach mehreren Versuchen nicht initialisiert.');
        }
      }
    }
  };

  test('Step 01: Baseline Check (Banner visible, Only Essential snippets)', async ({ page }) => {

    console.log(`\n--- 🍪 Baseline Check ---`);
    console.log(`[DEBUG] Current URL: ${await page.url()}`);

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`[BROWSER-ERROR] ${msg.text()}`);
      }
    });

    // 1️⃣ Warte auf CookieConsent (mit Retries)
    await waitForCookieConsent(page);

    // 2️⃣ Warte bis Banner wirklich Inhalt hat (Injection abgeschlossen)
    await page.waitForFunction(() => {
      const el = document.querySelector('#cc-main');
      return !!el && el.children.length > 0;
    }, { timeout: 15000 });

    const ccMain = page.locator('#cc-main');
    await expect(ccMain).toBeVisible();

    logStep(
      'Banner container',
      '#cc-main should exist and be visible',
      'Container is visible',
      true
    );

    // 3️⃣ HTML Klasse prüfen
    const htmlClass = await page.locator('html').getAttribute('class');
    const hasConsentClass = htmlClass?.includes('show--consent') ?? false;

    logStep(
      'HTML state',
      '<html> should contain class "show--consent"',
      `HTML classes: ${htmlClass}`,
      hasConsentClass
    );

    expect(hasConsentClass).toBe(true);

    // 4️⃣ Prüfe ob mindestens ein Button existiert
    const button = page.locator('#cc-main button').first();
    await expect(button).toBeVisible();

    logStep(
      'Banner interaction',
      'Banner should contain at least one visible button',
      'Button is visible',
      true
    );

    // 5️⃣ Snippet Check (nur essential erlaubt)
    const headContent = await page.evaluate(() => document.head.innerHTML);

    for (const service of SERVICES) {
      if (service.category !== 'essential' && service.snippet) {
        const hasSnippet = headContent.includes(service.id);

        logStep(
          `Snippet check: ${service.id}`,
          `Snippet for ${service.id} should NOT be in <head>`,
          hasSnippet ? 'FOUND in head' : 'NOT found in head',
          !hasSnippet
        );

        expect(hasSnippet).toBe(false);
      }
    }
  });

  /*
  test('Step 02: Category Staircase UP (Cumulative)', async ({ page }) => {
    ... (Test commented out for faster debugging)
  });

  test('Step 03: Category Staircase DOWN (Cumulative with Reloads)', async ({ page }) => {
    ... (Test commented out for faster debugging)
  });

  test('Step 04: Individual Staircase UP & DOWN', async ({ page }) => {
    ... (Test commented out for faster debugging)
  });
  */

});
