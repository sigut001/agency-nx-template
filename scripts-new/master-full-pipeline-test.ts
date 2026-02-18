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

import { execSync } from 'child_process';
import * as path from 'path';

async function runFullPipeline() {
  console.log('🏁 MASTER: STARTING FULL BUILD PIPELINE TEST...\n');

  const rootDir = path.resolve(__dirname, '../');
  const phases = [
    {
      name: 'PHASE 1: INITIALIZATION',
      scripts: [
        '01-initialization/01-radical-infrastructure-wipe-firebase-and-github.ts',
        '01-initialization/02-configuration-driven-firestore-seeding-and-admin-setup.ts',
        '01-initialization/03-environment-to-github-secret-synchronization.ts'
      ]
    },
    {
      name: 'PHASE 2: PROJECT VALIDATION (SYNC)',
      scripts: [
        '02-validation/01-data-agnostic-remote-sync-and-identity-verification.ts',
        '02-validation/02-dynamic-route-and-firestore-schema-integrity-check.ts',
        '02-validation/03-functional-service-health-and-connectivity-audit.ts'
      ]
    },
    {
      name: 'PHASE 3: TEST-DEPLOY-PROCESS',
      scripts: [
        '03-deployment/01-automated-sitemap-and-robots-generation.ts',
        '03-deployment/02-static-asset-and-seo-metadata-fetcher.ts',
        '// build-step: nx-build', // Special marker for the NX build step
        '03-deployment/03-prerender-and-html-fragment-optimization.ts'
      ]
    },
    {
      name: 'PHASE 4: RESULT AUDIT',
      scripts: [
        '04-audit/01-post-deploy-asset-verification.ts',
        '04-audit/02-performance-and-e2e-audit.ts'
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
             execSync('npx nx build company-website', { stdio: 'inherit', cwd: rootDir });
          }
          continue;
        }

        console.log(`▶️  Running: ${script}`);
        execSync(`npx tsx ${path.join(__dirname, script)}`, { stdio: 'inherit' });
      }
    }

    console.log('\n✅ ALL PIPELINE PHASES COMPLETED SUCCESSFULLY.');
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ PIPELINE FAILED at some stage.');
    console.error(`Error details: ${error.message || error}`);
    process.exit(1);
  }
}

runFullPipeline().catch(console.error);
