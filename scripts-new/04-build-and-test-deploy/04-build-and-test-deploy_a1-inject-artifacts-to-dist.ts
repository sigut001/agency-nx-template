/**
 * SCRIPT: 04-build-and-test-deploy_a1-inject-artifacts-to-dist.ts
 * 
 * AUFGABE: 
 * Kopiert zusätzliche Metadaten (Sitemap, Robots.txt) 
 * sowie Infrastruktur-Files (404.html) in den fertigen dist-Ordner.
 */

import * as fs from 'fs';
import * as path from 'path';
import { LogService } from '../utils/log-service';

const rootDir = path.resolve(__dirname, '../../');
const artifactDir = path.join(rootDir, 'temp/artifacts');
const distDir = path.join(rootDir, 'apps/company-website/build/client');

async function inject() {
  LogService.init('DEPLOY', 'INJECTION');
  console.log('💉 Injecting static artifacts into RR7 build/client folder...\n');

  if (!fs.existsSync(distDir)) {
    console.error(`❌ Injection FAILED: Build folder not found at ${distDir}. Run nx build first.`);
    process.exit(1);
  }
  if (!fs.existsSync(artifactDir)) {
    console.warn('⚠️  Warning: temp/artifacts/ not found. Sitemap/Robots might be missing.');
  }

  // 1. Copy Sitemap and Robots
  const topLevelFiles = ['sitemap.xml', 'robots.txt'];
  topLevelFiles.forEach(file => {
    const src = path.join(artifactDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(distDir, file));
      console.log(`   + Copied: ${file}`);
    } else {
      console.warn(`   ⚠️ Missing: ${file}`);
    }
  });

  // 2. Firebase Hosting 404 Mapping
  // RR7 builds/prerenders /404 into 404/index.html. Firebase expects 404.html in the root.
  const src404 = path.join(distDir, '404/index.html');
  const dest404 = path.join(distDir, '404.html');

  if (fs.existsSync(src404)) {
    fs.copyFileSync(src404, dest404);
    console.log('   ✅ Infrastructure: 404.html generated from RR7 snapshot (404/index.html).');
  } else {
    console.warn('   ⚠️ Warning: No 404 snapshot found at 404/index.html to map to 404.html.');
  }

  console.log('\n✨ Injection complete. Build folder is now fully optimized (RR7 SSG + Global SEO).');
}

inject().catch(err => {
  console.error('❌ Injection crashed:', err);
  process.exit(1);
});
