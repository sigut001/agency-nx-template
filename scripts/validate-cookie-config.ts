import { COOKIE_CATALOG } from '../apps/company-website/src/app/config/cookie-catalog';
import { projectConfig } from '../apps/company-website/src/app/config/project-config';

console.log('\n🍪 --- Cookie Configuration Validator ---\n');

const activeFeatures = Object.keys(projectConfig.features).filter(
  (key) => projectConfig.features[key] === true
);

const inactiveFeatures = Object.keys(projectConfig.features).filter(
  (key) => projectConfig.features[key] === false
);

console.log(`✅ Active Features:   ${activeFeatures.join(', ')}`);
console.log(`❌ Inactive Features: ${inactiveFeatures.join(', ')}`);

console.log('\n--- Test Matrix Generation ---\n');

activeFeatures.forEach((featureKey) => {
  const definition = COOKIE_CATALOG[featureKey];
  if (!definition) {
    console.error(`🔴 ERROR: Feature '${featureKey}' enabled in config but NOT found in Catalog!`);
    process.exit(1);
  }
  console.log(`[TEST - ACTIVE] ${definition.name}:`);
  console.log(`  -> Initial State: SHOULD NOT have cookies [${definition.test.cookies.join(', ')}]`);
  console.log(`  -> Actions:       Consent '${definition.category}' -> Trigger '${definition.test.trigger}'`);
  console.log(`  -> Final State:   SHOULD HAVE cookies [${definition.test.cookies.join(', ')}]`);
});

inactiveFeatures.forEach((featureKey) => {
    const definition = COOKIE_CATALOG[featureKey];
    if (definition) {
        console.log(`[TEST - INACTIVE] ${definition.name}:`);
        console.log(`  -> Initial State: SHOULD NOT have cookies [${definition.test.cookies.join(', ')}]`);
        console.log(`  -> Actions:       Consent 'ALL' -> Trigger '${definition.test.trigger}'`);
        console.log(`  -> Final State:   SHOULD NOT have cookies [${definition.test.cookies.join(', ')}] (Must stay clean)`);
    }
});

console.log('\n✅ Configuration is VALID. Data Model is ready for UI & E2E implementation.');
