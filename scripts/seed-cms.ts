import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

/**
 * CMS Seed Script
 * Prepares the initial Firestore data structure for the agency template.
 */

async function seed() {
  console.log('🌱 Starting CMS Seed...\n');

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

  try {
    // 1. Navigation Setup
    console.log('📌 Seeding Navigation...');
    await setDoc(doc(db, 'config', 'navigation'), {
      items: [
        { label: 'Home', path: '/' },
        { label: 'Leistungen', path: '/#services' },
        { label: 'Über uns', path: '/#about' },
        { label: 'Kontakt', path: '/contact' }
      ]
    });

    // 2. CICD Config Setup
    console.log('🤖 Seeding CICD Config...');
    await setDoc(doc(db, 'config', 'cicd'), {
      needsRebuild: false,
      lastRebuildAt: null,
      pendingSEOChanges: []
    });

    // 3. Sample Pages with SEO
    console.log('📄 Seeding Pages with SEO...');
    const pages = [
      {
        slug: 'home',
        title: 'Willkommen bei Qubits Digital',
        content: 'Wir entwickeln Ihre digitale Zukunft mit modernsten Technologien.',
        seo: {
          title: 'Modernste Web-Entwicklung & Design',
          description: 'Wir bauen Ihre digitale Zukunft mit modernsten Web-Technologien.',
          keywords: 'Webdesign, React, Nx, Agentur',
          ogImage: 'https://qubits-digital.de/og-home.jpg'
        }
      },
      {
        slug: 'imprint',
        title: 'Impressum',
        content: 'Hier stehen die rechtlichen Informationen...',
        seo: {
          title: 'Impressum | Qubits Digital',
          description: 'Rechtliche Informationen von Qubits Digital.',
          keywords: 'Impressum, Rechtliches',
          ogImage: ''
        }
      }
    ];

    for (const page of pages) {
      await setDoc(doc(collection(db, 'pages'), page.slug), page);
    }

    // 4. Initial Users Setup (Optional/Example)
    console.log('👥 Seeding User Roles Structure...');
    // We don't seed actual users here as we need UIDs, 
    // but we can prepare a reference or just log
    console.log('💡 Tip: First signed-in user should be manually set to "owner" in Firestore.');

    console.log('\n✅ CMS Seeding successfully completed!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seed().catch(console.error);
