import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

async function checkFlag() {
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
    const cicdDoc = await getDoc(doc(db, 'config', 'cicd'));
    const data = cicdDoc.data();
    const shouldRebuild = data?.needsRebuild === true;
    
    console.log(`🔍 Rebuild Flag Status: ${shouldRebuild}`);
    // Set GitHub Actions output
    process.stdout.write(`::set-output name=should_rebuild::${shouldRebuild}\n`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking rebuild flag:', error);
    process.exit(1);
  }
}

checkFlag();
