/**
 * WORKFLOW 1: wf-1-template-bootstrap.ts
 * ZWECK: Initiales Aufsetzen der Infrastruktur über Phasen-Orchestratoren.
 */
import * as path from 'path';
import { LogService } from './utils/log-service';

async function runBootstrap() {
  LogService.init('WF-1', 'BOOTSTRAP');
  console.log('🏁 STARTING WORKFLOW 1: TEMPLATE BOOTSTRAP...\n');

  const rootDir = path.resolve(__dirname, '../');
  const phaseScripts = [
    'phase-00.ts',
    'phase-01.ts',
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

    console.log('\n✅ WORKFLOW 1 COMPLETED SUCCESSFULLY.');
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}
runBootstrap().catch(console.error);
