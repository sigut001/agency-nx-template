/**
 * SCRIPT: 03-preparation_a2-validate-sitemap-schema.ts
 * 
 * AUFGABE: 
 * Validiert die erzeugte sitemap.xml in temp/artifacts/.
 * Prüft auf XML-Konformität und Vorhandensein der Datei.
 */

import * as fs from 'fs';
import * as path from 'path';

const rootDir = path.resolve(__dirname, '../../');
const sitemapPath = path.join(rootDir, 'temp/artifacts/sitemap.xml');
const robotsPath = path.join(rootDir, 'temp/artifacts/robots.txt');

async function validate() {
  console.log('🔍 Validating Sitemap & Robots artifacts...\n');

  // 1. Check existence
  if (!fs.existsSync(sitemapPath)) {
    console.error('❌ Sitemap Validation FAILED: sitemap.xml not found in temp/artifacts/');
    process.exit(1);
  }
  if (!fs.existsSync(robotsPath)) {
    console.error('❌ Sitemap Validation FAILED: robots.txt not found in temp/artifacts/');
    process.exit(1);
  }

  // 2. Simple XML Structure Check
  const content = fs.readFileSync(sitemapPath, 'utf8');
  if (!content.includes('<?xml') || !content.includes('<urlset') || !content.includes('</urlset>')) {
    console.error('❌ Sitemap Validation FAILED: Invalid XML structure');
    process.exit(1);
  }

  // 3. Robots.txt basic check
  const robotsContent = fs.readFileSync(robotsPath, 'utf8');
  if (!robotsContent.includes('User-agent:') || !robotsContent.includes('Sitemap:')) {
    console.error('❌ Sitemap Validation FAILED: robots.txt structure invalid');
    process.exit(1);
  }

  console.log('✅ Sitemap & Robots artifacts are functionally valid.');
  process.exit(0);
}

validate().catch(err => {
  console.error('❌ Validation crashed:', err);
  process.exit(1);
});
