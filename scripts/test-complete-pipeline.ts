import { execSync, spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

/**
 * MASTER PIPELINE ORCHESTRATOR
 * Executes atomized steps from scripts/pipeline/
 */

function runStep(name: string, command: string, cwd: string, env: any = process.env) {
  console.log(`\n--- [PHASE: ${name}] ---`);
  console.log(`Executing: ${command}`);
  try {
    const output = execSync(command, { stdio: 'pipe', cwd, env }).toString();
    console.log(output);
    return output;
  } catch (err: any) {
    console.error(`❌ ${name} failed.`);
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    process.exit(1);
  }
}

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const isInit = process.argv.includes('--init');
  
  dotenv.config({ path: path.join(rootDir, '.env') });

  console.log('🏁 Starting Modular Pipeline Verification...');
  if (isInit) console.log('🛡️  MODE: Initial Setup (Strict Validation)');

  // 00. RESET / CLEANUP
  runStep('00: Reset & Cleanup', 'npx tsx scripts/automation/cleanup-test-data.ts', rootDir);

  // 01. ENSURE TEST USER
  runStep('01: IAM & Credentials', 'npx tsx scripts/pipeline/00-ensure-test-user.ts', rootDir);

  // 01. SERVICE VALIDATION
  const validationCmd = isInit 
    ? 'npx tsx scripts/pipeline/01-validate-services.ts --strict' 
    : 'npx tsx scripts/pipeline/01-validate-services.ts';
  runStep('01: Service Validation', validationCmd, rootDir);

  // 02a. ROUTE VALIDATION
  runStep('02a: Route Mapping Check', 'npx tsx scripts/utils/validate-route-mapping.ts', rootDir);

  // 02b. BUILD
  runStep('02b: Build', 'npx nx build @temp-nx/agency-shell', rootDir);

  // 03. SEO
  runStep('03: SEO Generation', 'npx tsx scripts/pipeline/02-generate-seo.ts', rootDir);

  // 04. PRERENDER
  console.log('\n--- [PHASE: 04: Prerendering] ---');
  const previewProcess = spawn('npx', ['nx', 'run', '@temp-nx/agency-shell:preview', '--port', '4300'], {
    cwd: rootDir,
    shell: true,
    stdio: 'ignore'
  });
  await new Promise(resolve => setTimeout(resolve, 5000));
  try {
    execSync('npx tsx scripts/pipeline/03-prerender.ts', { stdio: 'inherit', cwd: rootDir });
    console.log('✅ Prerendering completed.');
  } finally {
    previewProcess.kill();
  }

  // 05. DEPLOY PREVIEW
  console.log('\n--- [PHASE: 05: Deploy Preview] ---');
  const deployOutput = execSync('npx tsx scripts/pipeline/04-deploy-preview.ts', { stdio: 'pipe', cwd: rootDir }).toString();
  console.log(deployOutput);
  
  const urlMatch = deployOutput.match(/::SET_URL::(https:\/\/[^\s]+)/);
  if (!urlMatch) {
    console.error('❌ Could not capture Preview URL from deployment output.');
    process.exit(1);
  }
  const liveUrl = urlMatch[1];

  // 06. E2E TESTS
  process.env.BASE_URL = liveUrl;
  const e2eCmd = isInit 
    ? 'npx tsx scripts/pipeline/05-run-e2e.ts --init' 
    : 'npx tsx scripts/pipeline/05-run-e2e.ts';
  runStep('06: E2E Verification', e2eCmd, rootDir);

  console.log('\n🌈 --- MODULAR PIPELINE VERIFIED SUCCESSFULLY --- 🌈');
  console.log(`🔗 Preview is live (1h): ${liveUrl}`);

  if (isInit) {
    console.log('\n🔔 REMINDER: Security Clean-up');
    console.log('   - Re-enable IP Whitelist in Brevo.');
    console.log('   - Verify Analytics in Firebase Console (DebugView).');
  }
}

main().catch(err => {
  console.error('Unhandled pipeline failure:', err);
  process.exit(1);
});
