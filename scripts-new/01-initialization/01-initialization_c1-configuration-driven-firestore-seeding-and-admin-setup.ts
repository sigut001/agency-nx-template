/**
 * SCRIPT: 02-configuration-driven-firestore-seeding-and-admin-setup.ts
 * 
 * AUFGABE: 
 * Baut die gesamte Datenstruktur ("Schema") und den initialen Zugriff in Firebase neu auf.
 */

import * as admin from 'firebase-admin';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { LogService } from '../utils/log-service';

LogService.init('ACTION', 'SEEDING');

const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(rootDir, '.env') });

// Reconstructed ServiceAccount for Firebase Admin
const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};
const configPath = path.join(rootDir, 'apps/company-website/src/app/app.routes.config.ts');

async function seedInfrastructure() {
  console.log('🏗️  STARTING CONFIGURATION-DRIVEN SEEDING...');

  try {
    // 1. Firebase Admin Init
    if (!admin.apps.length) {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || path.join(rootDir, 'firebase-service-account.json');
      let credential;

      if (serviceAccount.projectId && serviceAccount.privateKey && serviceAccount.clientEmail) {
        console.log('   🔐 Using individual FIREBASE_ADMIN_* credentials');
        credential = admin.credential.cert(serviceAccount);
      } else if (fs.existsSync(serviceAccountPath)) {
        console.log(`   🔐 Using credentials from file: ${serviceAccountPath}`);
        // Simple manual parse for the file case
        credential = admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')));
      } else {
        throw new Error('No Firebase credentials found (individual env variables or file).');
      }
      admin.initializeApp({ credential });
    }

    const db = admin.firestore();
    const auth = admin.auth();

    // 2. Load Config (Direct Import)
    const { APP_ROUTES_CONFIG } = await import('../../apps/company-website/src/app/app.routes.config');
    
    const staticRows = APP_ROUTES_CONFIG.filter(r => r.type === 'static');
    const dynamicRows = APP_ROUTES_CONFIG.filter(r => r.type === 'dynamic');

    // --- STEP 1: STATIC & DYNAMIC SEEDING ---
    console.log('   📂 SEEDING CONTENT FROM CONFIG...');
    
    const LEGAL_DESCRIPTIONS: Record<string, string> = {
      '/impressum': 'Das offizielle Impressum der Agency Blueprint mit allen gesetzlichen Informationen und Kontaktdaten.',
      '/datenschutz': 'Informationen zum Datenschutz und zum Umgang mit personenbezogenen Daten bei der Agency Blueprint.',
      '/agb': 'Allgemeine Geschäftsbedingungen der Agency Blueprint für eine transparente Zusammenarbeit.',
      '/kontakt': 'Kontaktieren Sie die Agency Blueprint für modernste Web-Entwicklung und Design-Lösungen.'
    };

    // Import helper for consistent Firestore path handling
    const { getSlugFromPath } = await import('../../apps/company-website/src/app/shared/utils/firestore-path-helpers');

    for (const row of staticRows) {
      const { path: pathVal, title, collection: colRef } = row;
      const parts = colRef!.split('/');
      
      const description = LEGAL_DESCRIPTIONS[pathVal] || `Willkommen bei Qubits Digital. ${title} - Ihre Experten für modernste Web-Lösungen.`;
      
      // Use centralized helper logic for path interpretation
      let current: any = db;
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) current = current.collection(parts[i]);
        else current = current.doc(parts[i]);
      }
      
      const slug = getSlugFromPath(colRef!);
      
      await (current as admin.firestore.DocumentReference).set({
        slug, 
        title, 
        content: `<h1>${title}</h1><p>Inhalt für ${title} wird vorbereitet.</p>`, 
        seo: { title, description },
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      console.log(`     ➡️  Seeded Static: ${colRef}`);
    }


    for (const row of dynamicRows) {
      const { title, collection: colRef } = row;
      const parts = colRef!.split('/');
      const docIds = ['doc-1', 'doc-2', 'doc-3'];
      
      // Dynamic: parts[0]/parts[1]/parts[2] -> e.g. dynamic_pages/blog/documents
      for (const id of docIds) {
        await db.collection(parts[0]).doc(parts[1]).collection(parts[2]).doc(id).set({
          slug: id, 
          title: `${title} - ${id.toUpperCase()}`, 
          content: `<p>Example content for ${title} ${id}</p>`, 
          seo: { title: `${title} | ${id}`, description: `This is the SEO description for ${title} ${id}` },
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`     ➡️  Seeded Dynamic: ${colRef}/${id}`);
      }
    }

    // --- STEP 2: ADMIN IDENTITY ---
    console.log('\n   👤 SETTING UP ADMIN IDENTITY...');
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (email && password) {
      let uid;
      try {
        const user = await auth.getUserByEmail(email);
        uid = user.uid;
        console.log('     ℹ️ Admin user already exists. Skipping creation.');
      } catch (e: any) {
        if (e.code === 'auth/user-not-found') {
          const user = await auth.createUser({ email, password, displayName: 'Initial Admin' });
          uid = user.uid;
          console.log('     ✅ Admin identity created.');
        } else {
          throw e;
        }
      }
      
      if (uid) {
        await db.collection('users').doc(uid).set({ email, role: 'owner', createdAt: admin.firestore.FieldValue.serverTimestamp() });
        console.log('     ✅ Firestore role "owner" assigned.');
      }
    }

    // --- STEP 3: CI/CD CONFIG ---
    await db.collection('config').doc('cicd').set({
      needsRebuild: false,
      lastRebuildAt: admin.firestore.FieldValue.serverTimestamp(),
      pendingSEOChanges: []
    });
    console.log('     ✅ CI/CD document initialized.');

    // --- STEP 4: RULES ---
    console.log('\n   📜 DEPLOYING SECURITY RULES...');
    execSync('firebase deploy --only firestore:rules --non-interactive', { stdio: 'inherit', cwd: rootDir });

    console.log('\n✨ SEEDING COMPLETED SUCCESSFULLY.');
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ FATAL ERROR during Seeding:');
    console.error(error.stack || error);
    process.exit(1);
  }
}

seedInfrastructure();
