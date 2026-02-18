/**
 * SCRIPT: 03-deployment_a1-generate-sitemap.ts
 * 
 * AUFGABE: 
 * Erzeugt sitemap.xml und robots.txt basierend auf statischen und dynamischen Routen.
 * Speichert Ergebnisse in temp/artifacts/ zur späteren Injektion.
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

const rootDir = path.resolve(__dirname, '../../');
const artifactDir = path.join(rootDir, 'temp/artifacts');
if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

interface RouteConfig {
  path: string;
  type: 'static' | 'dynamic';
  collection?: string;
}

// Reconstructed ServiceAccount for Firebase Admin (using new flattened env vars)
const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

async function getRoutes(): Promise<string[]> {
  console.log('🚀 Starting Sitemap Generation / Route Fetching...\n');
  dotenv.config({ path: path.join(rootDir, '.env') });

  // 1. Initialize Admin SDK
  if (!admin.apps.length) {
    if (serviceAccount.projectId && serviceAccount.privateKey && serviceAccount.clientEmail) {
      console.log('   🔐 Using individual FIREBASE_ADMIN_* credentials');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      console.log('   🔐 Falling back to default credentials setup');
      admin.initializeApp();
    }
  }

  const db = admin.firestore();

  const appRoutesConfig: RouteConfig[] = [
    { path: '/', type: 'static', collection: 'static_pages/home' },
    { path: '/kontakt', type: 'static', collection: 'static_pages/contact' },
    { path: '/impressum', type: 'static', collection: 'static_pages/imprint' },
    { path: '/datenschutz', type: 'static', collection: 'static_pages/privacy' },
    { path: '/agb', type: 'static', collection: 'static_pages/terms' },
    { path: '/blog/:slug', type: 'dynamic', collection: 'dynamic_pages/blog/posts' },
    { path: '/produkte/:slug', type: 'dynamic', collection: 'dynamic_pages/products/items' }
  ];

  const routes: string[] = [];

  for (const route of appRoutesConfig) {
    if (route.type === 'static') {
      routes.push(route.path);
      console.log(`   + Static: ${route.path}`);
    } 
    else if (route.type === 'dynamic' && route.collection) {
      console.log(`   🔍 Fetching dynamic routes from: ${route.collection}`);
      const querySnapshot = await db.collection(route.collection).get();
      querySnapshot.forEach((doc: any) => {
        const data = doc.data();
        const slug = data.slug || doc.id;
        const realPath = route.path.replace(/:[a-zA-Z0-9]+/, slug);
        routes.push(realPath);
        console.log(`   + Dynamic: ${realPath}`);
      });
    }
  }
  return routes;
}

async function generate() {
  const routes = await getRoutes();
  const projectUrl = process.env.VITE_PROJECT_URL || 'https://qubits-digital.de';

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url>
    <loc>${projectUrl}${r}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`).join('\n')}
</urlset>`;

  const robots = `User-agent: *
Allow: /

Sitemap: ${projectUrl}/sitemap.xml`;

  fs.writeFileSync(path.join(artifactDir, 'sitemap.xml'), sitemap);
  fs.writeFileSync(path.join(artifactDir, 'robots.txt'), robots);
  
  console.log(`\n✅ Written to temp/artifacts/: sitemap.xml, robots.txt`);
  console.log(`✨ Routes Found: ${routes.length}`);
}

generate().catch(err => {
  console.error('❌ Sitemap Generation FAILED:', err);
  process.exit(1);
});
