import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

async function ensureUser() {
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

  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const testEmail = 'test-owner@qubits-digital.de';
  const testPass = 'TestPass123!';

  try {
    console.log(`👤 Checking for test user ${testEmail}...`);
    try {
      await signInWithEmailAndPassword(auth, testEmail, testPass);
      console.log('✅ Test user already exists.');
    } catch (e) {
      console.log('✨ Creating new test owner account...');
      const cred = await createUserWithEmailAndPassword(auth, testEmail, testPass);
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: testEmail,
        role: 'owner',
        displayName: 'Test Owner'
      });
      console.log('✅ Test owner created and role assigned.');
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ensuring test user:', error);
    process.exit(1);
  }
}

ensureUser();
