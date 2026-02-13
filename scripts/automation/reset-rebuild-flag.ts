import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

async function resetFlag() {
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
    apiKey: process.env.VITE_FIREBASE_API_KEY || env.VITE_FIREBASE_API_KEY,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID,
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    const cicdRef = doc(db, 'config', 'cicd');
    await updateDoc(cicdRef, { 
      needsRebuild: false,
      lastRebuildAt: serverTimestamp(),
      pendingSEOChanges: []
    });
    console.log('✅ Rebuild Flag reset successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting rebuild flag:', error);
    process.exit(1);
  }
}

resetFlag();
