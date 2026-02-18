/**
 * SCRIPT: 02b-validate-firebase-seeding.ts
 * 
 * AUFGABE: 
 * Validiert die Firebase-Initialisierung.
 * 1. Auth: Existiert der Admin-User?
 * 2. Firestore: Struktur & Schema (Static + Dynamic).
 */

import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { LogService } from '../utils/log-service';

LogService.init('VALIDATE', 'SEEDING');

// Reconstructed ServiceAccount for Firebase Admin
const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

async function validateFirebase() {
  console.log('>>> STARTING VALIDATION: 02b-validate-firebase-seeding.ts');
  
  const rootDir = path.resolve(__dirname, '../../');
  dotenv.config({ path: path.join(rootDir, '.env') });

  try {
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
        throw new Error('No Firebase credentials found (individual env variables or file).');
      }
      admin.initializeApp({ credential });
    }

    const db = admin.firestore();
    const auth = admin.auth();
    let failed = false;

    // 1. AUTH CHECK
    console.log('\n   📋 CHECK: Admin Identity...');
    const email = process.env.ADMIN_EMAIL;
    if (!email) throw new Error('ADMIN_EMAIL not set in .env');
    
    try {
      const user = await auth.getUserByEmail(email);
      console.log(`      ✅ Success: Admin found (UID: ${user.uid})`);
    } catch {
      console.error(`      ❌ Error: Admin user ${email} NOT found.`);
      failed = true;
    }

    // 2. FIRESTORE CHECK
    console.log('\n   📋 CHECK: Firestore Content Integrity...');
    const configPath = path.join(rootDir, 'apps/company-website/src/app/app.routes.config.ts');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    const staticRows = Array.from(configContent.matchAll(/path:\s*['"]([^'"]+)['"],\s*title:\s*['"]([^'"]+)['"],\s*type:\s*['"]static['"],\s*collection:\s*['"]([^'"]+)['"]/g));
    const dynamicRows = Array.from(configContent.matchAll(/path:\s*['"]([^'"]+)['"],\s*title:\s*['"]([^'"]+)['"],\s*type:\s*['"]dynamic['"],\s*collection:\s*['"]([^'"]+)['"]/g));

    for (const row of staticRows) {
      const colRef = row[3];
      const parts = colRef.split('/');
      const snap = await db.collection(parts[0]).doc(parts[1] || 'home').get();
      if (!snap.exists) {
        console.error(`      ❌ Error: Static Document ${colRef} is MISSING.`);
        failed = true;
      } else {
        const data = snap.data();
        if (!(data?.title && data?.content && data?.seo)) {
          console.error(`      ❌ Error: Static Document ${colRef} has INVALID SCHEMA.`);
          failed = true;
        } else {
          console.log(`      ✅ Success: Static Page ${colRef} validated.`);
        }
      }
    }

    for (const row of dynamicRows) {
      const colRef = row[3];
      const parts = colRef.split('/');
      const docIds = ['doc-1', 'doc-2', 'doc-3'];
      for (const id of docIds) {
        const snap = await db.collection(parts[0]).doc(parts[1]).collection(parts[2]).doc(id).get();
        if (!snap.exists) {
          console.error(`      ❌ Error: Dynamic Document ${colRef}/${id} is MISSING.`);
          failed = true;
        } else {
          const data = snap.data();
          if (!(data?.title && data?.content && data?.seo)) {
            console.error(`      ❌ Error: Dynamic Document ${colRef}/${id} has INVALID SCHEMA.`);
            failed = true;
          } else {
            console.log(`      ✅ Success: Dynamic Document ${id} in ${colRef} validated.`);
          }
        }
      }
    }

    if (failed) {
      console.error('\n🛑 VALIDATION FAILED: Seeding inconsistencies found.');
      process.exit(1);
    } else {
      console.log('\n✨ VALIDATION PASSED: Firebase seeding verified.');
      process.exit(0);
    }

  } catch (error: unknown) {
    console.error('\n❌ Fatal Error during Firebase Validation:', error);
    process.exit(1);
  }
}

validateFirebase();
