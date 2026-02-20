/**
 * SCRIPT: 03-preparation_a1-generate-sitemap.ts
 * 
 * AUFGABE: 
 * Erzeugt sitemap.xml und robots.txt basierend auf statischen und dynamischen Routen.
 * Speichert Ergebnisse in temp/artifacts/ zur späteren Injektion.
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { LogService } from '../utils/log-service';

const rootDir = path.resolve(__dirname, '../../');
const artifactDir = path.join(rootDir, 'temp/artifacts');
if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

interface RouteConfig {
  path: string;
  type: 'static' | 'dynamic';
  collection?: string;
}

// Reconstructed ServiceAccount for Firebase Admin (using new flattened env vars)
async function getRoutes(): Promise<string[]> {
  LogService.init('PREP', 'SITEMAP');
  console.log('🚀 Starting Sitemap Generation / Route Fetching...\n');
  dotenv.config({ path: path.join(rootDir, '.env') });

  // 1. Initialize Admin SDK
  const serviceAccount: admin.ServiceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  };

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
  
  // Directly use the config object (tsx allows importing TS files)
  // Directly use the config object (tsx allows importing TS files)
  const { PUBLIC_ROUTES_CONFIG } = await import('../../apps/company-website/src/app/app.routes.config');
  
  // Helper for nested path resolution (parallel to 02-validation_g1)
  const resolveDoc = async (db: admin.firestore.Firestore, path: string) => {
    const parts = path.split('/');
    let ref: any = db;
    for (let i = 0; i < parts.length; i++) {
        ref = i % 2 === 0 ? ref.collection(parts[i]) : ref.doc(parts[i]);
    }
    return ref; // returns CollectionReference or DocumentReference
  };
  
  const staticRows = PUBLIC_ROUTES_CONFIG.filter(r => r.type === 'static');
  const dynamicRows = PUBLIC_ROUTES_CONFIG.filter(r => r.type === 'dynamic');

  const routes: string[] = [];

  for (const row of staticRows) {
    const pathVal = row.path;
    routes.push(pathVal);
    console.log(`   + Static: ${pathVal}`);
  }

  for (const row of dynamicRows) {
    const { path: pathTemplate, collection: colRef } = row;
    if (!colRef) continue;
    
    const parts = colRef.split('/');
    
    console.log(`   🔍 Fetching dynamic routes from: ${colRef}`);
    
    // Resolve collection robustly
    const colInstance = await resolveDoc(db, colRef);
    if (!(colInstance instanceof admin.firestore.CollectionReference)) {
        console.error(`      ❌ Error: "${colRef}" is not a collection path.`);
        continue;
    }
    
    const querySnapshot = await colInstance.get();
    
    querySnapshot.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
      const data = doc.data();
      const slug = data.slug || doc.id;
      const realPath = pathTemplate.replace(/:[a-zA-Z0-9]+/, slug);
      routes.push(realPath);
      console.log(`   + Dynamic: ${realPath}`);
    });
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
