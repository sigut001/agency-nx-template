import * as fs from 'fs';
import * as path from 'path';

/**
 * COOKIE CATALOG VALIDATOR (Phase 4)
 * Ensures that the cookie catalog is present and contains valid data before build.
 */

async function main() {
  console.log('🛡️ Starting Cookie Catalog Structural Validation...');
  
  const catalogPath = path.resolve(__dirname, '../../apps/company-website/src/app/config/legal/cookie-catalog.json');
  console.log(`[CHECK] Checking catalog at: ${catalogPath}`);

  if (!fs.existsSync(catalogPath)) {
    console.error(`❌ ERROR: Cookie catalog not found at ${catalogPath}`);
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(catalogPath, 'utf-8');
    const catalog = JSON.parse(content);
    const services = Object.values(catalog);

    if (services.length === 0) {
      console.error('❌ ERROR: Cookie catalog is empty.');
      process.exit(1);
    }

    console.log(`✅ Success: Catalog contains ${services.length} services.`);
    
    // Sample check
    const essentialService = services.find((s: any) => s.category === 'essential');
    if (!essentialService) {
      console.warn('⚠️ WARNING: No essential services found in catalog.');
    }

    process.exit(0);
  } catch (err: any) {
    console.error(`❌ ERROR: Failed to parse cookie catalog: ${err.message}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
