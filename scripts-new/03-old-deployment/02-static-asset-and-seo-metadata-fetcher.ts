/**
 * SCRIPT: 02-static-asset-and-seo-metadata-fetcher.ts
 * 
 * AUFGABE: 
 * Holt globale SEO-Daten aus Firestore und speichert sie lokal für den Build-Prozess.
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Reconstructed ServiceAccount for Firebase Admin
const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

async function fetchSEO() {
  console.log('🏷️  FETCHING SEO METADATA...');

  const rootDir = path.resolve(__dirname, '../../');
  dotenv.config({ path: path.join(rootDir, '.env') });
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
      console.error('❌ Error: No Firebase credentials found (individual env variables or file).');
      process.exit(1);
    }
    admin.initializeApp({ credential });
  }
  const db = admin.firestore();

  try {
    const seoDoc = await db.collection('config').doc('seo').get();
    const data = seoDoc.exists ? seoDoc.data() : { title: 'Qubits Digital', description: 'Webentwicklung' };
    
    const targetPath = path.join(rootDir, 'apps/company-website/src/assets/seo-metadata.json');
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, JSON.stringify(data, null, 2));
    
    console.log('   ✅ SEO Metadata stored locally.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fetchSEO();
