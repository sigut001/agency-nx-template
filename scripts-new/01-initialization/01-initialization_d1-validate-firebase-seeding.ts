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

const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(rootDir, '.env') });

// Reconstructed ServiceAccount for Firebase Admin
const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

async function validateFirebase() {
  console.log('>>> STARTING VALIDATION: 01-initialization_d1-validate-firebase-seeding.ts');
  
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
    
    // Import config directly (like in seeding) instead of regex
    const { PUBLIC_ROUTES_CONFIG } = await import('../../apps/company-website/src/app/app.routes.config');
    
    const staticRows = PUBLIC_ROUTES_CONFIG.filter(r => r.type === 'static' && r.collection);
    const dynamicRows = PUBLIC_ROUTES_CONFIG.filter(r => r.type === 'dynamic' && r.collection);

    for (const row of staticRows) {
      const colRef = row.collection!;
      const parts = colRef.split('/');
      
      let current: any = db;
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) current = current.collection(parts[i]);
        else current = current.doc(parts[i]);
      }
      
      const snap = await (current as admin.firestore.DocumentReference).get();

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
      const colRef = row.collection!;
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
