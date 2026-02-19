/**
 * SCRIPT: 04-build-and-test-deploy_c1-run-e2e-tests.ts
 * 
 * TERM: "E2E Validation"
 * 
 * AUFGABE:
 * 1. Liest die Preview-URL aus temp/artifacts/preview-url.txt.
 * 2. Startet die Playwright E2E Tests gegen diese URL.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const rootDir = path.resolve(__dirname, '../../');
const artifactsDir = path.join(rootDir, 'temp/artifacts');
const urlFilePath = path.join(artifactsDir, 'preview-url.txt');

async function runE2ETests() {
  console.log('🧪 PHASE 04: RUNNING E2E TESTS (Validation)...');

  // 1. Get URL
  if (!fs.existsSync(urlFilePath)) {
    console.error('❌ E2E FAILED: preview-url.txt not found. Deployment step likely failed or skipped.');
    process.exit(1);
  }

  const previewUrl = fs.readFileSync(urlFilePath, 'utf8').trim();
  console.log(`   🌍 Target URL: ${previewUrl}`);

  // 2. Run Playwright
  // We use the 'deployment-health' spec specifically, or run all if intended.
  // The user wants "functional tests", so we run the suite.
  
  try {
    console.log('   🚀 Executing Playwright Suite...');
    
    // Pass BASE_URL via env so Playwright picks it up
    execSync(`npx nx e2e company-website-e2e --baseUrl=${previewUrl}`, { 
      cwd: rootDir, 
      stdio: 'inherit',
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
