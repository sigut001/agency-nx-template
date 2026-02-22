/**
 * WORKFLOW 2: wf-2-project-validation.ts
 * ZWECK: Validierung und E2E-Tests über Phasen-Orchestratoren.
 */
import * as path from 'path';
import { LogService } from './utils/log-service';

async function runValidation() {
  LogService.init('WF-2', 'VALIDATION');
  console.log('🏁 STARTING WORKFLOW 2: PROJECT VALIDATION...\n');

  const rootDir = path.resolve(__dirname, '../');
  const phaseScripts = [
    'phase-02.ts',
    'phase-03.ts',
    'phase-04.ts',
    'phase-05.ts'
  ];

  try {
    for (const script of phaseScripts) {
      console.log(`\n>>> EXECUTING ${script} <<<`);
      await LogService.execAndLog(`npx tsx scripts-new/${script}`, { cwd: rootDir });
    }

    console.log('\n✅ WORKFLOW 2 COMPLETED SUCCESSFULLY.');
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}
runValidation().catch(console.error);
