import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import * as path from 'path';
import * as dotenv from 'dotenv';

/**
 * PHASE 1a: Firebase Service Validation
 * Responsibility: Test Auth and Firestore CRUD operations.
 */

async function validateFirebase() {
  console.log('🔥 Starting Phase 1a: Firebase Service Validation...\n');

  const rootDir = path.resolve(__dirname, '../..');
  dotenv.config({ path: path.join(rootDir, '.env') });
  const env = process.env;

  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'TEST_USER_EMAIL',
    'TEST_USER_PASSWORD'
  ];

  const missingVars = requiredVars.filter(v => !env[v]);

  if (missingVars.length > 0) {
    console.error('❌ Validation Failed: Missing Environment Variables');
    console.error(`   Expected: ${requiredVars.join(', ')}`);
    console.error(`   Missing:  ${missingVars.join(', ')}`);
    process.exit(1);
  }

  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    const testEmail = env.TEST_USER_EMAIL!;
    const testPass = env.TEST_USER_PASSWORD!;

    // 1. Auth Test
    console.log('📦 Testing Auth...');
    await signInWithEmailAndPassword(auth, testEmail, testPass);
    console.log('   ✅ Auth: Signed in successfully as ' + testEmail);

    // 2. CRUD Test
    console.log('\n📦 Testing Firestore CRUD...');
    const testColl = collection(db, '_validation_test');
    
    const newDoc = await addDoc(testColl, { 
      source: 'pipeline_validation', 
      timestamp: Date.now() 
    });
    console.log('   ✅ Create: Document created (ID:', newDoc.id + ')');

    const docSnap = await getDoc(newDoc);
    if (!docSnap.exists()) {
        console.error('   ❌ Read Failed: Document not found after creation.');
        console.error(`      Expected: Document ${newDoc.id} to exist.`);
        console.error(`      Found: null (exists: false)`);
        throw new Error('Read verification failed');
    }
    console.log('   ✅ Read: Data verified.');

    await updateDoc(doc(db, '_validation_test', newDoc.id), { status: 'validated' });
    console.log('   ✅ Update: Document updated.');

    await deleteDoc(doc(db, '_validation_test', newDoc.id));
    console.log('   ✅ Delete: Document removed.');

    console.log('\n✨ SUMMARY: Firebase Validation PASSED');
    console.log('   - Auth: OK');
    console.log('   - CRUD: OK');
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ Firebase Validation FAILED');
    console.error(`   Error: ${error.message || error}`);
    if (error.code) console.error(`   Code: ${error.code}`);
    process.exit(1);
  }
}

validateFirebase().catch(err => {
  console.error(err);
  process.exit(1);
});
