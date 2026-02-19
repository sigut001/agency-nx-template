/**
 * SCRIPT: 04-build-and-test-deploy_b1-firebase-test-deploy-and-validate.ts
 * 
 * AUFGABE: 
 * 1. Deployt den dist-Ordner auf einen Firebase Preview Channel (TTL 1h).
 * 2. Speichert die Preview-URL in temp/artifacts/preview-url.txt.
 * 3. Validiert funktional:
 *    - Erreichbarkeit aller Routen.
 *    - Bot-Check: SEO-Tags im statischen HTML (ohne JS).
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';

const rootDir = path.resolve(__dirname, '../../');
const sitemapPath = path.join(rootDir, 'temp/artifacts/sitemap.xml');
const urlFilePath = path.join(rootDir, 'temp/artifacts/preview-url.txt');

async function getRoutesFromSitemap(): Promise<string[]> {
  if (!fs.existsSync(sitemapPath)) {
    throw new Error('Sitemap not found in temp/artifacts/. Run v2:prep first.');
  }
  const content = fs.readFileSync(sitemapPath, 'utf8');
  const locs = content.match(/<loc>(.*?)<\/loc>/g) || [];
  return locs.map(l => {
    const url = l.replace('<loc>', '').replace('</loc>', '');
    return new URL(url).pathname;
  });
}

async function start() {
  console.log('🚀 Starting Firebase Test Deployment & Functional Validation...\n');

  // 1. Firebase Preview Deploy
  console.log('   📦 Deploying to Firebase Hosting Preview Channel...');
  let previewUrl = '';
  try {
    const deployOutput = execSync('firebase hosting:channel:deploy preview-validation --expires 1h --json', { 
      cwd: rootDir,
      encoding: 'utf8',
      env: { ...process.env, FIREBASE_TOKEN: process.env.FIREBASE_TOKEN }
    });
    
    console.log('DEBUG: Raw Firebase Output:', deployOutput);

    interface FirebaseResult {
      result: {
        [key: string]: {
          url: string;
        }
      }
    }
    const json = JSON.parse(deployOutput) as FirebaseResult;
    const resultValues = Object.values(json.result);
    if (resultValues.length > 0) {
      previewUrl = resultValues[0].url;
    }

    if (!previewUrl) {
      throw new Error('Could not find url in Firebase response.');
    }

    console.log(`   ✅ Preview URL: ${previewUrl}`);
    fs.writeFileSync(urlFilePath, previewUrl);
  } catch (err) {
    console.error('❌ Firebase Deployment FAILED:', err);
    process.exit(1);
  }

  // 2. Functional Validation
  console.log('\n🔍 Starting Functional Validation (Bot-Check)...');
  const routes = await getRoutesFromSitemap();
  let totalErrors = 0;

  for (const route of routes) {
    const url = `${previewUrl}${route}`;
    console.log(`  📄 Checking ${route}...`);
    
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'Googlebot/2.1' } });
      if (!response.ok) {
        console.error(`    ❌ HTTP Error: ${response.status}`);
        totalErrors++;
        continue;
      }

      const html = await response.text();
      const dom = new JSDOM(html);
      const doc = dom.window.document;

      // Bot-Check: Tags must exist in the static response
      const title = doc.querySelector('title')?.textContent;
      const description = doc.querySelector('meta[name="description"]')?.getAttribute('content');
      
      if (!title) {
        console.error('    ❌ Missing <title> in static HTML source');
        totalErrors++;
      }
      if (!description) {
        console.error('    ❌ Missing meta description in static HTML source');
        totalErrors++;
      }

      const hasPrerenderMark = html.includes('id="root"'); // Basic check if root is present
      if (!hasPrerenderMark) {
        console.error('    ❌ Root element missing in static HTML source');
        totalErrors++;
      } else {
        console.log(`    ✅ Title: "${title}"`);
        console.log('    ✅ Static SEO Content verified.');
      }

    } catch (e) {
      console.error(`    ❌ Error fetching ${route}:`, e);
      totalErrors++;
    }
  }

  if (totalErrors > 0) {
    console.error(`\n❌ Validation FAILED: ${totalErrors} functional errors found on Test-Deployment.`);
    process.exit(1);
  } else {
    console.log('\n✨ Functional Validation PASSED. Deployment is ready for Performance Audits.');
    process.exit(0);
  }
}

start().catch(err => {
  console.error('❌ Validation crashed:', err);
  process.exit(1);
});
