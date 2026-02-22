/**
 * PHASE 05: phase-05.ts
 * ZWECK: Performance-Audits und Abschlussberichte.
 */
import * as path from 'path';
import { LogService } from './utils/log-service';

async function runPhase() {
  LogService.init('PHASE-05', 'PERFORMANCE-AUDIT');
  const rootDir = path.resolve(__dirname, '../');
  const scripts = [
    '05-performance-audit-and-report/05-performance-audit-and-report_a1-run-performance-audit.ts'
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
