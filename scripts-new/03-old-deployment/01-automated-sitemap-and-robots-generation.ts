/**
 * SCRIPT: 01-automated-sitemap-and-robots-generation.ts
 * 
 * AUFGABE: 
 * Erzeugt dynamisch die sitemap.xml und robots.txt im 'public'-Ordner.
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Reconstructed ServiceAccount for Firebase Admin
const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

async function generateAssets() {
  console.log('🗺️  GENERATING SITEMAP & ROBOTS.TXT...');

  const rootDir = path.resolve(__dirname, '../../');
  dotenv.config({ path: path.join(rootDir, '.env') });
  if (!admin.apps.length) {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || path.join(rootDir, 'firebase-service-account.json');
    let credential;

    if (serviceAccount.projectId && serviceAccount.privateKey && serviceAccount.clientEmail) {
      console.log('   🔐 Using individual FIREBASE_ADMIN_* credentials');
      credential = admin.credential.cert(serviceAccount);
    } else if (fs.existsSync(serviceAccountPath)) {
      console.log(`   🔐 Using credentials from file: ${serviceAccountPath}`);
      credential = admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')));
    } else {
      console.error('❌ Error: No Firebase credentials found (individual env variables or file).');
      process.exit(1);
    }
    admin.initializeApp({ credential });
  }
  const db = admin.firestore();

  const baseUrl = process.env.VITE_PROJECT_URL || 'https://qubits-digital.de';
  const routes = ['/'];

  try {
    const blogPosts = await db.collection('dynamic_pages').doc('blog').collection('posts').get();
    blogPosts.docs.forEach(doc => routes.push(`/blog/${doc.data().slug}`));
    
    // Generate Sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(r => `  <url><loc>${baseUrl}${r}</loc></url>`).join('\n')}\n</urlset>`;
    fs.writeFileSync(path.join(rootDir, 'apps/company-website/public/sitemap.xml'), sitemap);
    console.log('   ✅ sitemap.xml generated.');

    // Generate Robots
    const robots = `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml`;
    fs.writeFileSync(path.join(rootDir, 'apps/company-website/public/robots.txt'), robots);
    console.log('   ✅ robots.txt generated.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

generateAssets();
