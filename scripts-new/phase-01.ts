/**
 * PHASE 01: phase-01.ts
 * ZWECK: Infrastruktur-Reset, Datenbank-Seeding und Secret-Synchronisierung.
 */
import * as path from 'path';
import { LogService } from './utils/log-service';

async function runPhase() {
  LogService.init('PHASE-01', 'INITIALIZATION');
  const rootDir = path.resolve(__dirname, '../');
  const scripts = [
    '01-initialization/01-initialization_a1-radical-infrastructure-wipe-firebase-and-github.ts',
    '01-initialization/01-initialization_c1-configuration-driven-firestore-seeding-and-admin-setup.ts',
    '01-initialization/01-initialization_e1-environment-to-github-secret-synchronization.ts'
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
