import * as fs from 'fs';
import * as path from 'path';

/**
 * ROUTE VALIDATION SCRIPT
 * 
 * Verifies that every route defined in `app.routes.config.ts` is explicitly
 * handled in `routes.tsx`.
 */

function validate() {
  const rootDir = path.resolve(__dirname, '../..');
  const configPath = path.join(rootDir, 'apps/company-website/src/app/app.routes.config.ts');
  const routesPath = path.join(rootDir, 'apps/company-website/src/app/routes.tsx');

  console.log('🔍 Validating Route Mappings...');

  if (!fs.existsSync(configPath) || !fs.existsSync(routesPath)) {
    console.error('❌ Route files not found.');
    process.exit(1);
  }

  const configContent = fs.readFileSync(configPath, 'utf8');
  const routesContent = fs.readFileSync(routesPath, 'utf8');

  // Regex to find paths in config: path: '/...'
  const pathMatches = configContent.matchAll(/path:\s*['"]([^'"]+)['"]/g);
  const configPaths = Array.from(pathMatches).map(m => m[1]);

  console.log(`Found ${configPaths.length} routes in config.`);

  const  missing = [];
  for (const p of configPaths) {
    // Check if the path is explicitly handled in routes.tsx
    // (We look for the string literal of the path in the file)
    if (!routesContent.includes(`route.path === '${p}'`) && 
        !routesContent.includes(`'${p}':`) && 
        !routesContent.includes(`"${p}":`) &&
        p !== '/' && !p.startsWith('/#')) { // Ignore root and anchors if handled generically
      
      // Specifically check for our mapping logic
      const isHandledByLegal = routesContent.includes('<LegalPage');
      const isTypicalLegalPath = ['/impressum', '/datenschutz', '/agb'].includes(p);
      
      if (!(isHandledByLegal && isTypicalLegalPath)) {
          missing.push(p);
      }
    }
  }

  if (missing.length > 0) {
    console.error('❌ VALIDATION FAILED: The following routes are in config but not explicitly mapped to components in routes.tsx:');
    missing.forEach(m => console.error(`   - ${m}`));
    console.log('\nPlease update `apps/company-website/src/app/routes.tsx` to handle these routes.');
    process.exit(1);
  }

  console.log('✅ All routes successfully mapped.');
  process.exit(0);
}

validate();
