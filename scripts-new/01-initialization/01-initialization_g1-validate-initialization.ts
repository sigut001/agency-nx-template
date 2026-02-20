/**
 * SCRIPT: 02b-validate-initialization.ts
 * 
 * AUFGABE: 
 * Validiert den Zustand NACH der Initialisierung (Phase 02).
 */

import * as admin from 'firebase-admin';
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
    
    // Import config directly instead of regex
    const { PUBLIC_ROUTES_CONFIG } = await import('../../apps/company-website/src/app/app.routes.config');
    
    const staticRows = PUBLIC_ROUTES_CONFIG.filter(r => r.type === 'static' && r.collection);
    const dynamicRows = PUBLIC_ROUTES_CONFIG.filter(r => r.type === 'dynamic' && r.collection);

    async function validateDoc(fullPath: string, label: string) {
      const parts = fullPath.split('/');
      
      let current: any = db;
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) current = current.collection(parts[i]);
        else current = current.doc(parts[i]);
      }
      
      const snap = await (current as admin.firestore.DocumentReference).get();
      
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
      const colRef = row.collection!;
      if (!(await validateDoc(colRef, 'Static Page'))) failed = true;
    }

    for (const row of dynamicRows) {
      const colRef = row.collection!;
      console.log(`      ℹ️  Verifying Dynamic Collection: ${colRef}`);
      
      const docIds = ['doc-1', 'doc-2', 'doc-3'];
      for (const id of docIds) {
        const fullPath = `${colRef}/${id}`;
        const parts = colRef.split('/');
        
        const snap = await db.collection(parts[0]).doc(parts[1]).collection(parts[2]).doc(id).get();
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

    console.log('\n   📋 CHECK: GitHub Secrets Registry...');
    try {
      const secretsRaw = (await LogService.execAndLog('gh secret list', { cwd: rootDir })).trim();
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
