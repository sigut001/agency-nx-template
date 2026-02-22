/**
 * SCRIPT: 04-build-and-test-deploy_c1-run-e2e-tests.ts
 * 
 * TERM: "E2E Validation"
 * 
 * AUFGABE:
 * 1. Liest die Preview-URL aus temp/artifacts/preview-url.txt.
 * 2. Startet die Playwright E2E Tests gegen diese URL.
 */

import * as fs from 'fs';
import * as path from 'path';
import { LogService } from '../utils/log-service';

const rootDir = path.resolve(__dirname, '../../');
const artifactsDir = path.join(rootDir, 'temp/artifacts');
const urlFilePath = path.join(artifactsDir, 'preview-url.txt');

async function runE2ETests() {
  LogService.init('E2E', 'VALIDATION');
  console.log('🧪 PHASE 04: RUNNING E2E TESTS (Validation)...');

  // 1. Get URL
  if (!fs.existsSync(urlFilePath)) {
    console.error('❌ E2E FAILED: preview-url.txt not found. Deployment step likely failed or skipped.');
    process.exit(1);
  }

  const previewUrl = fs.readFileSync(urlFilePath, 'utf8').trim();
  console.log(`   🌍 Target URL: ${previewUrl}`);

  // 1.b Validate Expiration
  const expireFilePath = path.join(artifactsDir, 'preview-expire.txt');
  if (fs.existsSync(expireFilePath)) {
    const expireTimeStr = fs.readFileSync(expireFilePath, 'utf8').trim();
    const expireDate = new Date(expireTimeStr);
    
    if (expireDate.getTime() < Date.now()) {
      console.error(`❌ E2E FAILED: The preview URL expired at ${expireDate.toLocaleString()}.`);
      console.error(`   Please run the Bootstrap (Phase 04) workflow again to generate a fresh preview channel.`);
      process.exit(1);
    } else {
      console.log(`   ⏳ URL remains valid until: ${expireDate.toLocaleString()}`);
    }
  }

  // 2. Run Playwright
  try {
    console.log('   🚀 Executing Playwright Suite...');
    
    // Pass BASE_URL via env so Playwright picks it up
    await LogService.execAndLog(`npx nx e2e company-website-e2e`, { 
      cwd: rootDir,
      env: { ...process.env, BASE_URL: previewUrl }
    });

    console.log('   ✅ E2E Tests Passed.');
    process.exit(0);

  } catch (error) {
    console.error('   ❌ E2E TESTS FAILED.');
    process.exit(1);
  }
}

runE2ETests();
