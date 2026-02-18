/**
 * MASTER ORCHESTRATOR: master-reset-and-init-orchestrator.ts
 * 
 * AUFGABE: 
 * Dieses Skript koordiniert den vollständigen Reset und die Neu-Initialisierung des Projekts.
 * Es ruft die Initialisierungs-Skripte in der korrekten, logischen Reihenfolge auf.
 */

import { execSync } from 'child_process';
import * as path from 'path';

async function runResetAndInit() {
  console.log('🚀 MASTER: STARTING RESET & INITIALIZATION WORKFLOW...\n');

  // The scriptsDir is now relative to the project root, not 'initialization' subfolder
  // as the script paths now include the '01-initialization' prefix.
  // We'll adjust the path.join call to reflect this.
  const scriptsDir = __dirname; 

  const steps = [
    { name: 'Radical Infrastructure Wipe', script: '01-initialization/01-radical-infrastructure-wipe-firebase-and-github.ts' },
    { name: 'Config-Driven Seeding', script: '01-initialization/02-configuration-driven-firestore-seeding-and-admin-setup.ts' },
    { name: 'GitHub Secret Synchronization', script: '01-initialization/03-environment-to-github-secret-synchronization.ts' }
  ];

  for (const step of steps) {
    console.log(`--- NEXT STEP: ${step.name} ---`);
    try {
      execSync(`npx tsx ${path.join(scriptsDir, step.script)}`, { stdio: 'inherit' });
      console.log(`✅ STEP PASSED: ${step.name}\n`);
    } catch (_e) {
      console.error(`❌ STEP FAILED: ${step.name}. Aborting master workflow.`);
      process.exit(1);
    }
  }

  console.log('✨ MASTER WORKFLOW COMPLETED SUCCESSFULLY.');
}

runResetAndInit();
