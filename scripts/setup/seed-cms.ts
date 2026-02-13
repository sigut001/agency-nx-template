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

    // 1. Navigation Setup - REMOVED (Hardcoded in Frontend)
    // console.log('📌 Seeding Navigation...');
    // await db.collection('config').doc('navigation').set({ ... });


    // 2. CICD Config Setup
    console.log('🤖 Seeding CICD Config...');
    await db.collection('config').doc('cicd').set({
      needsRebuild: false,
      lastRebuildAt: null,
      pendingSEOChanges: []
    });


    // 3. Seeding Pages based on APP_ROUTES_CONFIG
    console.log('📄 Seeding Pages from Route Config...');
    
    // Wir laden die Config dynamisch, da wir hier im Node-Kontext sind
    // Hinweis: In einer echten App würde man das sauberer importieren, 
    // aber für das Seed-Script reicht ein require/import workaround oder direkte Definition.
    // Da APP_ROUTES_CONFIG reines TS/JS ist, können wir es importieren, wenn wir tsx nutzen.
    // Hier simulieren wir die Logik passend zur neuen Struktur:


    // --- STATIC PAGES ---
    const staticPages = [
      { 
        slug: 'home', 
        collection: 'static_pages',
        title: 'Willkommen bei Qubits Digital',
        content: 'Wir entwickeln Ihre digitale Zukunft.',
        seo: { title: 'Home | Qubits', description: 'Startseite' } 
      },
      { 
        slug: 'contact', 
        collection: 'static_pages', 
        title: 'Kontakt',
        content: 'Kontaktieren Sie uns.',
        seo: { title: 'Kontakt | Qubits', description: 'Kontaktseite' }
      },
      { 
        slug: 'imprint', 
        collection: 'static_pages', 
        title: 'Impressum',
        content: 'Rechtliches.',
        seo: { title: 'Impressum | Qubits', description: 'Impressum' }
      },
      { 
        slug: 'privacy', 
        collection: 'static_pages', 
        title: 'Datenschutz',
        content: 'Datenschutz.',
        seo: { title: 'Datenschutz | Qubits', description: 'Datenschutz' }
      },
      { 
        slug: 'terms', 
        collection: 'static_pages', 
        title: 'AGB',
        content: 'Allgemeine Geschäftsbedingungen.',
        seo: { title: 'AGB | Qubits', description: 'AGB' }
      }
    ];

    for (const page of staticPages) {
      if (page.collection) {
        await db.collection(page.collection).doc(page.slug).set(page);
        console.log(`   - Seeded ${page.collection}/${page.slug}`);
      }
    }

    // --- DYNAMIC CONTENT: BLOG ---
    const blogPosts = [
      { slug: 'seo-guide-2026', title: 'SEO Guide 2026', content: 'Warum SEO wichtig ist...', seo: { title: 'SEO Guide 2026', description: 'SEO Tipps' } },
      { slug: 'nx-monorepo-setup', title: 'Nx Monorepo Setup', content: 'Wie man Nx aufsetzt...', seo: { title: 'Nx Setup', description: 'Nx Tutorial' } },
      { slug: 'firebase-hosting', title: 'Firebase Hosting', content: 'Hosting leicht gemacht...', seo: { title: 'Firebase Hosting', description: 'Hosting Guide' } }
    ];

    for (const post of blogPosts) {
      // Structure: dynamic_pages (col) -> blog (doc) -> posts (subcol) -> [slug] (doc)
      await db.collection('dynamic_pages').doc('blog').collection('posts').doc(post.slug).set(post);
      console.log(`   - Seeded dynamic_pages/blog/posts/${post.slug}`);
    }

    // --- DYNAMIC CONTENT: PRODUCTS ---
    const products = [
      { slug: 'web-development', title: 'Web Entwicklung', content: 'Professionelle Webseiten...', seo: { title: 'Webdev', description: 'Webentwicklung' } },
      { slug: 'process-automation', title: 'Prozessautomatisierung', content: 'Sparen Sie Zeit...', seo: { title: 'Automatisierung', description: 'Automation' } },
      { slug: 'marketing-analytics', title: 'Marketing Analytics', content: 'Daten verstehen...', seo: { title: 'Analytics', description: 'Marketing Daten' } }
    ];

    for (const product of products) {
      // Structure: dynamic_pages (col) -> products (doc) -> items (subcol) -> [slug] (doc)
      await db.collection('dynamic_pages').doc('products').collection('items').doc(product.slug).set(product);
      console.log(`   - Seeded dynamic_pages/products/items/${product.slug}`);
    }




    console.log('\n✅ CMS Seeding (Admin) successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed().catch(console.error);
