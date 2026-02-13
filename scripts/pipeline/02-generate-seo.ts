import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

/**
 * PIPELINE STEP 02: SEO Generation
 * Responsibility: Sitemap and robots.txt generation.
 */

export async function getRoutes(): Promise<string[]> {
  const rootDir = path.resolve(__dirname, '../..');
  const envPath = path.join(rootDir, '.env');

  dotenv.config({ path: envPath });
  const env = process.env as Record<string, string>;

  const routes = ['/', '/kontakt', '/impressum', '/datenschutz', '/agb'];

  try {
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
    const querySnapshot = await getDocs(collection(db, 'pages'));
    
    querySnapshot.forEach((doc) => {
      const slug = doc.data().slug;
      if (slug && !routes.includes(`/${slug}`)) {
        routes.push(`/${slug}`);
      }
    });
  } catch (e) {
    console.warn('⚠️ Could not fetch dynamic routes from Firebase:', e);
  }
  return routes;
}

async function generate() {
  console.log('🔍 Generating SEO files...\n');

  const routes = await getRoutes();
  const rootDir = path.resolve(__dirname, '../..');
  const envPath = path.join(rootDir, '.env');
  
  dotenv.config({ path: envPath });
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
  
  // Also write to dist if it exists
  if (fs.existsSync(distPath)) {
    fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemap);
    fs.writeFileSync(path.join(distPath, 'robots.txt'), robots);
  }

  console.log('✅ SEO files generated successfully!');
}

if (require.main === module || !require.main) {
  generate().catch(console.error);
}
