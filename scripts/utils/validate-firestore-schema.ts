import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

/**
 * UTILITY: Validate Firestore Schema
 * Checks if the required collections exist in Firestore.
 * Required Collections: config, static_pages, dynamic_pages, users
 */

async function validateSchema() {
  console.log('🔍 Validating Firestore Schema Structure...');

  // 1. Initialize Admin SDK
  const rootDir = path.resolve(__dirname, '../..');
  dotenv.config({ path: path.join(rootDir, '.env') });

  let serviceAccount;
  const envJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  
  if (envJson) {
    try {
        const cleanJson = envJson.trim().replace(/^'|'$/g, '');
        serviceAccount = JSON.parse(cleanJson);
    } catch (e) { /* ignore */ }
  }

  if (!serviceAccount) {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 
                               path.join(rootDir, 'firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    }
  }

  if (!serviceAccount && !process.env.FIREBASE_TOKEN) {
    console.warn('⚠️ No Admin Credentials found. Creating client-side check fallback not implemented yet.');
    console.error('❌ Cannot validate schema without Admin SDK credentials (SERVICE_ACCOUNT).');
    process.exit(1);
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  const db = admin.firestore();
  const requiredCollections = ['config', 'static_pages', 'dynamic_pages', 'users'];
  const missingCollections: string[] = [];

  try {
    // 1. Check Collections
    const collections = await db.listCollections();
    const existingIds = collections.map(c => c.id);

    for (const req of requiredCollections) {
      if (!existingIds.includes(req)) {
        missingCollections.push(req);
      }
    }

    // 2. Deep Check: Static Pages
    // Validate that the essential static pages (linked in routes) exist.
    const requiredStaticPages = ['home', 'contact', 'imprint', 'privacy', 'terms'];
    const missingPages: string[] = [];

    if (existingIds.includes('static_pages')) {
      const staticSnapshot = await db.collection('static_pages').get();
      const existingDocs = staticSnapshot.docs.map(d => d.id);
      
      for (const page of requiredStaticPages) {
        if (!existingDocs.includes(page)) {
          missingPages.push(page);
        }
      }
    }

    // 3. Deep Check: User Extistence
    let userExists = false;
    if (existingIds.includes('users')) {
      const userSnapshot = await db.collection('users').limit(1).get();
      userExists = !userSnapshot.empty;
    }


    // REPORTING
    let hasError = false;

    if (missingCollections.length > 0) {
      console.error(`❌ Missing Collections: ${missingCollections.join(', ')}`);
      hasError = true;
    }

    if (missingPages.length > 0) {
      console.error(`❌ Missing Static Page Docs: ${missingPages.join(', ')}`);
      hasError = true;
    }

    if (!userExists && existingIds.includes('users')) {
       console.error(`❌ 'users' collection exists but is empty! No test user found.`);
       hasError = true;
    }

    if (hasError) {
      console.error('   Run "npm run project:init" to seed the database properly.');
      process.exit(1);
    }

    console.log('✅ Firestore Schema is valid.');
    console.log('   - All collections present.');
    console.log('   - All required static pages present.');
    console.log('   - Users collection populated.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error validating schema:', error);
    process.exit(1);
  }
}

validateSchema().catch(console.error);
