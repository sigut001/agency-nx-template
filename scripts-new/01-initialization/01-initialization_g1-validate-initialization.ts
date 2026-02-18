/**
 * SCRIPT: 02b-validate-initialization.ts
 * 
 * AUFGABE: 
 * Validiert den Zustand NACH der Initialisierung (Phase 02).
 */

import * as admin from 'firebase-admin';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { LogService } from '../utils/log-service';

LogService.init();

// Reconstructed ServiceAccount for Firebase Admin
const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

async function validateInitialization() {
  console.log('🔍 VALIDATING INITIALIZATION STATE...');

  const rootDir = path.resolve(__dirname, '../../');
  dotenv.config({ path: path.join(rootDir, '.env') });

  // Firebase Init
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
      console.error('   ❌ Error: No Firebase credentials found.');
      process.exit(1);
    }
    admin.initializeApp({ credential });
  }

  const db = admin.firestore();
  const auth = admin.auth();
  let failed = false;

  try {
    // 1. AUTH CHECK
    console.log('\n   📋 CHECK: Admin Identity...');
    const email = process.env.ADMIN_EMAIL;
    if (!email) throw new Error('ADMIN_EMAIL not set in .env');
    
    try {
      const user = await auth.getUserByEmail(email);
      console.log(`      ✅ Success: Admin found (UID: ${user.uid})`);
    } catch (_e) {
      console.error(`      ❌ Error: Admin user ${email} NOT found in Firebase Auth.`);
      failed = true;
    }

    // 2. FIRESTORE STRUCTURE & SCHEMA CHECK
    console.log('\n   📋 CHECK: Firestore Content Integrity...');
    const configPath = path.join(rootDir, 'apps/company-website/src/app/app.routes.config.ts');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    const staticRows = Array.from(configContent.matchAll(/path:\s*['"]([^'"]+)['"],\s*title:\s*['"]([^'"]+)['"],\s*type:\s*['"]static['"],\s*collection:\s*['"]([^'"]+)['"]/g));
    const dynamicRows = Array.from(configContent.matchAll(/path:\s*['"]([^'"]+)['"],\s*title:\s*['"]([^'"]+)['"],\s*type:\s*['"]dynamic['"],\s*collection:\s*['"]([^'"]+)['"]/g));

    async function validateDoc(fullPath: string, label: string) {
      const parts = fullPath.split('/');
      const docRef = db.collection(parts[0]).doc(parts[1] || 'home');
      const snap = await docRef.get();
      
      if (!snap.exists) {
        console.error(`      ❌ Error: Document ${fullPath} is MISSING.`);
        return false;
      }
      
      const data = snap.data();
      const hasSchema = data?.title && data?.content && data?.seo?.title && data?.seo?.description;
      if (!hasSchema) {
        console.error(`      ❌ Error: Document ${fullPath} has INVALID SCHEMA.`);
        return false;
      }
      
      console.log(`      ✅ Success: ${label} validated (${fullPath})`);
      return true;
    }

    for (const row of staticRows) {
      const colRef = row[3];
      if (!(await validateDoc(colRef, 'Static Page'))) failed = true;
    }

    for (const row of dynamicRows) {
      const colRef = row[3];
      const parts = colRef.split('/');
      console.log(`      ℹ️  Verifying Dynamic Collection: ${colRef}`);
      
      const docIds = ['doc-1', 'doc-2', 'doc-3'];
      for (const id of docIds) {
        const fullPath = `${colRef}/${id}`;
        const docRef = db.collection(parts[0]).doc(parts[1]).collection(parts[2]).doc(id);
        const snap = await docRef.get();
        if (!snap.exists) {
          console.error(`      ❌ Error: Dynamic Document ${fullPath} is MISSING.`);
          failed = true;
        } else {
          const data = snap.data();
          const hasSchema = data?.title && data?.content && data?.seo?.title && data?.seo?.description;
          if (!hasSchema) {
            console.error(`      ❌ Error: Dynamic Document ${fullPath} has INVALID SCHEMA.`);
            failed = true;
          } else {
            console.log(`      ✅ Success: Dynamic Document ${id} validated.`);
          }
        }
      }
    }

    // 3. GITHUB SECRETS CHECK
    console.log('\n   📋 CHECK: GitHub Secrets Registry...');
    try {
      const secretsRaw = execSync('gh secret list', { encoding: 'utf8' }).trim();
      const existingSecrets = secretsRaw.split('\n').map(l => l.split('\t')[0]);
      
      const envContent = fs.readFileSync(path.join(rootDir, '.env'), 'utf8');
      const envKeys = Object.keys(dotenv.parse(envContent));
      const missing = envKeys.filter(key => !existingSecrets.includes(key));
      
      if (missing.length > 0) {
        console.error(`      ❌ Error: Missing ${missing.length} secrets in GitHub: ${missing.join(', ')}`);
        failed = true;
      } else {
        console.log(`      ✅ Success: All ${envKeys.length} env keys synced to GitHub.`);
      }
    } catch (_ghErr) {
      console.warn('      ⚠️ Warning: GitHub CLI check failed (Skipped).');
    }

    if (failed) {
      console.error('\n🛑 VALIDATION FAILED: Initialization is incomplete or inconsistent.');
      process.exit(1);
    } else {
      console.log('\n✨ VALIDATION PASSED: Infrastructure is ready for Phase 03.');
      process.exit(0);
    }

  } catch (error: unknown) {
    console.error('\n   ❌ CRITICAL ERROR during Init Validation:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

validateInitialization();
