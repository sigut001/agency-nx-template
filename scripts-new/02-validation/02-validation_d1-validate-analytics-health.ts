/**
 * SCRIPT: 04-validate-analytics-health.ts
 * 
 * AUFGABE: 
 * Prüft ob die Google Analytics Measurement ID valide ist, indem das gtag Skript geladen wird.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { LogService } from '../utils/log-service';

LogService.init('HEALTH', 'ANALYTICS');

const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(rootDir, '.env') });

async function validateAnalytics() {
    console.log('📊 STARTING INTEGRATION CHECK...');
    
    const measurementId = process.env.VITE_FIREBASE_MEASUREMENT_ID;
    if (!measurementId) {
        console.error('   ❌ ERROR: VITE_FIREBASE_MEASUREMENT_ID is missing in .env');
        process.exit(1);
    }

    try {
        const url = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        console.log(`   🌐 [ANALYTICS] FETCH: Requesting GTAG script for ID ${measurementId}...`);
        const response = await fetch(url);

        if (response.ok) {
            console.log(`   ✅ SUCCESS: Google Tag Manager delivered the script (HTTP ${response.status}). ID is active.`);
            process.exit(0);
        } else {
            const errBody = await response.text();
            console.error(`   ❌ FAIL: Google Analytics endpoint returned HTTP ${response.status}.`);
            console.error(`      Response: ${errBody.substring(0, 100)}...`);
            process.exit(1);
        }
    } catch (err: any) {
        console.error('   ❌ EXCEPTION: Could not connect to Google Analytics servers.');
        console.error(`      Message: ${err.message || err}`);
        process.exit(1);
    }
}

validateAnalytics();
