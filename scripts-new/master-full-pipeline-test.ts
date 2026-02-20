/**
 * MASTER ORCHESTRATOR: master-full-pipeline-test.ts
 * 
 * AUFGABE: 
 * Dies ist das Herzstück der CI/CD Automatisierung. Es koordiniert den gesamten 
 * Prozess von der Validierung bis zur fertigen, statisch generierten Webseite.
 * 
 * DER FLOW:
 * 1. [VAL] Validierung: Ist die Cloud gesund und synchron? (Scripts aus /validation)
 * 2. [PRE] Vorbereitung: Holen von Metadaten & Sitemap-Erstellung (Scripts aus /assets)
 * 3. [BUILD] Kompilierung: Der eigentliche "nx build" der React-App.
 * 4. [POST] Optimierung: Prerendering und HTML-Deduplizierung (Scripts aus /assets)
 */

import * as path from 'path';
import { LogService } from './utils/log-service';

async function runFullPipeline() {
  LogService.init('MASTER', 'PIPELINE');
  console.log('🏁 MASTER: STARTING FULL BUILD PIPELINE TEST...\n');

  const rootDir = path.resolve(__dirname, '../');
  const phases = [
    {
      name: 'PHASE 1: INITIALIZATION',
      scripts: [
        '01-initialization/01-initialization_a1-radical-infrastructure-wipe-firebase-and-github.ts',
        '01-initialization/01-initialization_c1-configuration-driven-firestore-seeding-and-admin-setup.ts',
        '01-initialization/01-initialization_e1-environment-to-github-secret-synchronization.ts'
      ]
    },
    {
      name: 'PHASE 2: PROJECT VALIDATION',
      scripts: [
        '02-validation/02-validation_f1-data-agnostic-remote-sync-and-identity-verification.ts',
        '02-validation/02-validation_g1-dynamic-route-and-firestore-schema-integrity-check.ts',
        '02-validation/02-validation_h1-functional-service-health-and-connectivity-audit.ts'
      ]
    },
    {
      name: 'PHASE 3: PREPARATION',
      scripts: [
        '03-preparation/03-preparation_a1-generate-sitemap.ts',
        '03-preparation/03-preparation_c1-generate-license-report.ts'
      ]
    },
    {
      name: 'PHASE 4: BUILD & TEST-DEPLOY',
      scripts: [
        '02-validation/02-validation_i1-validate-page-architecture.ts',
        '04-build-and-test-deploy/04-build-and-test-deploy_a0-validate-cookie-catalog.ts',
        '// build-step: nx-build',
        '04-build-and-test-deploy/04-build-and-test-deploy_a1-inject-artifacts-to-dist.ts',
        '04-build-and-test-deploy/04-build-and-test-deploy_b1-firebase-preview-deploy.ts',
        '04-build-and-test-deploy/04-build-and-test-deploy_c1-run-e2e-tests.ts'
      ]
    },
    {
      name: 'PHASE 5: PERFORMANCE AUDIT',
      scripts: [
        '05-performance-audit-and-report/05-performance-audit-and-report_a1-run-performance-audit.ts'
      ]
    }
  ];

  try {
    for (const phase of phases) {
      console.log(`\n============== ${phase.name} ==============`);
      
      for (const script of phase.scripts) {
        if (script.startsWith('//')) {
          if (script.includes('nx-build')) {
             console.log('🏗️  EXECUTING PRODUCTION BUILD (NX)...');
             await LogService.execAndLog('npx nx build company-website', { cwd: rootDir });
          }
          continue;
        }

        console.log(`▶️  Running: ${script}`);
        // Use jiti for consistent loading across the pipeline
        await LogService.execAndLog(`npx jiti scripts-new/${script}`, { cwd: rootDir });
      }
    }

    console.log('\n✅ ALL PIPELINE PHASES COMPLETED SUCCESSFULLY.');
    process.exit(0);

  } catch (error: unknown) {
    console.error('\n❌ PIPELINE FAILED at some stage.');
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error details: ${errorMessage}`);
    process.exit(1);
  }
}

runFullPipeline().catch(console.error);
