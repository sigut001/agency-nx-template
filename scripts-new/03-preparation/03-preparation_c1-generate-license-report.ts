/**
 * SCRIPT: 03-preparation_c1-generate-license-report.ts
 * 
 * AUFGABE: 
 * Scant alle npm-Abhängigkeiten, erstellt einen Lizenz-Report 
 * und lädt diesen direkt in das Firestore-Dokument 'static_pages/lizenzen' hoch.
 */

import * as checker from 'license-checker-rseidelsohn';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { LogService } from '../utils/log-service';

const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(rootDir, '.env') });

// Reconstructed ServiceAccount
const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

async function run() {
  LogService.init('PREP', 'LICENSES');
  console.log('⚖️  Generating License Report & Uploading to Firestore...\n');

  // 1. Init Firebase Admin
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  const db = admin.firestore();

  // 2. Scan Licenses
  checker.init({
    start: rootDir,
    production: true
  }, async (err, packages) => {
    if (err) {
      console.error('❌ License Check failed:', err);
      process.exit(1);
    }

    if (!packages) {
        console.error('❌ No packages found.');
        process.exit(1);
    }

    console.log(`   ✅ Scanned ${Object.keys(packages).length} production packages.`);

    const now = new Date();
    const timestampStr = now.toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });

    // 3. Sort packages alphabetically by name
    const sortedEntries = Object.entries(packages).sort((a, b) => a[0].localeCompare(b[0]));

    // 4. Format as Plain Text for LegalPage component
    let textReport = 'Drittanbieter-Lizenzen\n';
    textReport += `Stand: ${timestampStr} (Automatischer Build-Report)\n\n`;
    textReport += 'Diese Software nutzt folgende Open-Source-Komponenten:\n';
    textReport += '--------------------------------------------------\n\n';

    for (const [fullName, info] of sortedEntries) {
      // Extract name and version
      let name = fullName;
      let version = info.version;
      
      if (!version && fullName.includes('@')) {
        const parts = fullName.split('@');
        if (fullName.startsWith('@')) {
          version = parts[2];
          name = `@${parts[1]}`;
        } else {
          version = parts[1];
          name = parts[0];
        }
      }

      textReport += `Paket:   ${name}\n`;
      textReport += `Version: ${version || '---'}\n`;
      textReport += `Lizenz:  ${info.licenses}\n`;
      textReport += '--------------------------------------------------\n';
    }

    // 4. Save as local artifact for review
    const artifactDir = path.join(rootDir, 'temp/artifacts');
    if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });
    const localArtifactPath = path.join(artifactDir, 'license-report.txt');
    fs.writeFileSync(localArtifactPath, textReport);
    console.log(`   📂 Local artifact saved: temp/artifacts/license-report.txt`);

    // 5. Upload to Firestore
    try {
      await db.collection('static_pages').doc('system').collection('legal').doc('lizenzen').set({
        slug: 'lizenzen',
        title: 'Lizenzen',
        content: textReport,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        seo: {
          title: 'Lizenzen',
          description: 'Übersicht der verwendeten Drittanbieter-Lizenzen von Qubits Digital.'
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log('   🚀 License report successfully pushed to Firestore (static_pages/system/legal/lizenzen).');
      process.exit(0);
    } catch (dbError) {
      console.error('❌ Failed to upload to Firestore:', dbError);
      process.exit(1);
    }
  });
}

run().catch(err => {
  console.error('❌ Script crashed:', err);
  process.exit(1);
});
