/**
 * SCRIPT: 03-preparation_c2-validate-license-report.ts
 * 
 * AUFGABE: 
 * Prüft ob das Lizenz-Dokument in Firestore existiert und ob der 
 * Zeitstempel aktuell ist (maximal 15 Minuten alt).
 */

import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(rootDir, '.env') });

// Reconstructed ServiceAccount
const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

async function validate() {
  console.log('🔍 Validating License Data Integrity in Firestore...\n');

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  const db = admin.firestore();

  try {
    const docRef = db.collection('static_pages').doc('lizenzen');
    const doc = await docRef.get();

    if (!doc.exists) {
      console.error('❌ VALIDATION FAILED: Document "static_pages/lizenzen" not found.');
      process.exit(1);
    }

    const data = doc.data();
    const generatedAt = data?.generatedAt as admin.firestore.Timestamp | undefined;

    if (!generatedAt) {
      console.error('❌ VALIDATION FAILED: "generatedAt" field missing in Firestore.');
      process.exit(1);
    }

    const diffMs = Date.now() - generatedAt.toMillis();
    const diffMin = Math.floor(diffMs / 1000 / 60);

    console.log(`   🕒 Last Update: ${generatedAt.toDate().toLocaleString('de-DE')} (${diffMin} min ago)`);

    if (diffMin > 15) {
      console.error(`❌ VALIDATION FAILED: License report is too old (${diffMin} min). Please rerun v2:prep:licenses.`);
      process.exit(1);
    }

    if (!data?.content || !data.content.includes('Drittanbieter-Lizenzen')) {
      console.error('❌ VALIDATION FAILED: Content seems empty or malformed.');
      process.exit(1);
    }

    console.log('\n✅ License report in Firestore is VALID and FRESH.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Validation crashed:', error);
    process.exit(1);
  }
}

validate();
