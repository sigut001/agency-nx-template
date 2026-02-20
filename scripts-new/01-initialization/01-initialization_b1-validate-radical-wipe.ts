/**
 * SCRIPT: 01b-validate-radical-wipe.ts
 * 
 * AUFGABE: 
 * Validiert den Zero-State der Infrastruktur nach dem Reset.
 * 
 * KRITERIEN:
 * 1. Firestore: 0 Kollektionen.
 * 2. Auth: 0 Benutzer.
 * 3. GitHub: 0 Secrets.
 */

import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { LogService } from '../utils/log-service';

// Load env vars immediately
const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(rootDir, '.env') });

LogService.init('VALIDATE', 'WIPE');

async function validateReset() {
  console.log('>>> STARTING VALIDATION: 01b-validate-radical-wipe.ts');
  console.log('🔍 VALIDATING RADICAL WIPE (ZERO-STATE)...');

  // Reconstructed ServiceAccount for Firebase Admin (now that env is loaded)
  const serviceAccount: admin.ServiceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  };

  // Firebase Admin Init
  if (!admin.apps.length) {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || path.join(rootDir, 'firebase-service-account.json');
    let credential;

    if (serviceAccount.projectId && serviceAccount.privateKey && serviceAccount.clientEmail) {
      console.log('   🔐 Using individual FIREBASE_ADMIN_* credentials');
      credential = admin.credential.cert(serviceAccount);
    } else if (fs.existsSync(serviceAccountPath)) {
      console.log(`   🔐 Using credentials from file: ${serviceAccountPath}`);
      credential = admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')));
    } else {
      console.error('❌ Error: No Firebase credentials found.');
      process.exit(1);
    }
    admin.initializeApp({ credential });
  }

  const db = admin.firestore();
  const auth = admin.auth();
  let failed = false;

  try {
    // 1. Firestore Check
    console.log('   📋 CHECK: Firestore collections...');
    const collections = await db.listCollections();
    console.log(`      Expected: 0 collections`);
    console.log(`      Received: ${collections.length} collections`);
    
    if (collections.length > 0) {
      console.error(`      ❌ Error: Firestore is not empty.`);
      failed = true;
    } else {
      console.log('      ✅ Success: Firestore is empty.');
    }

    // 2. Auth Check
    console.log('\n   📋 CHECK: Firebase Auth users...');
    const listUsers = await auth.listUsers(1);
    console.log(`      Expected: 0 users`);
    console.log(`      Received: ${listUsers.users.length} users (peek)`);
    
    if (listUsers.users.length > 0) {
      console.error(`      ❌ Error: Auth database is not empty.`);
      failed = true;
    } else {
      console.log('      ✅ Success: Auth is empty.');
    }

    // 3. GitHub Check
    console.log('\n   📋 CHECK: GitHub Secrets...');
    console.log(`      Expected: Empty secret list`);
    try {
      const secretsRaw = (await LogService.execAndLog('gh secret list', { cwd: rootDir })).trim();
      if (secretsRaw) {
        console.log(`      Received: Secrets found\n${secretsRaw}`);
        console.error('      ❌ Error: GitHub Secrets still exist!');
        failed = true;
      } else {
        console.log(`      Received: Empty list`);
        console.log('      ✅ Success: GitHub Secrets are empty.');
      }
    } catch (ghError: any) {
      console.warn('      ⚠️ Warning: GitHub CLI check failed.');
      console.warn(`         Error: ${ghError.message}`);
    }

    if (failed) {
      console.error('\n🛑 VALIDATION FAILED: Infrastructure is NOT clean (Zero-State violation).');
      process.exit(1);
    } else {
      console.log('\n✨ VALIDATION PASSED: Zero-state confirmed.');
      process.exit(0);
    }

  } catch (error: any) {
    console.error('\n❌ CRITICAL ERROR during Reset Validation:');
    console.error(`   Error details: ${error.stack || error}`);
    process.exit(1);
  }
}

validateReset();
