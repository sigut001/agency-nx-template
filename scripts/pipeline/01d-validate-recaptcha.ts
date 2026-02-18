import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * PHASE 1d: reCAPTCHA Configuration Validation
 * Responsibility: Ensure the site key is present and follows the expected format.
 */

async function validateRecaptcha() {
  console.log('🛡️ Starting Phase 1d: reCAPTCHA Configuration Validation...\n');

  const rootDir = path.resolve(__dirname, '../..');
  dotenv.config({ path: path.join(rootDir, '.env') });
  const env = process.env;

  const requiredVars = ['VITE_RECAPTCHA_SITE_KEY'];
  const missingVars = requiredVars.filter(v => !env[v]);

  if (missingVars.length > 0) {
    console.error('❌ Validation Failed: Missing Environment Variables');
    console.error(`   Expected: ${requiredVars.join(', ')}`);
    console.error(`   Missing:  ${missingVars.join(', ')}`);
    process.exit(1);
  }

  const siteKey = env.VITE_RECAPTCHA_SITE_KEY!;

  // Google reCAPTCHA keys usually start with 6L
  if (siteKey.startsWith('6L')) {
    console.log('   ✅ Key Format Check: Valid (starts with 6L)');
    
    console.log('\n✨ SUMMARY: reCAPTCHA Validation PASSED');
    console.log('   - Site Key: PRESENT');
    console.log('   - Format:   VALID');
    process.exit(0);
  } else {
    console.error('❌ reCAPTCHA Validation FAILED: Invalid Key Format');
    console.error(`   Expected: Key starting with '6L'`);
    console.error(`   Found:    '${siteKey.substring(0, 4)}...'`);
    process.exit(1);
  }
}

validateRecaptcha().catch(err => {
  console.error(err);
  process.exit(1);
});
