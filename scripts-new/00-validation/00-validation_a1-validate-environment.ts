/**
 * SCRIPT: 01-validate-environment.ts
 * 
 * AUFGABE: 
 * Absoluter Root-Wächter der Pipeline.
 * Prüft die .env Datei auf Vollständigkeit und korrekte Formate,
 * BEVOR irgendein anderes Skript (Wipe, Seed, etc.) ausgeführt wird.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { LogService } from '../utils/log-service';

LogService.init('GUARD', 'ENV');

async function validateEnvironment() {
  console.log('🛡️  GUARD: VALIDATING ENVIRONMENT CONFIGURATION...');

  const rootDir = path.resolve(__dirname, '../../');
  const envPath = path.join(rootDir, '.env');

  if (!fs.existsSync(envPath)) {
    console.error('❌ CRITICAL ERROR: .env file is missing at root.');
    process.exit(1);
  }

  // Explicitly load .env file to ensure all variables are available
  dotenv.config({ path: envPath });

  // Use process.env which is now populated
  const env = process.env;

  let failed = false;

  interface ValidationRule {
    key: string;
    description: string;
    pattern?: RegExp;
    required: boolean;
    customValidation?: (val: string) => boolean;
  }

  const rules: ValidationRule[] = [
    // === 1. PUBLIC CONFIGURATION (Firebase Client) ===
    { key: 'VITE_FIREBASE_API_KEY', description: 'Firebase API Key', pattern: /^AIza[0-9A-Za-z_-]{35}$/, required: true },
    { key: 'VITE_FIREBASE_AUTH_DOMAIN', description: 'Firebase Auth Domain', required: true },
    { key: 'VITE_FIREBASE_PROJECT_ID', description: 'Firebase Project ID', required: true },
    { key: 'VITE_FIREBASE_STORAGE_BUCKET', description: 'Firebase Storage Bucket', required: true },
    { key: 'VITE_FIREBASE_MESSAGING_SENDER_ID', description: 'Firebase Messaging Sender ID', required: true },
    { key: 'VITE_FIREBASE_APP_ID', description: 'Firebase App ID', required: true },
    { key: 'VITE_FIREBASE_MEASUREMENT_ID', description: 'GA4 Measurement ID', pattern: /^G-[A-Z0-9]+$/, required: true },
    { key: 'VITE_FIREBASE_DATABASE_URL', description: 'Firebase Database URL', pattern: /^https:\/\/.+$/, required: true },
    { key: 'VITE_PROJECT_URL', description: 'Vite Project URL', pattern: /^https:\/\/.+$/, required: true },

    // === 2. PUBLIC CONFIGURATION (Integrations) ===
    { key: 'VITE_RECAPTCHA_SITE_KEY', description: 'reCAPTCHA Site Key', pattern: /^6L[a-zA-Z0-9_-]{38}$/, required: true },
    { key: 'VITE_IMAGEKIT_URL_ENDPOINT', description: 'ImageKit URL Endpoint', pattern: /^https:\/\/ik\.imagekit\.io\/.+$/, required: true },
    { key: 'VITE_IMAGEKIT_PUBLIC_KEY', description: 'ImageKit Public Key', required: true },

    // === 3. PRIVATE CONFIGURATION (Security) ===
    { key: 'FIREBASE_ADMIN_TYPE', description: 'Firebase Admin Type', required: true },
    { key: 'FIREBASE_ADMIN_PROJECT_ID', description: 'Firebase Admin Project ID', required: true },
    { key: 'FIREBASE_ADMIN_PRIVATE_KEY_ID', description: 'Firebase Admin Private Key ID', required: true },
    { 
      key: 'FIREBASE_ADMIN_PRIVATE_KEY', 
      description: 'Firebase Admin Private Key', 
      required: true,
      customValidation: (val: string) => val.includes('BEGIN PRIVATE KEY') && val.includes('END PRIVATE KEY')
    },
    { key: 'FIREBASE_ADMIN_CLIENT_EMAIL', description: 'Firebase Admin Client Email', required: true },
    { key: 'FIREBASE_ADMIN_CLIENT_ID', description: 'Firebase Admin Client ID', required: true },
    { key: 'FIREBASE_ADMIN_AUTH_URI', description: 'Firebase Admin Auth URI', required: true },
    { key: 'FIREBASE_ADMIN_TOKEN_URI', description: 'Firebase Admin Token URI', required: true },
    { key: 'FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL', description: 'Firebase Admin Auth Provider Cert URL', required: true },
    { key: 'FIREBASE_ADMIN_CLIENT_X509_CERT_URL', description: 'Firebase Admin Client Cert URL', required: true },
    { key: 'FIREBASE_ADMIN_UNIVERSE_DOMAIN', description: 'Firebase Admin Universe Domain', required: true },
    { key: 'RECAPTCHA_SECRET_KEY', description: 'reCAPTCHA Secret Key', required: true },
    { key: 'IMAGEKIT_PRIVATE_KEY', description: 'ImageKit Private Key', pattern: /^private_[a-zA-Z0-9+=/]{24,64}$/, required: true },

    // === 4. BREVO CONFIGURATION (Private) ===
    { key: 'BREVO_API_KEY', description: 'Brevo API Key', required: true },
    { key: 'BREVO_SMTP_KEY', description: 'Brevo SMTP Key', required: true },
    { key: 'BREVO_MAIL', description: 'Brevo Sender Mail', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, required: true },
    { key: 'BREVO_CONTACT_SENDER_NAME', description: 'Brevo Sender Name', required: true },

    // === 5. IDENTITY ARCHITECTURE ===
    { key: 'ADMIN_EMAIL', description: 'Admin Login Email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, required: true },
    { key: 'ADMIN_PASSWORD', description: 'Admin Login Password', required: true },
    { key: 'CUSTOMER_EMAIL', description: 'Customer Contact Email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, required: true },
    { key: 'CUSTOMER_DOMAIN', description: 'Customer Domain', pattern: /^[a-z0-9.-]+\.[a-z]{2,}$/, required: true }
  ];

  console.log('\n   📋 CHECKING ALL REQUIRED KEYS FROM .env...');
  
  for (const rule of rules) {
    const value = env[rule.key];

    if (!value && rule.required) {
      console.error(`      ❌ MISSING: ${rule.key} (${rule.description})`);
      failed = true;
      continue;
    }

    if (value && rule.pattern && !rule.pattern.test(value)) {
      console.error(`      ❌ INVALID FORMAT: ${rule.key}`);
      console.error(`         Reason: Does not match expected pattern ${rule.pattern}`);
      failed = true;
      continue;
    }

    if (value && rule.customValidation && !rule.customValidation(value)) {
      console.error(`      ❌ INVALID CONTENT: ${rule.key}`);
      console.error(`         Reason: Custom validation failed (e.g. malformed JSON)`);
      failed = true;
      continue;
    }

    if (value) {
      // Don't log full secret values for security, just presence
      const displayValue = rule.key.includes('KEY') || rule.key.includes('PASSWORD') || rule.key.includes('SECRET') || rule.key.includes('JSON')
        ? '*** [HIDDEN] ***'
        : value;
      console.log(`      ✅ ${rule.key}: ${displayValue}`);
    }
  }

  if (failed) {
    console.error('\n🛑 ENVIRONMENT VALIDATION FAILED.');
    console.error('   Please check your .env file and ensure all keys are present and correctly formatted.');
    process.exit(1);
  }

  console.log('\n✨ ENVIRONMENT GUARD PASSED: All 3-tier configurations (including Flattened Firebase Admin) verified.');
  process.exit(0);
}

validateEnvironment().catch(err => {
  console.error('\n❌ CRITICAL: Unhandled error during environment validation:');
  console.error(err);
  process.exit(1);
});
