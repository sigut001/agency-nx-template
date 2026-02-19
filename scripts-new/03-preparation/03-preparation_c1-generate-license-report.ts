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

const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(rootDir, '.env') });

// Reconstructed ServiceAccount
const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

async function run() {
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

    // 4. Format as HTML for LegalPage component
    let html = '<h1>Drittanbieter-Lizenzen</h1>';
    html += `<p style="color: #666; font-size: 0.9em;">Stand: ${timestampStr} (Automatischer Build-Report)</p>`;
    html += '<p>Diese Software nutzt folgende Open-Source-Komponenten:</p><table style="width:100%; border-collapse: collapse; margin-top: 20px;">';
    html += '<thead><tr style="border-bottom: 2px solid #ddd; text-align: left;"><th>Paket</th><th>Version</th><th>Lizenz</th></tr></thead><tbody>';

    for (const [fullName, info] of sortedEntries) {
      // Extract name and version if info.version is missing (license-checker often puts it in the key)
      let name = fullName;
      let version = info.version;
      
      if (!version && fullName.includes('@')) {
        const parts = fullName.split('@');
        // Handle scoped packages like @firebase/app@0.1.0
        if (fullName.startsWith('@')) {
          version = parts[2];
          name = `@${parts[1]}`;
        } else {
          version = parts[1];
          name = parts[0];
        }
      }

      html += `<tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px 0;"><strong>${name}</strong></td>
        <td>${version || '---'}</td>
        <td><span style="background: #f0f0f0; padding: 2px 6px; border-radius: 4px;">${info.licenses}</span></td>
      </tr>`;
    }
    html += '</tbody></table>';

    // 4. Save as local artifact for review
    const artifactDir = path.join(rootDir, 'temp/artifacts');
    if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });
    const localArtifactPath = path.join(artifactDir, 'license-report.html');
    fs.writeFileSync(localArtifactPath, html);
    console.log(`   📂 Local artifact saved: temp/artifacts/license-report.html`);

    // 5. Upload to Firestore
    try {
      await db.collection('static_pages').doc('system').collection('legal').doc('lizenzen').set({
        slug: 'lizenzen',
        title: 'Lizenzen',
        content: html,
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
