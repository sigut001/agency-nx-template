/**
 * SCRIPT: 01-data-agnostic-remote-sync-and-identity-verification.ts
 * 
 * AUFGABE: 
 * Prüft, ob die lokale .env Konfiguration korrekt in den Remote-Systemen (GitHub & Firebase) gespiegelt ist.
 */

import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { LogService } from '../utils/log-service';

LogService.init('VALIDATE', 'REMOTE');

// Reconstructed ServiceAccount for Firebase Admin
const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

async function validateRemoteSyncAndIdentity() {
  console.log('🛡️  STARTING REMOTE SYNC & IDENTITY VERIFICATION...');

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

    // 1. GitHub Secrets Check
    console.log('   📡 Checking GitHub Secrets...');
    const secretsRaw = await LogService.execAndLog('gh secret list', { cwd: rootDir });
    const secrets = secretsRaw.split('\n').filter(Boolean);
    const requiredSecrets = [
      'FIREBASE_ADMIN_TYPE', 'FIREBASE_ADMIN_PROJECT_ID', 'FIREBASE_ADMIN_PRIVATE_KEY_ID',
      'FIREBASE_ADMIN_PRIVATE_KEY', 'FIREBASE_ADMIN_CLIENT_EMAIL', 'FIREBASE_ADMIN_CLIENT_ID',
      'FIREBASE_ADMIN_AUTH_URI', 'FIREBASE_ADMIN_TOKEN_URI', 'FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL',
      'FIREBASE_ADMIN_CLIENT_X509_CERT_URL', 'FIREBASE_ADMIN_UNIVERSE_DOMAIN',
      'VITE_FIREBASE_API_KEY'
    ];
    
    for (const secret of requiredSecrets) {
      if (secrets.some(s => s.startsWith(secret))) {
        console.log(`      ✅ Secret ${secret} verified on GitHub.`);
      } else {
        console.warn(`      ⚠️  Secret ${secret} MISSING on GitHub.`);
        failed = true;
      }
    }

    // 2. Auth Identity Check
    console.log('\n   👤 Checking Identity Consistency...');
    if (!process.env.ADMIN_EMAIL) {
      console.error('      ❌ ADMIN_EMAIL environment variable is not set.');
      failed = true;
    } else {
      const user = await auth.getUserByEmail(process.env.ADMIN_EMAIL!);
      if (user.email === process.env.ADMIN_EMAIL) {
        console.log('      ✅ Admin User verified.');
      } else {
         console.error('      ❌ Admin User mismatch.');
         failed = true;
      }

      // 3. Firestore Role Check
      const roleDoc = await db.collection('users').doc(user.uid).get();
      const roleData = roleDoc.data();
      if (roleData?.role === 'owner') {
        console.log('      ✅ Firestore Role is "owner".');
      } else {
         console.error('      ❌ Firestore Role is INVALID or missing.');
         failed = true;
      }
    }

    if (failed) {
      console.error('\n❌ SYNC VERIFICATION FAILED due to inconsistencies.');
      process.exit(1);
    } else {
      console.log('\n✨ REMOTE SYNC VERIFIED.');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ SYNC VERIFICATION FAILED:', error);
    process.exit(1);
  }
}

validateRemoteSyncAndIdentity();
