
import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';

/**
 * PIPELINE STEP: HTML Cleanup
 * Responsibility: Deduplicate Title and Meta Tags in Prerendered HTML.
 * Addresses: React 19 SSG/Hydration double-tagging issues.
 */

const rootDir = path.resolve(__dirname, '../../');
const distDir = path.resolve(rootDir, 'apps/company-website/dist');

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

function getAllHtmlFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else {
      if (file.endsWith('.html')) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

export async function cleanupHtml() {
  console.log('🧹 Starting Smart HTML Cleanup (JSDOM)...');

  if (!fs.existsSync(distDir)) {
    console.error('❌ Dist directory not found. Run prerender first.');
    process.exit(1);
  }

  const htmlFiles = getAllHtmlFiles(distDir);
  console.log(`   found ${htmlFiles.length} HTML files to process.`);

  let processedCount = 0;

  for (const file of htmlFiles) {
    const originalHtml = fs.readFileSync(file, 'utf8');
    const dom = new JSDOM(originalHtml);
    const document = dom.window.document;
    let changed = false;

    // 1. Handle Singletons (Keep LAST one - assuming React appended the correct one last)
    SINGLETON_SELECTORS.forEach(selector => {
      const elements = Array.from(document.querySelectorAll(selector));
      if (elements.length > 1) {
        // Keep the last one
        const winner = elements[elements.length - 1];
        // Remove others
        for (let i = 0; i < elements.length - 1; i++) {
          elements[i].remove();
        }
        changed = true;
      }
    });

    // 2. Handle Arrays (Deduplicate by content)
    ARRAY_SELECTORS.forEach(selector => {
      const elements = Array.from(document.querySelectorAll(selector));
      const seenContent = new Set<string>();

      elements.forEach(el => {
        const content = el.getAttribute('content') || el.getAttribute('href') || '';
        if (seenContent.has(content)) {
          el.remove();
          changed = true;
        } else {
          seenContent.add(content);
        }
      });
    });

    if (changed) {
      fs.writeFileSync(file, dom.serialize());
      processedCount++;
    }
  }

  console.log(`✨ Cleanup Finished. Cleaned ${processedCount} files.`);
}

// Allow direct execution
if (require.main === module) {
  cleanupHtml().catch(console.error);
}
