import * as path from 'path';
import { LogService } from './utils/log-service';

async function runValidation() {
  LogService.init('MASTER', 'VALIDATION');
  console.log('🚀 MASTER: STARTING PIPELINE VALIDATION WORKFLOW...\n');

  const scriptsDir = path.resolve(__dirname, '../');

  const steps = [
    { name: 'Remote Sync & Identity', script: '02-validation/02-validation_f1-data-agnostic-remote-sync-and-identity-verification.ts' },
    { name: 'Route & Schema Integrity', script: '02-validation/02-validation_g1-dynamic-route-and-firestore-schema-integrity-check.ts' },
    { name: 'Functional Service Health', script: '02-validation/02-validation_h1-functional-service-health-and-connectivity-audit.ts' }
  ];

  for (const step of steps) {
    console.log(`--- NEXT STEP: ${step.name} ---`);
    try {
      await LogService.execAndLog(`npx jiti scripts-new/${step.script}`, { cwd: scriptsDir });
      console.log(`✅ STEP PASSED: ${step.name}\n`);
    } catch (_e) {
      console.error(`❌ STEP FAILED: ${step.name}. Aborting validation flow.`);
      process.exit(1);
    }
  }

  console.log('✨ MASTER VALIDATION COMPLETED SUCCESSFULLY.');
}

runValidation();
