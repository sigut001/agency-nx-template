import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

async function cleanup() {
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
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    console.log('🧹 Starting Cleanup of Test Data...');

    // 1. Cleanup Test Users in Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '>=', 'test-'), where('email', '<=', 'test-z'));
    const snapshot = await getDocs(q);

    console.log(`Found ${snapshot.size} test users to delete.`);
    for (const userDoc of snapshot.docs) {
      console.log(`Deleting Firestore profile: ${userDoc.data().email}`);
      await deleteDoc(doc(db, 'users', userDoc.id));
    }

    // 2. Cleanup History entries for test pages (optional, but keep it clean)
    // We mainly delete the profiles to block access. 
    // Auth account deletion typically requires Admin SDK or CLI.
    
    console.log('\n✅ Cleanup of Firestore profiles completed.');
    console.log('💡 Note: Actual Auth accounts should be managed via Firebase Console or Admin SDK.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

cleanup();
