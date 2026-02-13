import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function verifyPermissions() {
  const envPath = path.resolve(__dirname, '../../.env');
  dotenv.config({ path: envPath });

  const config = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  };

  console.log('Using config:', { ...config, apiKey: '***' });

  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing credentials in .env');
  }

  try {
    console.log(`Attempting login as ${email}...`);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    console.log(`✅ Logged in as ${uid}`);

    console.log('Attempting to read own user document...');
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      console.log('✅ User document exists. Data:', userDoc.data());
      if (userDoc.data()?.role === 'owner') {
        console.log('✅ User has "owner" role.');
      } else {
        console.error('❌ User DOES NOT have "owner" role:', userDoc.data());
      }
    } else {
      console.error('❌ User document does not exist!');
    }

    console.log('Attempting verify write access...');
    try {
        await setDoc(doc(db, '_validation_test', `test-${Date.now()}`), {
            createdAt: new Date(),
            user: email
        });
        console.log('✅ Write access confirmed on _validation_test.');
    } catch (e) {
        console.error('❌ Write failed:', e);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyPermissions();
