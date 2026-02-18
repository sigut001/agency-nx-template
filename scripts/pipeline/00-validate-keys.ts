import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * PHASE 0: Key Integrity Validation
 * Responsibility: Ensure every single required key is present in the environment.
 */

const rootDir = path.resolve(__dirname, '../..');
dotenv.config({ path: path.join(rootDir, '.env') });

const REQUIRED_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_BREVO_API_KEY',
  'VITE_BREVO_DEFAULT_SENDER_EMAIL',
  'VITE_IMAGEKIT_URL_ENDPOINT',
  'VITE_IMAGEKIT_PUBLIC_KEY',
  'VITE_IMAGEKIT_PRIVATE_KEY',
  'VITE_RECAPTCHA_SITE_KEY',
  'VITE_PROJECT_URL',
  'TEST_USER_EMAIL',
  'TEST_USER_PASSWORD'
];

// Special Keys for Admin SDK (Server-Side)
const ADMIN_KEYS = [
  'GOOGLE_APPLICATION_CREDENTIALS_JSON'
];

async function validateKeys() {
  console.log('🛡️  Starting Phase 0: Key Integrity Validation...\n');
  
  const missing: string[] = [];
  const env = process.env;

  console.log('📋 Checking standard environment variables...');
  for (const key of REQUIRED_KEYS) {
    if (!env[key]) {
      missing.push(key);
      console.error(`   ❌ Missing: ${key}`);
    } else {
      console.log(`   ✅ Present: ${key}`);
    }
  }

  console.log('\n🔑 Checking Admin/CI credentials...');
  for (const key of ADMIN_KEYS) {
     if (!env[key]) {
       // On local dev, we might use a file instead of JSON string
       const serviceAccountPath = path.join(rootDir, 'firebase-service-account.json');
       const hasFile = require('fs').existsSync(serviceAccountPath);
       
       if (!hasFile) {
         missing.push(key);
         console.error(`   ❌ Missing: ${key} (No JSON string and no fallback file)`);
       } else {
         console.log(`   ✅ Present: Fallback file for ${key} detected.`);
       }
     } else {
       console.log(`   ✅ Present: ${key}`);
     }
  }

  if (missing.length > 0) {
    console.error(`\n🛑 Validation FAILED! ${missing.length} keys are missing.`);
    console.error('   Please check your .env file or GitHub Repository Secrets.');
    process.exit(1);
  }

  console.log('\n✨ All required keys are present. Integrity check PASSED.');
  process.exit(0);
}

validateKeys().catch(err => {
  console.error(err);
  process.exit(1);
});
