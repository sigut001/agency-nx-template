import * as path from 'path';
import { LogService } from './utils/log-service';

async function runResetAndInit() {
  LogService.init('MASTER', 'RESET-INIT');
  console.log('🚀 MASTER: STARTING RESET & INITIALIZATION WORKFLOW...\n');

  const scriptsDir = path.resolve(__dirname, '../');

  const steps = [
    { name: 'Radical Infrastructure Wipe', script: '01-initialization/01-initialization_a1-radical-infrastructure-wipe-firebase-and-github.ts' },
    { name: 'Config-Driven Seeding', script: '01-initialization/01-initialization_c1-configuration-driven-firestore-seeding-and-admin-setup.ts' },
    { name: 'GitHub Secret Synchronization', script: '01-initialization/01-initialization_e1-environment-to-github-secret-synchronization.ts' }
  ];

  for (const step of steps) {
    console.log(`--- NEXT STEP: ${step.name} ---`);
    try {
      await LogService.execAndLog(`npx jiti scripts-new/${step.script}`, { cwd: scriptsDir });
      console.log(`✅ STEP PASSED: ${step.name}\n`);
    } catch (_e) {
      console.error(`❌ STEP FAILED: ${step.name}. Aborting master workflow.`);
      process.exit(1);
    }
  }

  console.log('✨ MASTER WORKFLOW COMPLETED SUCCESSFULLY.');
}

runResetAndInit();
