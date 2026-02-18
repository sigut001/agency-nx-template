/**
 * SCRIPT: 03-validate-recaptcha-health.ts
 * 
 * AUFGABE: 
 * Prüft ob der reCAPTCHA Site Key valide ist, indem das api.js Skript von Google geladen wird.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { LogService } from '../utils/log-service';

LogService.init('HEALTH', 'RECAPTCHA');

const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(rootDir, '.env') });

async function validateRecaptcha() {
    console.log('🛡️  STARTING INTEGRATION CHECK...');
    
    const siteKey = process.env.VITE_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
        console.error('   ❌ ERROR: VITE_RECAPTCHA_SITE_KEY is missing in .env');
        process.exit(1);
    }

    try {
        const url = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
        console.log(`   🌐 FETCH: Requesting Google API with key ${siteKey}...`);
        const response = await fetch(url);

        if (response.ok) {
            console.log(`   ✅ SUCCESS: Google API delivered the script (HTTP ${response.status}). Key is active.`);
            process.exit(0);
        } else {
            const errBody = await response.text();
            console.error(`   ❌ FAIL: Google API rejected the request (HTTP ${response.status}).`);
            console.error(`      Response: ${errBody.substring(0, 100)}...`);
            process.exit(1);
        }
    } catch (err) {
        const error = err as Error;
        console.error('   ❌ EXCEPTION: Could not connect to Google reCAPTCHA servers.');
        console.error(`      Message: ${error.message || String(error)}`);
        process.exit(1);
    }
}

validateRecaptcha();
