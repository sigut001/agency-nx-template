import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

/**
 * PHASE 1e: SEO Metadata Synchronization
 * Responsibility: Fetch latest metadata from Firestore and sync it into local configs.
 * 
 * Note: This is "SEO Generation" in terms of data, distinct from "Sitemap Generation".
 */

async function syncSeoMetadata() {
  console.log('🌐 Starting Phase 1e: SEO Metadata Synchronization...\n');

  const rootDir = path.resolve(__dirname, '../..');
  dotenv.config({ path: path.join(rootDir, '.env') });

  // 1. Initialize Admin SDK
  let serviceAccount;
  const envJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  
  if (envJson) {
      try {
          const cleanJson = envJson.trim().replace(/^'|'$/g, '');
          serviceAccount = JSON.parse(cleanJson);
      } catch (e: any) { 
        console.warn('   ⚠️ JSON Credentials parsing failed.');
        console.warn(`      Error: ${e.message}`);
      }
  }

  if (!serviceAccount) {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 
                               path.join(rootDir, 'firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    }
  }

  if (!serviceAccount) {
    console.error('❌ Sync Failed: No Admin Credentials found');
    console.error('   Expected: GOOGLE_APPLICATION_CREDENTIALS_JSON or firebase-service-account.json');
    console.error('   Found:    None');
    process.exit(1);
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  const db = admin.firestore();

  try {
    console.log('   🔍 Fetching metadata from Firebase...');
    const configSnapshot = await db.collection('config').doc('seo').get();
    
    let source = 'Firebase';
    let data;

    if (!configSnapshot.exists) {
      console.warn('   ⚠️ No global SEO config found in Firestore. Using defaults.');
      source = 'Defaults (Fallback)';
      data = {
        title: 'Qubits Digital | Web-Entwicklung & Design',
        description: 'Progressive Web-Lösungen für moderne Unternehmen.'
      };
    } else {
      data = configSnapshot.data();
    }

    // 2. Write to local config for the Build process
    const configPath = path.join(rootDir, 'apps/company-website/src/assets/seo-config.json');
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });

    fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
    console.log('   ✅ Metadata synced to:', configPath);

    console.log('\n✨ SUMMARY: SEO Metadata Sync PASSED');
    console.log(`   - Source: ${source}`);
    console.log(`   - Output: ${path.relative(rootDir, configPath)}`);
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ SEO Sync FAILED');
    console.error(`   Error: ${error.message || error}`);
    process.exit(1);
  }
}

syncSeoMetadata().catch(err => {
  console.error(err);
  process.exit(1);
});
