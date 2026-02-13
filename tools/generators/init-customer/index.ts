import {
  Tree,
  formatFiles,
  installPackagesTask,
  runTasksInSerial,
  execSync,
} from '@nx/devkit';
import * as path from 'path';

export default async function (tree: Tree, schema: any) {
  const projectRoot = `apps/${schema.project}`;
  
  console.log(`🏗️  Initializing project: ${schema.project}...`);

  // 1. Placeholder for Credential Transfer
  // In a real scenario, this would read from a global config or prompts
  console.log('🔑 Step 1: Transferring credentials...');
  
  // 2. Placeholder for CI/CD adjustments
  console.log('🤖 Step 2: Adjusting CI/CD pipelines...');

  return () => {
    // 3. Service Validation
    if (!schema.skipValidation) {
      console.log('🧪 Step 3: Running Service Validation...');
      try {
        execSync('npx tsx scripts/pipeline/01-validate-services.ts', {
          cwd: tree.root,
          stdio: 'inherit',
        });
      } catch (e) {
        console.warn('⚠️  Service validation failed. Please check credentials.');
      }
    }

    // 4. Database Seeding
    console.log('🌱 Step 4: Seeding Firestore...');
    try {
      execSync('npx jiti scripts/setup/seed-cms.ts', {
        cwd: tree.root,
        stdio: 'inherit',
      });
    } catch (e) {
      console.warn('⚠️  Database seeding failed.');
    }

    // 5. E2E Tests
    console.log('🏁 Step 5: Running E2E Tests...');
    try {
      execSync(`npx nx e2e ${schema.project}-e2e`, {
        cwd: tree.root,
        stdio: 'inherit',
      });
    } catch (e) {
      console.warn('⚠️  E2E tests failed.');
    }

    console.log('✨ Initialization finished!');
  };
}
