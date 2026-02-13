import { execSync } from 'child_process';
import * as path from 'path';

/**
 * PIPELINE STEP 05: Run E2E Tests
 * Responsibility: Execute Playwright tests against a target URL.
 */

async function runE2E() {
  const rootDir = path.resolve(__dirname, '../..');
  const targetUrl = process.env.BASE_URL;
  const isInit = process.argv.includes('--init');

  if (!targetUrl) {
    console.error('❌ BASE_URL environment variable is missing.');
    process.exit(1);
  }

  console.log(`🎭 Phase 05: E2E Verification`);
  console.log(`Testing against: ${targetUrl}`);
  console.log(isInit ? '🛡️  Mode: INITIAL (Running Robust + UI Tests)' : '🚀 Mode: CI/CD (Running Robust Tests Only)');

  try {
    // 1. Run Standard CI/CD Tests (Robust)
    // Uses default playwright.config.ts via NX
    console.log('\n--- 1. Running Robust CI/CD Suite ---');
    execSync('npx nx e2e @temp-nx/agency-shell-e2e', {
      stdio: 'inherit',
      cwd: rootDir,
      env: { ...process.env, BASE_URL: targetUrl }
    });

    // 2. If Init, Run UI/Manual Tests
    if (isInit) {
      console.log('\n--- 2. Running Initial UI Suite (Admin/Auth) ---');
      execSync('npx playwright test --config=apps/agency-shell-e2e/playwright.initial.config.ts', {
        stdio: 'inherit',
        cwd: rootDir,
        env: { ...process.env, BASE_URL: targetUrl }
      });
    }

    console.log('✅ E2E Tests completed successfully.');
    process.exit(0);
  } catch (err: unknown) {
    console.error('❌ E2E Tests failed.');
    process.exit(1);
  }
}

runE2E().catch(console.error);
