import { execSync } from 'child_process';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

/**
 * ISOLATED PRERENDER TEST SCRIPT
 * Usage: npx tsx scripts/test-prerender-only.ts
 * 
 * Purpose: 
 * Runs ONLY the Build and Prerender (Local) steps to debug FS/Auth issues
 * locally without running the full pipeline validation.
 */

const rootDir = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(rootDir, '.env') });

function runStep(name: string, command: string) {
  console.log(`\n\n--- [STEP: ${name}] ---`);
  try {
    execSync(command, { stdio: 'inherit', cwd: rootDir, env: process.env });
  } catch (err) {
    console.error(`❌ ${name} failed.`);
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Starting ISOLATED Prerender Test...\n');

  // 1. Build (Production)
  runStep('01: Production Build', 'npx nx build @temp-nx/company-website --configuration=production');

  // 2. Prerender (Local)
  // Ensure BASE_URL is NOT set so it triggers local mode
  delete process.env.BASE_URL;
  runStep('02: Prerendering (Local)', 'npx tsx scripts/pipeline/03-prerender.ts');

  console.log('\n✅ Isolated Prerender Test Finished Successfully!');
}

main();
