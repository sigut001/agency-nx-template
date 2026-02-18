/**
 * SCRIPT: 04-build-and-test-deploy_a1-inject-artifacts-to-dist.ts
 * 
 * AUFGABE: 
 * Kopiert die vorbereiteten Artefakte (Sitemap, Snapshots) 
 * aus temp/artifacts/ in den fertigen dist-Ordner.
 */

import * as fs from 'fs';
import * as path from 'path';

const rootDir = path.resolve(__dirname, '../../');
const artifactDir = path.join(rootDir, 'temp/artifacts');
const distDir = path.join(rootDir, 'apps/company-website/dist');

function copyRecursiveSync(src: string, dest: string) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function inject() {
  console.log('💉 Injecting static artifacts into dist folder...\n');

  if (!fs.existsSync(distDir)) {
    console.error('❌ Injection FAILED: dist folder not found. Run nx build first.');
    process.exit(1);
  }
  if (!fs.existsSync(artifactDir)) {
    console.error('❌ Injection FAILED: temp/artifacts/ not found. Run v2:prep first.');
    process.exit(1);
  }

  // Copy sitemap and robots
  const topLevelFiles = ['sitemap.xml', 'robots.txt'];
  topLevelFiles.forEach(file => {
    const src = path.join(artifactDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(distDir, file));
      console.log(`   + Copied: ${file}`);
    }
  });

  // Copy snapshots (pages)
  const pagesDir = path.join(artifactDir, 'pages');
  if (fs.existsSync(pagesDir)) {
    console.log('   📂 Injecting HTML snapshots (SSG)...');
    copyRecursiveSync(pagesDir, distDir);
    
    // Firebase Hosting: Move 404/index.html to 404.html in root
    const src404 = path.join(distDir, '404/index.html');
    if (fs.existsSync(src404)) {
      fs.copyFileSync(src404, path.join(distDir, '404.html'));
      console.log('   ✅ Infrastructure: 404.html generated from snapshot.');
    }
    
    console.log('   ✅ Snapshots injected.');
  }

  console.log('\n✨ Injection complete. Dist folder is now fully optimized (SPA + SSG).');
}

inject().catch(err => {
  console.error('❌ Injection crashed:', err);
  process.exit(1);
});
