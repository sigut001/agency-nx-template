/**
 * SCRIPT: 01-post-deploy-asset-verification.ts
 * 
 * AUFGABE: 
 * Endkontrolle nach dem Build/Deploy. Prüft die Existenz und den Inhalt kritischer Dateien im dist-Ordner.
 */

import * as fs from 'fs';
import * as path from 'path';

function verifyAssets() {
  console.log('🏁 STARTING POST-DEPLOY ASSET VERIFICATION...');

  const rootDir = path.resolve(__dirname, '../../');
  const distPath = path.join(rootDir, 'dist/apps/company-website/browser');

  const criticalFiles = [
    { name: 'index.html', search: '<title>' },
    { name: 'sitemap.xml', search: 'urlset' },
    { name: 'robots.txt', search: 'User-agent' },
    { name: 'LICENSE', search: 'Copyright' }
  ];

  let hasError = false;

  criticalFiles.forEach(file => {
    const filePath = path.join(distPath, file.name);
    console.log(`   🔎 Checking: ${file.name}`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`      ❌ MISSING: ${file.name} was not found in dist.`);
      hasError = true;
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes(file.search)) {
      console.error(`      ❌ INVALID: ${file.name} exists but content seems wrong (Missing: "${file.search}").`);
      hasError = true;
    } else {
      console.log(`      ✅ Valid: Structure confirmed.`);
    }
  });

  if (hasError) {
    console.error('\n❌ POST-DEPLOY VERIFICATION FAILED.');
    process.exit(1);
  }

  console.log('\n✨ ALL ASSETS VERIFIED SUCCESSFULLY.');
  process.exit(0);
}

verifyAssets();
