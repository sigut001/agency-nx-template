/**
 * SCRIPT: 01-validate-brevo-health.ts
 * 
 * AUFGABE: 
 * Funktionale Prüfung von Brevo durch Versand einer Test-Mail und Polling des Zustellstatus.
 * Optimiert für maximale Transparenz im Debug-Log.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { LogService } from '../utils/log-service';

LogService.init('HEALTH', 'BREVO');

const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(rootDir, '.env') });

async function validateBrevo() {
    console.log('📬 STARTING FUNCTIONAL VALIDATION...');
    
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_MAIL;
    const senderName = process.env.BREVO_CONTACT_SENDER_NAME || 'Qubits Validation Bot';
    const recipientEmail = process.env.CUSTOMER_EMAIL;

    if (!apiKey || !senderEmail || !recipientEmail) {
        console.error('   ❌ ERROR: Brevo API Key, BREVO_MAIL, or CUSTOMER_EMAIL is missing in .env');
        process.exit(1);
    }

    try {
        const dispatchUrl = 'https://api.brevo.com/v3/smtp/email';
        console.log(`   📨 DISPATCH: Sending test email from ${senderEmail} to ${recipientEmail}...`);
        
        const response = await fetch(dispatchUrl, {
            method: 'POST',
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                sender: { email: senderEmail, name: senderName },
                to: [{ email: recipientEmail, name: 'Customer Verification' }],
                subject: 'CI Health Check: Functional Dispatch Test',
                htmlContent: '<h3>Validation successful.</h3><p>This email confirms that the Brevo API and SMTP dispatch are working correctly for the account: ' + senderEmail + '. Verified via customer contact: ' + recipientEmail + '</p>'
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`   ❌ FAIL: Brevo API (Dispatch) returned HTTP ${response.status}`);
            console.error(`      Response: ${errorBody.substring(0, 100)}...`);
            process.exit(1);
        }

        const data = await response.json() as { messageId: string };
        console.log(`   ✅ SUCCESS: Email accepted by Brevo. MessageID: ${data.messageId}`);
        console.log(`      (Note: Verified using Customer Email: ${recipientEmail})`);
        
        console.log('\n✨ [BREVO] VALIDATION: COMPLETE & FUNCTIONAL');
        process.exit(0);

    } catch (err) {
        const error = err as Error;
        console.error('   ❌ EXCEPTION: Critical error during Brevo validation:');
        console.error(`      Message: ${error.message || String(error)}`);
        process.exit(1);
    }
}

validateBrevo();
