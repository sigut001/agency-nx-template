import { test, expect } from '@playwright/test';

test.describe('HubSpot Integration: Form Rendering & Validation', () => {

  const logStep = (step: string, expectMsg: string, result: string, success: boolean) => {
    console.log(`\n[STEP] ${step}`);
    console.log(`  EXPECT: ${expectMsg}`);
    console.log(`  RESULT: ${result}`);
    console.log(`  STATUS: ${success ? '✅ PASSED' : '❌ FAILED'}`);
  };

  test.beforeEach(async ({ page }) => {
    // Navigate to contact page
    console.log(`\n[SETUP] Navigating to /kontakt`);
    await page.goto('/kontakt');
    
    // Cookie banner can sometimes block interactions, wait a brief moment for it to initialize
    await page.waitForTimeout(1500);
  });

  test('Step 01: Contact Form Integration', async ({ page }) => {
    test.setTimeout(30000); // HubSpot script might take a moment to load
    
    let stepName = 'Locate Contact Form Wrapper';
    let expected = 'The wrapper .hs-form-frame should be attached to the DOM';
    try {
      const formWrapper = page.locator('.hs-form-frame');
      await expect(formWrapper).toBeVisible();
      logStep(stepName, expected, 'Found .hs-form-frame in the page DOM', true);
    } catch (e) {
      logStep(stepName, expected, 'Timeout waiting for .hs-form-frame', false);
      throw e;
    }

    stepName = 'Locate and Enter Contact Form iFrame';
    expected = 'An iframe with class .hs-form-iframe should be injected by HubSpot';
    let frame;
    try {
      const hsIframe = page.locator('.hs-form-frame iframe.hs-form-iframe');
      await expect(hsIframe).toBeVisible({ timeout: 15000 });
      frame = hsIframe.contentFrame();
      logStep(stepName, expected, 'Found the HubSpot iframe and extracted its contentFrame', true);
    } catch (e) {
      logStep(stepName, expected, 'Timeout waiting for HubSpot iframe injection', false);
      throw e;
    }

    stepName = 'Verify Form Interactivity (Submit empty)';
    expected = 'Clicking submit on an empty form should trigger HubSpot validation error messages';
    try {
      const submitButton = frame.locator('input[type="submit"]');
      await expect(submitButton).toBeVisible({ timeout: 10000 });
      await submitButton.click();
      
      const errorList = frame.locator('.hs-error-msgs');
      await expect(errorList).toBeVisible({ timeout: 5000 });
      logStep(stepName, expected, 'Found .hs-error-msgs indicating validation fired successfully', true);
    } catch (e) {
      logStep(stepName, expected, 'Failed to interact with form or find validation errors', false);
      throw e;
    }
  });

  test('Step 02: Newsletter Form Integration', async ({ page }) => {
    test.setTimeout(30000);

    let stepName = 'Locate Newsletter Form Wrapper';
    let expected = 'The wrapper #hubspot-newsletter-container should be attached to the DOM';
    try {
      const newsletterWrapper = page.locator('#hubspot-newsletter-container');
      await expect(newsletterWrapper).toBeVisible();
      logStep(stepName, expected, 'Found #hubspot-newsletter-container in the page DOM', true);
    } catch (e) {
      logStep(stepName, expected, 'Timeout waiting for #hubspot-newsletter-container', false);
      throw e;
    }

    stepName = 'Locate and Enter Newsletter Form iFrame';
    expected = 'An iframe should be injected by HubSpot v2 script';
    let frame;
    try {
      const hsIframe = page.locator('#hubspot-newsletter-container iframe.hs-form-iframe');
      await expect(hsIframe).toBeVisible({ timeout: 15000 });
      frame = hsIframe.contentFrame();
      logStep(stepName, expected, 'Found the HubSpot newsletter iframe and extracted its contentFrame', true);
    } catch (e) {
      logStep(stepName, expected, 'Timeout waiting for HubSpot newsletter iframe injection', false);
      throw e;
    }

    stepName = 'Verify Email Input Field';
    expected = 'An email input field should be present and visible inside the iframe';
    try {
      const emailInput = frame.locator('input[type="email"]');
      await expect(emailInput).toBeVisible({ timeout: 10000 });
      logStep(stepName, expected, 'Email input was successfully rendered inside the iframe', true);
    } catch (e) {
      logStep(stepName, expected, 'Failed to find email input inside the newsletter iframe', false);
      throw e;
    }
  });

});
