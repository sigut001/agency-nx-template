import { execSync } from 'child_process';
import * as path from 'path';
import * as dotenv from 'dotenv';

/**
 * MASTER PIPELINE ORCHESTRATOR
 * Executes atomized steps from scripts/pipeline/
 */

async function runStep(name: string, command: string, cwd: string, env: NodeJS.ProcessEnv = process.env) {
  console.log(`\n--- [PHASE: ${name}] ---`);
  console.log(`Executing: ${command}`);
  try {
    const output = execSync(command, { stdio: 'pipe', cwd, env }).toString();
    console.log(output);
    return output;
  } catch (err: unknown) {
    const error = err as any;
    console.error(`❌ ${name} failed.`);
    if (error.stdout) console.error(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
    process.exit(1);
  }
}

async function runStepAsync(name: string, command: string, cwd: string, env: NodeJS.ProcessEnv = process.env) {
  console.log(`\n--- [START ASYNC PHASE: ${name}] ---`);
  return new Promise<void>((resolve, reject) => {
    const { exec } = require('child_process');
    exec(command, { cwd, env }, (error: Error | null, stdout: string, stderr: string) => {
      console.log(`\n--- [FINISH ASYNC PHASE: ${name}] ---`);
      if (stdout) console.log(stdout);
      if (error) {
        console.error(`❌ ${name} failed.`);
        if (stderr) console.error(stderr);
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const isInit = process.argv.includes('--init');
  
  dotenv.config({ path: path.join(rootDir, '.env') });

  console.log('🏁 Starting Modular Pipeline Verification (System State Check)...');
  if (isInit) console.log('🛡️  MODE: Initial Setup (Strict Validation)');

  // 00. SCHEMA VALIDATION (Check if DB is initialized)
  await runStep('00: Schema Validation', 'npx tsx scripts/utils/validate-firestore-schema.ts', rootDir);

  // 00. KEY INTEGRITY VALIDATION
  await runStep('00: Key Integrity', 'npx tsx scripts/pipeline/00-validate-keys.ts', rootDir);

  // 00. IDENTITY SETUP (Clean Recreation)
  await runStep('00: Ensure Test User', 'npx tsx scripts/pipeline/00-ensure-test-user.ts', rootDir);

  // 01. SERVICE VALIDATIONS (Parallel)
  console.log('\n🚀 Starting Service Validations in Parallel...');
  try {
    await Promise.all([
      runStepAsync('01a: Firebase Validation', 'npx tsx scripts/pipeline/01a-validate-firebase.ts', rootDir),
      runStepAsync('01b: Brevo Validation', 'npx tsx scripts/pipeline/01b-validate-brevo.ts', rootDir),
      runStepAsync('01c: ImageKit Validation', 'npx tsx scripts/pipeline/01c-validate-imagekit.ts', rootDir),
      runStepAsync('01d: reCAPTCHA Validation', 'npx tsx scripts/pipeline/01d-validate-recaptcha.ts', rootDir)
    ]);
    console.log('✅ All service validations PASSED.');
  } catch {
    console.error('❌ One or more service validations failed. Aborting pipeline.');
    process.exit(1);
  }

  // 01e. SEO Metadata Sync (Sequential because it might depend on previous state)
  await runStep('01e: SEO Metadata Sync', 'npx tsx scripts/pipeline/01e-sync-seo-metadata.ts', rootDir);

  // 02a. ROUTE VALIDATION
  await runStep('02a: Route Mapping Check', 'npx tsx scripts/utils/validate-route-mapping.ts', rootDir);

  // 02b. BUILD
  runStep('02b: Build', 'npx nx build @temp-nx/company-website --configuration=production', rootDir);

  // 03. SEO (Sitemap & Robots)
  runStep('03: Sitemap Generation', 'npx tsx scripts/pipeline/02-generate-sitemap.ts', rootDir);

  // 06. PRERENDER (Local against Vite Preview)
  // No BASE_URL passed -> triggers local mode in script
  console.log('\n--- [PHASE: 06: Prerendering (Local)] ---');
  await runStepAsync('06: Prerendering', 'npx tsx scripts/pipeline/03-prerender.ts', rootDir);

  // 06b. HTML CLEANUP (Post-Prerender Deduplication)
  runStep('06b: HTML Cleanup', 'npx tsx scripts/pipeline/03b-cleanup-html.ts', rootDir);

  // 07. DEPLOY TO LIVE PREVIEW (Single Deployment of finalized assets)
  console.log('\n--- [PHASE: 07: Live Deployment] ---');
  let liveUrl = '';
  // We do NOT use --channel here initially, let it generate a new one or use logic inside script if needed.
  // Actually, better to just run deploy and capture URL.
  try {
    const deployOutput = execSync('npx tsx scripts/pipeline/04-deploy-preview.ts', { stdio: 'pipe', cwd: rootDir }).toString();
    console.log(deployOutput);
    const urlMatch = deployOutput.match(/::SET_URL::(https:\/\/[^\s]+)/);
    if (!urlMatch) throw new Error('Could not capture Preview URL.');
    liveUrl = urlMatch[1];
    process.env.BASE_URL = liveUrl;
  } catch (err: unknown) {
    const error = err as any;
    console.error('❌ Phase 07 failed.');
    console.error(error.stdout?.toString() || error.message);
    process.exit(1);
  }

  // 08. E2E VERIFICATION (Against Content-Full Live URL)
  console.log('\n--- [PHASE: 08: E2E Verification] ---');
  try {
    runStep('08: E2E Verification', 'npx nx run @temp-nx/company-website-e2e:e2e', rootDir, { 
      ...process.env, 
      BASE_URL: liveUrl 
    });
  } catch {
    console.warn('⚠️ E2E Verification failed but continuing to Lighthouse/Report.');
  }

  // 09. LIGHTHOUSE AUDIT (Against Live URL)
  console.log('\n--- [PHASE: 09: Lighthouse Audit] ---');
  try {
    runStep('09: Lighthouse Audit', `npx tsx scripts/pipeline/06-run-lighthouse.ts ${liveUrl}`, rootDir);
  } catch {
    console.warn('⚠️ Lighthouse Audit failed but continuing to Report.');
  }

  // 10. UNIFIED REPORT GENERATION
  console.log('\n--- [PHASE: 10: Unified Reporting] ---');
  runStep('10: Report Generation', 'npx tsx scripts/automation/generate-report.ts', rootDir);

  console.log('\n🌈 --- PIPELINE VERIFIED ON LIVE INFRASTRUCTURE --- 🌈');
  console.log(`🔗 Preview: ${liveUrl}`);
  console.log(`📊 Report: ./reports/SUMMARY.md`);
}

main().catch(err => {
  console.error('Unhandled pipeline failure:', err);
  process.exit(1);
});
