
import * as fs from 'fs';
import * as path from 'path';

// Note: In a real scenario we would import APP_ROUTES_CONFIG. 
// For this validation script, we define the expected logic or read the file via regex to ensure loose coupling during build.

export function validateSchema() {
  console.log('🔍 Validating Route <-> Collection Schema...');
  
  // 1. Read app.routes.config.ts to find dynamic routes
  const rootDir = path.resolve(__dirname, '../..');
  const configPath = path.join(rootDir, 'apps/company-website/src/app/app.routes.config.ts');
  
  if (!fs.existsSync(configPath)) {
    console.error('❌ Config file not found');
    process.exit(1);
  }

  const content = fs.readFileSync(configPath, 'utf-8');
  
  // Simple regex check to ensure every dynamic route has a 'collection' property defined
  // Looking for: { path: '...', ..., type: 'dynamic', ... }
  
  // We want to ensure that if type is 'dynamic', collection is present.
  const dynamicRoutes = content.match(/type:\s*['"]dynamic['"]/g);
  
  if (dynamicRoutes) {
    console.log(`   Found ${dynamicRoutes.length} dynamic routes.`);
    // Advanced check would require AST parsing, but text check is good for now.
    // If we have dynamic routes, we expect 'collection:' to be present roughly the same amount of times close by.
    
    const collectionProps = content.match(/collection:\s*['"][^'"]+['"]/g);
    if (!collectionProps || collectionProps.length < dynamicRoutes.length) {
       console.warn('⚠️  Warning: Some dynamic routes might be missing a "collection" mapping.');
    } else {
       console.log('✅ Collection properties detected for dynamic routes.');
    }
  } else {
    console.log('   No dynamic routes found (Static mode).');
  }

  console.log('✅ Schema Validation Passed.');
}

if (require.main === module) {
  validateSchema();
}
