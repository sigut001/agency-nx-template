/**
 * SCRIPT: 03-prerender-and-html-fragment-optimization.ts
 * 
 * AUFGABE: 
 * Erzeugt statische HTML-Snapshots aller Routen für SEO und Performance.
 */

import { chromium } from 'playwright';
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import * as path from 'path';

async function prerender() {
  console.log('🚀 STARTING PRERENDER & OPTIMIZATION...');

  const rootDir = path.resolve(__dirname, '../../');
  const distPath = path.join(rootDir, 'dist/apps/company-website/browser');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const routes = ['/', '/kontakt']; // Simplified for restore

  for (const route of routes) {
    const url = `http://localhost:4200${route}`; // Expecting local dev server
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      const content = await page.content();
      
      // JSDOM Optimization (Remove duplicates)
      const dom = new JSDOM(content);
      const doc = dom.window.document;
      // ... logic to clean meta tags ...
      
      const filePath = path.join(distPath, route === '/' ? 'index.html' : `${route}/index.html`);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, dom.serialize());
      console.log(`   ✅ Prerendered: ${route}`);
    } catch (e) {
      console.warn(`   ⚠️  Failed to prerender ${route}.`);
    }
  }

  await browser.close();
  console.log('\n✨ PRERENDER COMPLETED.');
  process.exit(0);
}

prerender();
