/**
 * PHASE 04: phase-04.ts
 * ZWECK: Code-Validierung, Build, Injektion, Preview-Deploy und E2E-Tests.
 */
import * as path from 'path';
import { LogService } from './utils/log-service';

async function runPhase() {
  LogService.init('PHASE-04', 'BUILD-DEPLOY-TEST');
  const rootDir = path.resolve(__dirname, '../');
  const scripts = [
    '02-validation/02-validation_i1-validate-page-architecture.ts',
    '04-build-and-test-deploy/04-build-and-test-deploy_a0-validate-cookie-catalog.ts',
    '04-build-and-test-deploy/04-build-and-test-deploy_a1-inject-artifacts-to-dist.ts',
    '04-build-and-test-deploy/04-build-and-test-deploy_b1-firebase-preview-deploy.ts',
    '04-build-and-test-deploy/04-build-and-test-deploy_c1-run-e2e-tests.ts'
  ];

  try {
    // 1. Vorab-Checks
    await LogService.execAndLog(`npx tsx scripts-new/${scripts[0]}`, { cwd: rootDir });
    await LogService.execAndLog(`npx tsx scripts-new/${scripts[1]}`, { cwd: rootDir });

    // 2. Build (Zentraler NX Build)
    console.log('🏗️  EXECUTING PRODUCTION BUILD (NX)...');
    await LogService.execAndLog('npx nx build company-website', { cwd: rootDir });

    // 3. Post-Build Actions
    await LogService.execAndLog(`npx tsx scripts-new/${scripts[2]}`, { cwd: rootDir });
    await LogService.execAndLog(`npx tsx scripts-new/${scripts[3]}`, { cwd: rootDir });
    await LogService.execAndLog(`npx tsx scripts-new/${scripts[4]}`, { cwd: rootDir });

  } catch {
    process.exit(1);
  }
}
runPhase();
