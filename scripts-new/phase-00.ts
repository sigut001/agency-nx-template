/**
 * PHASE 00: phase-00.ts
 * ZWECK: Umgebungskonfiguration und Root-Guard Validierung.
 */
import * as path from 'path';
import { LogService } from './utils/log-service';

async function runPhase() {
  LogService.init('PHASE-00', 'ENV-VALIDATION');
  const rootDir = path.resolve(__dirname, '../');
  const scripts = [
    '00-validation/00-validation_a1-validate-environment.ts'
  ];

  try {
    for (const script of scripts) {
      await LogService.execAndLog(`npx tsx scripts-new/${script}`, { cwd: rootDir });
    }
  } catch {
    process.exit(1);
  }
}
runPhase();
