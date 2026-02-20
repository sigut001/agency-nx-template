/**
 * SCRIPT: 02-validation_i1-validate-page-architecture.ts
 * 
 * AUFGABE: 
 * Validiert, dass JEDE Route in der Anwendung die `createPage`-Funktion verwendet.
 * Dies ist notwendig, um sicherzustellen, dass SEO-Daten (Titel, Description, JSON-LD)
 * zwingend vorhanden sind und nicht vergessen werden können.
 * 
 * FUNKTIONSWEISE:
 * 1. Lädt alle Routen aus `app.routes.config.ts`.
 * 2. Liest die entsprechenden Komponentendateien.
 * 3. Prüft per Regex, ob `export default createPage` verwendet wird.
 * 4. Bricht den Build ab, wenn eine Verletzung gefunden wird.
 */

import * as fs from 'fs';
import * as path from 'path';
import { LogService } from '../utils/log-service';
import { APP_ROUTES_CONFIG } from '../../apps/company-website/src/app/app.routes.config';

const rootDir = path.resolve(__dirname, '../../');
const appDir = path.join(rootDir, 'apps/company-website/src');

async function validateArchitecture() {
  LogService.init('VALIDATE', 'ARCHITECTURE');
  console.log('🏗️  VALIDATING PAGE ARCHITECTURE (Strict SEO Enforcement)...');

  let errorCount = 0;
  
  // Set of checked files to avoid checking shared components multiple times
  const checkedFiles = new Set<string>();

  for (const route of APP_ROUTES_CONFIG) {
    // Resolve absolute path to the component file
    // route.file starts with ./app/routes/... relative to apps/company-website/src
    // We clean up the relative path first
    const cleanPath = route.file.replace(/^\.\//, '');
    const fullPath = path.join(appDir, cleanPath);

    if (checkedFiles.has(fullPath)) continue;
    checkedFiles.add(fullPath);

    if (!fs.existsSync(fullPath)) {
      console.log(`❌ FILE NOT FOUND: ${route.file} (Route: ${route.path})`);
      errorCount++;
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');

    // CHECK 1: Import of createPage
    if (!content.includes('createPage')) {
      console.log(`❌ VIOLATION in ${route.file}: Missing 'createPage' import.`);
      console.log(`   -> All pages MUST verify SEO data via createPage() wrapper.`);
      errorCount++;
      continue;
    }

    // CHECK 2: Usage of createPage in default export
    // Matches: export default createPage(...) or export default createPage<...>(...)
    const usesCreatePage = /export\s+default\s+createPage/.test(content);

    if (!usesCreatePage) {
      console.log(`❌ VIOLATION in ${route.file}: Default export is NOT wrapping 'createPage'.`);
      console.log(`   -> Correct usage: export default createPage<Loader>({ ... });`);
      errorCount++;
    } else {
      console.log(`   ✅ Valid: ${path.basename(fullPath)} matches architectural guidelines.`);
    }
  }

  console.log('---------------------------------------------------');
  if (errorCount > 0) {
    console.log(`❌ ARCHITECTURE VALIDATION FAILED with ${errorCount} errors.`);
    console.log('   The build has been stopped to prevent SEO regressions.');
    process.exit(1);
  } else {
    console.log('✨ ARCHITECTURE VALIDATION PASSED. All pages comply with SEO standards.');
    process.exit(0);
  }
}

validateArchitecture().catch(err => {
  console.error('❌ VALIDATION CRASHED:', err);
  process.exit(1);
});
