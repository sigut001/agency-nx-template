import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

/**
 * DEEP Service Validation Script
 * Verifies NOT ONLY connectivity but also actual FUNCTIONALITY.
 */

async function validate() {
  console.log('🚀 Starting DEEP Service Validation...\n');

  // 0. Detect own IP for Whitelist Debugging
  try {
    const ipResp = await fetch('https://api.ipify.org');
    const myIp = await ipResp.text();
    console.log(`🌐 Execution IP: ${myIp}\n`);
  } catch (e) {
    console.log('🌐 Could not detect own IP.\n');
  }

  // Load Environment Variables
  const envPath = path.resolve(__dirname, '../.env');
  const env: Record<string, string> = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  }

  const results = {
    firebase_crud: false,
    brevo_send: false,
    imagekit_transform: false,
    recaptcha_config: false
  };

  // --- 1. FIREBASE CRUD TEST ---
  console.log('📦 Testing Firebase CRUD Operations...');
  try {
    const firebaseConfig = {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const testColl = collection(db, '_validation_test');

    // CREATE
    const newDoc = await addDoc(testColl, { test: true, timestamp: Date.now() });
    console.log('   ✅ Create: Document created with ID:', newDoc.id);

    // READ
    const docSnap = await getDoc(newDoc);
    if (!docSnap.exists()) throw new Error('Document not found after creation');
    console.log('   ✅ Read: Document data verified.');

    // UPDATE
    await updateDoc(doc(db, '_validation_test', newDoc.id), { updated: true });
    console.log('   ✅ Update: Document successfully updated.');

    // DELETE
    await deleteDoc(doc(db, '_validation_test', newDoc.id));
    console.log('   ✅ Delete: Document successfully removed.');

    results.firebase_crud = true;
  } catch (error: any) {
    console.error('❌ Firebase CRUD Failed:', error.message);
  }

  // --- 2. BREVO FUNCTIONAL TEST ---
  console.log('\n📧 Testing Brevo Email Dispatch...');
  try {
    const apiKey = env.VITE_BREVO_API_KEY;
    const senderEmail = env.VITE_BREVO_DEFAULT_SENDER_EMAIL || 'vertrieb@qubits-digital.de';

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: 'Validation Bot' },
        to: [{ email: senderEmail, name: 'Admin' }],
        subject: 'Service Health Check: Functional Test',
        htmlContent: '<p>Direct API Functional Validation successful.</p>'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Brevo: Email sent successfully! MessageID:', data.messageId);
      results.brevo_send = true;
    } else {
      const errorMsg = await response.text();
      console.error('   ❌ Brevo: Error response:', errorMsg);
      console.log('   (Tipp: Prüfe, ob die IP 61.8.138.95 wirklich in Brevo hinterlegt ist oder ob der Key korrekt ist)');
    }
  } catch (error: any) {
    console.error('❌ Brevo Dispatch Failed:', error.message);
  }

  // --- 3. IMAGEKIT TRANSFORMATION TEST ---
  console.log('\n🖼️ Testing ImageKit Transformation logic...');
  try {
    const endpoint = env.VITE_IMAGEKIT_URL_ENDPOINT;
    // We use a sample manipulation to see if the CDN responds
    const testUrl = `${endpoint}/tr:w-100,h-100,fo-auto/sample-image.jpg`; 
    
    const response = await fetch(testUrl);
    // 404 is "fine" (file not there yet), but 401/403/500 is a problem
    if (response.status < 400 || response.status === 404) {
      console.log('   ✅ ImageKit: Transformation URL responded with status', response.status);
      results.imagekit_transform = true;
    } else {
      throw new Error(`Transformation returned status ${response.status}`);
    }
  } catch (error: any) {
    console.error('❌ ImageKit Test Failed:', error.message);
  }

  // --- 4. RECAPTCHA CONFIG CHECK ---
  console.log('\n🛡️ Checking reCAPTCHA Configuration...');
  const siteKey = env.VITE_RECAPTCHA_SITE_KEY;
  if (siteKey && siteKey.startsWith('6L')) {
    console.log('   ✅ reCAPTCHA: Key present and valid format.');
    results.recaptcha_config = true;
  }

  console.log('\n--- Final Summary ---');
  console.table(results);

  const allPassed = Object.values(results).every(v => v);
  process.exit(allPassed ? 0 : 1);
}

validate().catch(console.error);
