import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// For CI, BASE_URL is set by the pipeline script (04...c1-run-e2e-tests.ts).
// Falls back to a known preview URL for manual runs.
const baseURL = process.env['BASE_URL'] || 'https://test-angular-automation--preview-96h2loeq.web.app';

import * as path from 'path';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
require('dotenv').config({ path: path.join(workspaceRoot, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on',
  },
  reporter: [['list'], ['json', { outputFile: 'test-output/report.json' }]],
  /* Run your local dev server before starting the tests only if no BASE_URL is provided */
  webServer: undefined, // Test against live URL
    // 4. Sequential Execution to prevent database interference
    workers: 1,
    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
      /*
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] },
      },
      */
    ],
    // Only run the refactored, consolidated quality tests and infrastructure behavioral tests.
    testMatch: ['page-quality.spec.ts', 'infrastructure.spec.ts', 'cookies.spec.ts'],
});
