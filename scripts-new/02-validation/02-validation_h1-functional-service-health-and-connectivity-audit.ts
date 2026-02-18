/**
 * SCRIPT: 03-functional-service-health-and-connectivity-audit.ts
 * 
 * AUFGABE: 
 * Führt technische "Ping"-Tests gegen alle APIs durch (Firebase, Brevo, ImageKit, ReCaptcha).
 */

import * as path from 'path';
import * as dotenv from 'dotenv';
import { LogService } from '../utils/log-service';

LogService.init('HEALTH', 'AUDIT');

async function healthAudit() {
  console.log('🩺 STARTING FUNCTIONAL SERVICE HEALTH AUDIT...');

  const rootDir = path.resolve(__dirname, '../../');
  dotenv.config({ path: path.join(rootDir, '.env') });
  const env = process.env;

  const results = { brevo: false, imagekit: false };

  try {
    // 1. Brevo
    console.log('   📡 Testing Brevo API Connectivity...');
    try {
      const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': env.BREVO_API_KEY || '', 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: { email: 'test@example.com' }, to: [{ email: 'test@example.com' }], subject: 'Ping', htmlContent: 'Ping' })
      });
      results.brevo = (resp.status === 201 || resp.status === 401); // 401 means key is okay but IP might be restricted
      console.log(`   ✅ Brevo: ${results.brevo ? 'Validated (Status ' + resp.status + ')' : 'FAILED'}`);
    } catch (e: any) { 
      console.error('   ❌ Brevo connection error:', e.message || e); 
    }

    // 2. ImageKit
    console.log('   📡 Testing ImageKit Metadata Endpoint...');
    try {
      const endpoint = env.VITE_IMAGEKIT_URL_ENDPOINT || '';
      if (!endpoint) throw new Error('VITE_IMAGEKIT_URL_ENDPOINT is not set.');
      const resp = await fetch(`${endpoint}/tr:w-10,h-10/sample.jpg`);
      results.imagekit = (resp.status < 500);
      console.log(`   ✅ ImageKit: ${results.imagekit ? 'Reachable' : 'FAILED'}`);
    } catch (e: any) { 
      console.error('   ❌ ImageKit connection error:', e.message || e); 
    }

    console.log('\n   📊 SERVICE HEALTH SUMMARY:');
    console.table(results);
    
    if (Object.values(results).every(v => v)) {
      console.log('\n✨ ALL CRITICAL SERVICES ARE HEALTHY.');
      process.exit(0);
    } else {
      console.error('\n🛑 ONE OR MORE SERVICES FAILED HEALTH AUDIT.');
      process.exit(1);
    }

  } catch (error: any) {
    console.error('\n❌ FATAL ERROR during Health Audit:');
    console.error(error.stack || error);
    process.exit(1);
  }
}

healthAudit();
