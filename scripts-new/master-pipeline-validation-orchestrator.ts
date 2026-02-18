/**
 * MASTER ORCHESTRATOR: master-pipeline-validation-orchestrator.ts
 * 
 * AUFGABE: 
 * Dieses Skript koordiniert die vollständige Validierung der Projekt-Integrität.
 * Es stellt sicher, dass Code und Cloud perfekt synchron sind.
 */

import { execSync } from 'child_process';
import * as path from 'path';

async function runValidation() {
  console.log('🚀 MASTER: STARTING PIPELINE VALIDATION WORKFLOW...\n');

  const scriptsDir = path.join(__dirname, 'validation');

  const steps = [
    { name: 'Remote Sync & Identity', script: '02-validation/01-data-agnostic-remote-sync-and-identity-verification.ts' },
    { name: 'Route & Schema Integrity', script: '02-validation/02-dynamic-route-and-firestore-schema-integrity-check.ts' },
    { name: 'Functional Service Health', script: '02-validation/03-functional-service-health-and-connectivity-audit.ts' }
  ];

  for (const step of steps) {
    console.log(`--- NEXT STEP: ${step.name} ---`);
    try {
      execSync(`npx tsx ${path.join(scriptsDir, step.script)}`, { stdio: 'inherit' });
      console.log(`✅ STEP PASSED: ${step.name}\n`);
    } catch (_e) {
      console.error(`❌ STEP FAILED: ${step.name}. Aborting validation flow.`);
      process.exit(1);
    }
  }

  console.log('✨ MASTER VALIDATION COMPLETED SUCCESSFULLY.');
}

runValidation();
