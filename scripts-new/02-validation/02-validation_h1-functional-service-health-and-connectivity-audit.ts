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

  const results = { imagekit: false, hubspot: false };

  try {
    // 1. HubSpot
    console.log('   📡 Testing HubSpot Connectivity...');
    try {
      const portalId = env.VITE_HUBSPOT_PORTAL_ID;
      const region = env.VITE_HUBSPOT_REGION || 'eu1';
      if (!portalId) throw new Error('VITE_HUBSPOT_PORTAL_ID is not set.');
      
      const hsUrl = `https://js-${region}.hs-scripts.com/${portalId}.js`;
      const hsResp = await fetch(hsUrl, { method: 'HEAD' });
      
      if (hsResp.ok) {
        results.hubspot = true;
        console.log(`   ✅ HubSpot: Reachable (Status ${hsResp.status})`);
      } else {
        throw new Error(`HTTP ${hsResp.status} - Script not found at ${hsUrl}`);
      }
    } catch (e: any) {
      console.error('   ❌ HubSpot connection error:', e.message || e);
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
