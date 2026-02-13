#!/usr/bin/env node
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Ensure environment variables are loaded from root .env
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

/**
 * CMS Seed Script (Admin Version)
 * Prepares the initial Firestore data structure using Admin SDK.
 */

async function seed() {
  console.log('🌱 Starting CMS Seed (via Admin SDK)...\n');

  // 1. Load Credentials
  let serviceAccount;
  const envJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  
  if (envJson) {
    try {
      // Handle potential single quotes or formatting from .env
      const cleanJson = envJson.trim().replace(/^'|'$/g, '');
      serviceAccount = JSON.parse(cleanJson);
    } catch (e) {
      console.warn('⚠️ Could not parse GOOGLE_APPLICATION_CREDENTIALS_JSON, trying file...');
    }
  }

  if (!serviceAccount) {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 
                               path.join(__dirname, '../../firebase-service-account.json');

    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    }
  }

  if (!serviceAccount) {
    console.error('❌ Firebase credentials not found (JSON string or file)!');
    console.log('   Please set GOOGLE_APPLICATION_CREDENTIALS_JSON or provide firebase-service-account.json');
    process.exit(1);
  }

  // 2. Initialize Admin SDK
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  const db = admin.firestore();

  // Helper to clear database
  async function clearDatabase() {
    console.log('🧹 Clearing entire Firestore database...');
    const collections = await db.listCollections();
    for (const collection of collections) {
      const documents = await collection.listDocuments();
      if (documents.length > 0) {
        console.log(`   - Deleting ${documents.length} docs from ${collection.id}`);
        const params = documents.map((doc: any) => doc.delete());
        await Promise.all(params);
      }
    }
    console.log('✨ Database cleared.');
  }

  try {
    // 0. Clean Slate
    await clearDatabase();

    // 1. Navigation Setup
    console.log('📌 Seeding Navigation...');
    await db.collection('config').doc('navigation').set({
      items: [
        { label: 'Home', path: '/' },
        { label: 'Leistungen', path: '/#services' },
        { label: 'Über uns', path: '/#about' },
        { label: 'Kontakt', path: '/contact' }
      ]
    });

    // 2. CICD Config Setup
    console.log('🤖 Seeding CICD Config...');
    await db.collection('config').doc('cicd').set({
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
      await db.collection('pages').doc(page.slug).set(page);
    }

    console.log('\n✅ CMS Seeding (Admin) successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed().catch(console.error);
