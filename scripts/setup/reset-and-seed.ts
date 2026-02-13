import { execSync } from 'child_process';
import * as path from 'path';

/**
 * SETUP: Reset and Seed
 * Destructive operation! Wipes the database and re-seeds it with default content.
 * Should be run ONCE at project initialization or when a hard reset is needed.
 */

const rootDir = path.resolve(__dirname, '../..');

console.log('⚠️  STARTING PROJECT INITIALIZATION (RESET & SEED) ⚠️');
console.log('   This will DELETE ALL DATA in Firestore and reset to defaults.');

try {
  // 1. Cleanup (Wipe DB)
  console.log('\n--- [PHASE 1: Cleanup] ---');
  execSync('npx tsx scripts/automation/cleanup-test-data.ts', { stdio: 'inherit', cwd: rootDir });

  // 2. CMS Seeding (Restore Structure & Content)
  // This script clears the DB first, then seeds pages/config.
  console.log('\n--- [PHASE 2: CMS Seeding] ---');
  execSync('npx tsx scripts/setup/seed-cms.ts', { stdio: 'inherit', cwd: rootDir });

  // 3. IAM / User Setup (Create Users Collection)
  // Must run AFTER seeding because seeding wipes the DB.
  console.log('\n--- [PHASE 3: IAM / User Setup] ---');
  execSync('npx tsx scripts/pipeline/00-ensure-test-user.ts', { stdio: 'inherit', cwd: rootDir });

  console.log('\n✅ Project Initialized Successfully!');
  console.log('   Now run "npm run test:pipeline" to verify everything.');

} catch (error) {
  console.error('\n❌ Initialization Failed:', error);
  process.exit(1);
}
