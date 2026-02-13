import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

/**
 * SEO Generator Script
 * Generates sitemap.xml and robots.txt based on static routes and Firestore content.
 */

export async function getRoutes(): Promise<string[]> {
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

  const projectUrl = env.VITE_PROJECT_URL || 'https://deine-agentur.de';
  const distPath = path.resolve(__dirname, '../apps/company-website/dist');

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
  const publicPath = path.resolve(__dirname, '../apps/company-website/public');
  fs.writeFileSync(path.join(publicPath, 'sitemap.xml'), sitemap);
  fs.writeFileSync(path.join(publicPath, 'robots.txt'), robots);
  
  // Also write to dist if it exists (for post-build manual run)
  if (fs.existsSync(distPath)) {
    fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemap);
    fs.writeFileSync(path.join(distPath, 'robots.txt'), robots);
  }

  console.log('✅ SEO files generated successfully!');
}

if (require.main === module || !require.main) {
  generate().catch(console.error);
}
