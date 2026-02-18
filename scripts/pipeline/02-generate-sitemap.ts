import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

/**
 * PIPELINE STEP 02: Sitemap & Robots Generation (Admin SDK Version)
 * Responsibility: Sitemap and robots.txt generation.
 * Now uses Admin SDK to ensure reliable data fetching.
 */

// Logging setup
const rootDir = path.resolve(__dirname, '../..');
const logFile = path.resolve(rootDir, 'debug/sitemap.log');
const debugDir = path.dirname(logFile);
if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });

function log(msg: string) {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
}

interface RouteConfig {
  path: string;
  type: 'static' | 'dynamic';
  collection?: string;
}

export async function getRoutes(): Promise<string[]> {
  if (fs.existsSync(logFile)) fs.unlinkSync(logFile); // Clear old log
  log('🚀 Starting Sitemap Generation / Route Fetching...\n');

  const envPath = path.join(rootDir, '.env');
  dotenv.config({ path: envPath });

  // 1. Initialize Admin SDK
  let serviceAccount;
  const envJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  
  if (envJson) {
    try {
        const cleanJson = envJson.trim().replace(/^'|'$/g, '');
        serviceAccount = JSON.parse(cleanJson);
    } catch (e) { log(`⚠️ Error parsing JSON credentials: ${e}`); }
  }

  if (!serviceAccount) {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 
                               path.join(rootDir, 'firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    }
  }

  if (!serviceAccount && !process.env.FIREBASE_TOKEN) {
    log('❌ No Admin Credentials found (JSON or File). Cannot fetch dynamic routes.');
    // Fallback: continue without admin, might fail validation later
  } else {
    if (!admin.apps.length) {
      if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
      } else {
        // Fallback for environments where GOOGLE_APPLICATION_CREDENTIALS is auto-detected
        admin.initializeApp();
      }
    }
  }

  // Get Firestore instance (safely)
  let db;
  try {
    db = admin.firestore();
  } catch (e) {
    log(`⚠️ could not init firestore: ${e}`);
  }

  // Route Config (Mirrored)
  const appRoutesConfig: RouteConfig[] = [
    { path: '/', type: 'static', collection: 'static_pages/home' },
    { path: '/kontakt', type: 'static', collection: 'static_pages/contact' },
    { path: '/impressum', type: 'static', collection: 'static_pages/imprint' },
    { path: '/datenschutz', type: 'static', collection: 'static_pages/privacy' },
    { path: '/agb', type: 'static', collection: 'static_pages/terms' },
    // Dynamic Pages
    { path: '/blog/:slug', type: 'dynamic', collection: 'dynamic_pages/blog/posts' },
    { path: '/produkte/:slug', type: 'dynamic', collection: 'dynamic_pages/products/items' }
  ];

  const routes: string[] = [];

  try {
    for (const route of appRoutesConfig) {
      if (route.type === 'static') {
        routes.push(route.path);
        log(`   + Static: ${route.path}`);
      } 
      else if (route.type === 'dynamic' && route.collection && db) {
        log(`   🔍 Fetching dynamic routes from: ${route.collection}`);
        try {
          // Admin SDK: Logic depends on if it's a root collection or subcollection
          // collection() works for both absolute paths in Admin SDK usually, but let's be safe.
          // For 'dynamic_pages/blog/posts', it is a sub-collection.
          // db.collection() takes a path.
          
          // Note: In Admin SDK, we can just use the path string.
          const querySnapshot = await db.collection(route.collection).get();
          
          if (querySnapshot.empty) {
            log(`   ⚠️ Collection ${route.collection} is empty!`);
          }

          querySnapshot.forEach((doc: any) => {
            const data = doc.data();
            const slug = data.slug || doc.id;
            const realPath = route.path.replace(/:[a-zA-Z0-9]+/, slug);
            routes.push(realPath);
            log(`   + Dynamic: ${realPath}`);
          });
        } catch (err) {
            log(`   ❌ Error fetching ${route.collection}: ${err}`);
        }
      }
    }
  } catch (e) {
    log(`❌ Fatal Error during route fetching: ${e}`);
  }
  
  return routes;
}


async function generate() {
  log('🔍 Generating Sitemap files based on fetched routes...\n');

  const routes = await getRoutes();
  const rootDir = path.resolve(__dirname, '../..');
  const envpath = path.join(rootDir, '.env');
  dotenv.config({ path: envpath });
  
  const env = process.env as Record<string, string>;
  const projectUrl = env.VITE_PROJECT_URL || 'https://deine-agentur.de';
  const distPath = path.join(rootDir, 'apps/company-website/dist');

  // 3. Generate sitemap.xml
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url>
    <loc>${projectUrl}${r}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`).join('\n')}
</urlset>`;

  // 4. Generate robots.txt
  const robots = `User-agent: *
Allow: /

Sitemap: ${projectUrl}/sitemap.xml`;

  // Write files
  const publicPath = path.join(rootDir, 'apps/company-website/public');
  if (!fs.existsSync(publicPath)) fs.mkdirSync(publicPath, { recursive: true });
  
  fs.writeFileSync(path.join(publicPath, 'sitemap.xml'), sitemap);
  fs.writeFileSync(path.join(publicPath, 'robots.txt'), robots);
  log(`✅ Written to public/: sitemap.xml, robots.txt`);
  
  // Also write to dist if it exists
  if (fs.existsSync(distPath)) {
    fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemap);
    fs.writeFileSync(path.join(distPath, 'robots.txt'), robots);
    log(`✅ Written to dist/: sitemap.xml, robots.txt`);
  }

  const staticCount = routes.filter(r => !r.includes('/blog/') && !r.includes('/produkte/')).length;
  const dynamicCount = routes.length - staticCount;

  console.log('\n✨ SUMMARY: Sitemap Generation PASSED');
  console.log(`   - Routes Found: ${routes.length} (Static: ${staticCount}, Dynamic: ${dynamicCount})`);
  console.log(`   - Files:        sitemap.xml, robots.txt`);
  console.log(`   - Output Dir:   public/ & dist/`);
}

if (require.main === module) {
  generate().catch(e => {
    console.error(e);
    log(`❌ Crash: ${e}`);
  });
}
