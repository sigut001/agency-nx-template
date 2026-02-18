/**
 * SCRIPT: 03-preparation_b1-prerender-and-cleanup.ts
 * 
 * AUFGABE: 
 * Lädt alle Routen der Sitemap gegen localhost:4200 (startet Server falls nötig),
 * erzeugt Snapshots und bereinigt diese (Smart Cleanup) für saubere Hydration.
 * Speichert Ergebnisse in temp/artifacts/pages/.
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';
import * as dotenv from 'dotenv';
import { spawn, ChildProcess, execSync } from 'child_process';

const rootDir = path.resolve(__dirname, '../../');
const artifactDir = path.join(rootDir, 'temp/artifacts/pages');
const sitemapPath = path.join(rootDir, 'temp/artifacts/sitemap.xml');

// Tags that must be UNIQUE (Singleton)
const SINGLETON_SELECTORS = [
  'title',
  'meta[name="description"]',
  'link[rel="canonical"]',
  'meta[property="og:title"]',
  'meta[property="og:description"]',
  'meta[property="og:type"]',
  'meta[property="og:site_name"]',
  'meta[name="twitter:card"]',
  'meta[name="twitter:title"]',
  'meta[name="twitter:description"]'
];

// Tags that are allowed MULTIPLE times (Arrays), but exact duplicates should be removed
const ARRAY_SELECTORS = [
  'meta[property="og:image"]',
  'meta[property="article:tag"]'
];

async function waitForServer(url: string, timeout = 30000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch { /* ignore */ }
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

async function startLocalServer(port: number): Promise<ChildProcess> {
  console.log('   🏗️  Building application for production...');
  execSync('npx nx build @temp-nx/company-website', { cwd: rootDir, stdio: 'inherit' });

  console.log(`   🚀 Starting preview server on port ${port}...`);
  // Using vite preview to serve the dist folder
  return spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
    cwd: path.join(rootDir, 'apps/company-website'),
    shell: true,
    stdio: 'ignore'
  });
}

async function getRoutesFromSitemap(): Promise<string[]> {
  if (!fs.existsSync(sitemapPath)) {
    throw new Error('Sitemap not found in temp/artifacts/. Run a1 first.');
  }
  const content = fs.readFileSync(sitemapPath, 'utf8');
  const locs = content.match(/<loc>(.*?)<\/loc>/g) || [];
  const routes = locs.map(l => {
    const url = l.replace('<loc>', '').replace('</loc>', '');
    const path = new URL(url).pathname;
    return path;
  });
  
  // Add infrastructure routes that aren't in the sitemap
  if (!routes.includes('/404')) routes.push('/404');
  
  return routes;
}

function cleanupHtml(html: string): string {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  SINGLETON_SELECTORS.forEach(selector => {
    const elements = Array.from(document.querySelectorAll(selector));
    if (elements.length > 1) {
      for (let i = 0; i < elements.length - 1; i++) {
        elements[i].remove();
      }
    }
  });

  ARRAY_SELECTORS.forEach(selector => {
    const elements = Array.from(document.querySelectorAll(selector));
    const seenContent = new Set<string>();
    elements.forEach(el => {
      const content = el.getAttribute('content') || el.getAttribute('href') || '';
      if (seenContent.has(content)) {
        el.remove();
      } else {
        seenContent.add(content);
      }
    });
  });

  return dom.serialize();
}

async function start() {
  console.log('🚀 Starting Prerender & Cleanup Stage...\n');
  dotenv.config({ path: path.join(rootDir, '.env') });

  const routes = await getRoutesFromSitemap();
  const port = 4200;
  const baseUrl = `http://localhost:${port}`;

  // 1. Ensure Server is running
  let serverProcess: ChildProcess | null = null;
  const isRunning = await waitForServer(baseUrl, 2000);
  
  if (!isRunning) {
    serverProcess = await startLocalServer(port);
    const ready = await waitForServer(baseUrl);
    if (!ready) {
      console.error('❌ Local server failed to start.');
      if (serverProcess) {
        if (process.platform === 'win32') execSync(`taskkill /pid ${serverProcess.pid} /f /t`);
        else serverProcess.kill();
      }
      process.exit(1);
    }
  } else {
    console.log('   ℹ️ Local server already running.');
  }

  const browser = await chromium.launch();

  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

  // Ensure APP_ROUTES_CONFIG is imported to understand the category of each route
  const { APP_ROUTES_CONFIG } = await import('../../apps/company-website/src/app/app.routes.config');
  const { SYSTEM_ROUTES } = await import('../../apps/company-website/src/app/app.routes.system');

  // Parallel rendering function for a single route
  async function renderRoute(route: string) {
    const url = `${baseUrl}${route}`;
    const isSystem = SYSTEM_ROUTES.some(r => r.path === route || (route === '/404' && r.path === '/404'));
    
    let subPath = isSystem ? 'system' : 'app';
    
    // Closer mirroring:
    if (isSystem) {
      if (['/impressum', '/datenschutz', '/agb', '/lizenzen'].includes(route)) {
        subPath = 'system/legal';
      } else {
        subPath = 'system/infrastructure';
      }
    }

    const cleanRoute = route === '/' ? 'index' : route.replace(/^\//, '');
    const targetFile = path.join(artifactDir, subPath, `${cleanRoute}/index.html`);
    const targetSubDir = path.dirname(targetFile);

    if (!fs.existsSync(targetSubDir)) fs.mkdirSync(targetSubDir, { recursive: true });

    console.log(`  📄 Rendering ${route}...`);
    
    // Create separate browser context for this route
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Smart Wait: Ensure content is really loaded (not just skeleton)
      try {
        await page.waitForFunction(() => {
          // Check for OUR specific hydration marker
          const container = document.querySelector('[data-hydrated="true"]');
          return !!container;
        }, { timeout: 15000 });
        // Give explicit SEO tags a moment to update/hoist
        await page.waitForTimeout(1000); 
      } catch (waitError) {
        console.warn(`    ⚠️ Timeout waiting for hydration on ${route}. Configuring output anyway.`);
      }

      // Check specifically for React 19 Hoisted Tags (Debugging)
      const hasDescription = await page.evaluate(() => !!document.querySelector('meta[name="description"]'));
      if (!hasDescription) console.warn(`    ⚠️ Warning: No meta description detected in DOM for ${route}`);

      const rawHtml = await page.content();
      const cleanedHtml = cleanupHtml(rawHtml);
      
      fs.writeFileSync(targetFile, cleanedHtml);
      console.log(`    ✅ Saved & Cleaned: ${route}`);
    } catch (e) {
      console.error(`  ❌ Error rendering ${route}:`, e);
    } finally {
      await context.close();
    }
  }

  // Render all routes in parallel
  console.log(`\n🚀 Starting parallel rendering of ${routes.length} routes...\n`);
  await Promise.all(routes.map(route => renderRoute(route)));

  await browser.close();
  
  if (serverProcess) {
    console.log('   🛑 Stopping temporary server...');
    const { execSync } = require('child_process');
    if (process.platform === 'win32') {
      try { execSync(`taskkill /pid ${serverProcess.pid} /f /t`); } catch(e) {console.log(e)}
    } else {
      serverProcess.kill();
    }
  }

  console.log(`\n✨ Prerendering & Cleanup complete. Snapshots saved to temp/artifacts/pages/`);
}

start().catch(err => {
  console.error('❌ Prerender process FAILED:', err);
  process.exit(1);
});
