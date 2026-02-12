import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { getRoutes } from './generate-seo';

/**
 * Prerender Script
 * Crawls all routes and saves the rendered HTML for SEO bots.
 */

const logFile = path.resolve(__dirname, '../debug/prerender.log');
const debugDir = path.dirname(logFile);
if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });

function log(msg: string) {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
}

async function prerender() {
  if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
  log('🚀 Starting Prerender process...\n');

  const routes = await getRoutes();
  const distPath = path.resolve(__dirname, '../apps/agency-shell/dist');

  if (!fs.existsSync(distPath)) {
    console.error('❌ Dist folder not found. Please build the project first.');
    process.exit(1);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    log(`    🖥️ [Browser Console] ${msg.type()}: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    log(`    ❌ [Browser Error]: ${err.stack || err.message}`);
  });

  page.on('requestfailed', request => {
    log(`    ⚠️ [Network Failed]: ${request.url()} - ${request.failure()?.errorText}`);
  });

  // Start a local static server to serve the dist folder
  const port = process.env.VITE_PREVIEW_PORT || '4300';
  const baseUrl = `http://localhost:${port}`; 

  log(`🌐 Crawling ${routes.length} routes from ${baseUrl}...\n`);

  for (const route of routes) {
    const url = `${baseUrl}${route}`;
    const targetFile = path.join(distPath, route === '/' ? 'index.html' : `${route}.html`);
    const targetDir = path.dirname(targetFile);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    log(`  📄 Rendering ${route}...`);
    try {
      log(`    🌐 Navigating to ${url}...`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      log(`    ⏳ Page loaded (DOMContent), waiting for .main-content selector...`);
      
      try {
        await page.waitForSelector('.main-content', { timeout: 5000 });
        log(`    ✅ Selector .main-content found!`);
      } catch (e) {
        log(`    ⚠️ Timeout waiting for .main-content.`);
      }

      log(`    ⏳ Waiting for network idle...`);
      try {
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        log(`    ✅ Network idle reached!`);
      } catch (e) {
        log(`    ⚠️ Timeout waiting for network idle.`);
      }

      const title = await page.title();
      log(`    ✨ Title detected: "${title}"`);

      const html = await page.content();
      fs.writeFileSync(targetFile, html);
    } catch (e) {
      log(`  ❌ Fatal error rendering ${route}: ${e}`);
    }
  }

  await browser.close();
  log('\n✅ Prerendering finished!');
}

prerender().catch(console.error);
