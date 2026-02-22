/**
 * PHASE 02: phase-02.ts
 * ZWECK: Funktionale Tests der Cloud-Dienste und Datenintegrität.
 */
import * as path from 'path';
import { LogService } from './utils/log-service';

async function runPhase() {
  LogService.init('PHASE-02', 'VALIDATION');
  const rootDir = path.resolve(__dirname, '../');
  const scripts = [
    '02-validation/02-validation_f1-data-agnostic-remote-sync-and-identity-verification.ts',
    '02-validation/02-validation_g1-dynamic-route-and-firestore-schema-integrity-check.ts',
    '02-validation/02-validation_h1-functional-service-health-and-connectivity-audit.ts'
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
