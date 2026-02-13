import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

function log(msg: string, file: string) {
  console.log(msg);
  fs.appendFileSync(file, msg + '\n');
}

async function runE2E() {
  const rootDir = path.resolve(__dirname, '../..');
  const logFile = path.resolve(rootDir, 'debug/e2e.log');
  const debugDir = path.dirname(logFile);
  if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
  if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

  const targetUrl = process.env.BASE_URL;
  const isInit = process.argv.includes('--init');

  if (!targetUrl) {
    const msg = '❌ BASE_URL environment variable is missing.';
    console.error(msg);
    fs.appendFileSync(logFile, msg + '\n');
    process.exit(1);
  }

  log(`🎭 Phase 05: E2E Verification`, logFile);
  log(`Testing against: ${targetUrl}`, logFile);
  log(isInit ? '🛡️  Mode: INITIAL (Running Robust + UI Tests)' : '🚀 Mode: CI/CD (Running Robust Tests Only)', logFile);

  try {
    // 1. Run Standard CI/CD Tests (Robust)
    // Uses default playwright.config.ts via NX
    log('\n--- 1. Running Robust CI/CD Suite ---', logFile);
    execSync('npx nx e2e @temp-nx/company-website-e2e', {
      stdio: 'inherit',
      cwd: rootDir,
      env: { ...process.env, BASE_URL: targetUrl }
    });

    // 2. If Init, Run UI/Manual Tests
    if (isInit) {
      log('\n--- 2. Running Initial UI Suite (Admin/Auth) ---', logFile);
      execSync('npx playwright test --config=apps/company-website-e2e/playwright.initial.config.ts', {
        stdio: 'inherit',
        cwd: rootDir,
        env: { ...process.env, BASE_URL: targetUrl }
      });
    }

    log('✅ E2E Tests completed successfully.', logFile);
    process.exit(0);
  } catch (err: unknown) {
    const msg = '❌ E2E Tests failed.';
    console.error(msg);
    fs.appendFileSync(logFile, msg + '\n');
    process.exit(1);
  }
}

runE2E().catch(console.error);
