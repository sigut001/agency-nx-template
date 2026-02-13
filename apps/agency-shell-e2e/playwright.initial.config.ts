import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4300';

import * as path from 'path';

require('dotenv').config({ path: path.join(workspaceRoot, '.env') });

/**
 * INITIAL TEST CONFIGURATION
 * This config is used for UI-heavy tests (Admin, Auth) that are susceptible to design changes.
 * These tests should be run manually or during initial project setup, not in every CI run.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on',
  },
  // Enable retries to mitigate transient Webkit rendering issues
  retries: process.env['CI'] ? 2 : 1,
  // Run EVERYTHING in the initial suite across all browsers
  testMatch: ['**/*.spec.{ts,tsx}'], 
  reporter: [['list'], ['json', { outputFile: 'test-output/report-initial.json' }]],
  webServer: {
    command: 'npx nx run @temp-nx/agency-shell:preview --port 4300',
    url: 'http://localhost:4300',
    reuseExistingServer: true,
    cwd: workspaceRoot,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
