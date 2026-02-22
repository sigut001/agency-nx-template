/**
 * SCRIPT: 02c-validate-github-secrets.ts
 * 
 * AUFGABE: 
 * Validiert, ob alle Secrets aus der .env erfolgreich nach GitHub synchronisiert wurden.
 */

import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { LogService } from '../utils/log-service';

LogService.init('VALIDATE', 'SYNC');

async function validateSecrets() {
  console.log('>>> STARTING VALIDATION: 02c-validate-github-secrets.ts');
  
  const rootDir = path.resolve(__dirname, '../../');
  const envPath = path.join(rootDir, '.env');
  
  try {
    const secretsRaw = (await LogService.execAndLog('gh secret list', { cwd: rootDir })).trim();
    const existingSecrets = secretsRaw.split('\n').map(l => l.split('\t')[0]);
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envConfig = dotenv.parse(envContent);
    
    // GitHub Secret Name rules: [A-Z, 0-9, _] and must not start with GITHUB_ or a number.
    const isValidKey = (key: string) => /^[A-Z_][A-Z0-9_]*$/.test(key) && !key.startsWith('GITHUB_');
    
    const requiredKeys = Object.keys(envConfig).filter(k => 
      envConfig[k] && 
      envConfig[k].length > 0 && 
      isValidKey(k)
    );

    let failed = false;
    for (const key of requiredKeys) {
      if (!existingSecrets.includes(key)) {
        console.error(`      ❌ Error: Secret "${key}" is MISSING in GitHub.`);
        failed = true;
      } else {
        console.log(`      ✅ Success: Secret "${key}" verified.`);
      }
    }

    if (failed) {
      console.error('\n🛑 GITHUB SECRETS VALIDATION FAILED.');
      process.exit(1);
    } else {
      console.log('\n✨ GITHUB SECRETS VALIDATION PASSED.');
      process.exit(0);
    }
  } catch (error: unknown) {
    console.error('\n❌ Fatal Error during GitHub Verification:', error);
    process.exit(1);
  }
}

validateSecrets();
