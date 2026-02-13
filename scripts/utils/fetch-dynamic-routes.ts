

import * as fs from 'fs';
import * as path from 'path';
import { getRoutes } from '../pipeline/02-generate-seo';


/**
 * FETCH DYNAMIC ROUTES
 * 
 * Fetches all active routes (static + dynamic) from Firestore based on the logic 
 * defined in 02-generate-seo.ts and saves them to a JSON file.
 * 
 * Usage: Used by E2E tests to know which URLs to visit.
 */

async function fetchRoutesAndSave() {
  console.log('🌍 Fetching all active routes for E2E...');
  
  // Reuse the logic from the SEO generator to ensure single source of truth
  const routes = await getRoutes();
  
  console.log(`   Found ${routes.length} routes.`);
  
  const targetPath = path.resolve(__dirname, '../../e2e-routes.json');
  fs.writeFileSync(targetPath, JSON.stringify(routes, null, 2));
  
  console.log(`✅ Routes saved to ${targetPath}`);
}

if (require.main === module) {
  fetchRoutesAndSave().catch(err => {
    console.error('❌ Failed to fetch routes:', err);
    process.exit(1);
  });
}
