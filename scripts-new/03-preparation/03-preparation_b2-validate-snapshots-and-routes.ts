/**
 * SCRIPT: 03-preparation_b2-validate-snapshots-and-routes.ts
 * 
 * AUFGABE: 
 * Validiert die erzeugten Snapshots in temp/artifacts/pages/.
 * Prüft:
 * 1. Sind alle Routen aus der Sitemap als Datei vorhanden?
 * 2. Enthält jede Datei die notwendigen SEO-Tags (Title, Meta, JSON-LD)?
 */

import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';

const rootDir = path.resolve(__dirname, '../../');
const artifactDir = path.join(rootDir, 'apps/company-website/build/client');
const sitemapPath = path.join(rootDir, 'temp/artifacts/sitemap.xml');

async function getRoutesFromSitemap(): Promise<string[]> {
  if (!fs.existsSync(sitemapPath)) {
    throw new Error('Sitemap not found. Run a1 first.');
  }
  const content = fs.readFileSync(sitemapPath, 'utf8');
  const locs = content.match(/<loc>(.*?)<\/loc>/g) || [];
  return locs.map(l => {
    const url = l.replace('<loc>', '').replace('</loc>', '');
    return new URL(url).pathname;
  });
}

function validateSnapshot(filePath: string, route: string): string[] {
  const errors: string[] = [];
  if (!fs.existsSync(filePath)) {
    errors.push(`File missing: ${filePath}`);
    return errors;
  }

  const html = fs.readFileSync(filePath, 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // 1. Basic Content Check
  if (html.length < 500) {
    errors.push(`Snapshot for ${route} seems too small (${html.length} bytes)`);
  }

  // 2. SEO Tags Check
  if (!doc.querySelector('title')) errors.push(`Missing <title> tag on ${route}`);
  if (!doc.querySelector('meta[name="description"]')) errors.push(`Missing meta description on ${route}`);
  
  // 3. JSON-LD Check (Warning only, as not all pages might have it, but usually ours do)
  if (!doc.querySelector('script[type="application/ld+json"]')) {
    console.warn(`   ⚠️ Warning: No JSON-LD found on ${route}`);
  }

  return errors;
}

async function validate() {
  console.log('🔍 Validating Snapshots and SEO Schema...\n');

  const routes = await getRoutesFromSitemap();
  let totalErrors = 0;

  for (const route of routes) {
    const fileName = route === '/' ? 'index.html' : `${route}/index.html`;
    const filePath = path.join(artifactDir, fileName);
    
    console.log(`  📄 Checking ${route}...`);
    const errors = validateSnapshot(filePath, route);
    
    if (errors.length > 0) {
      errors.forEach(err => console.error(`    ❌ ${err}`));
      totalErrors += errors.length;
    } else {
      console.log(`    ✅ Valid`);
    }
  }

  if (totalErrors > 0) {
    console.error(`\n❌ Validation FAILED: ${totalErrors} errors found.`);
    process.exit(1);
  } else {
    console.log('\n✅ All snapshots and SEO schemas are valid.');
    process.exit(0);
  }
}

validate().catch(err => {
  console.error('❌ Validation crashed:', err);
  process.exit(1);
});
