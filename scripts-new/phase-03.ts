/**
 * PHASE 03: phase-03.ts
 * ZWECK: Generierung von Build-Artefakten (Sitemap, Lizenzen).
 */
import * as path from 'path';
import { LogService } from './utils/log-service';

async function runPhase() {
  LogService.init('PHASE-03', 'PREPARATION');
  const rootDir = path.resolve(__dirname, '../');
  const scripts = [
    '03-preparation/03-preparation_a1-generate-sitemap.ts',
    '03-preparation/03-preparation_c1-generate-license-report.ts'
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
