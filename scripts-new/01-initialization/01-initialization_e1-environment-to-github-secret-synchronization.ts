/**
 * SCRIPT: 03-environment-to-github-secret-synchronization.ts
 * 
 * AUFGABE: 
 * Synchronisiert die lokale .env Datei mit den GitHub Secrets des Repositories.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { LogService } from '../utils/log-service';

LogService.init('ACTION', 'SYNC');

async function syncSecrets() {
  process.setMaxListeners(0); // Prevent MaxListenersExceededWarning for parallel execSync
  console.log('🔐 STARTING GITHUB SECRET SYNCHRONIZATION...');

  const rootDir = path.resolve(__dirname, '../../');
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found.');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envConfig = dotenv.parse(envContent);

  // Parallel upload function for a single secret
  async function uploadSecret(key: string, value: string): Promise<void> {
    // GitHub Secret Name rules: [A-Z, 0-9, _] and must not start with GITHUB_ or a number.
    const isValidKey = /^[A-Z_][A-Z0-9_]*$/.test(key) && !key.startsWith('GITHUB_');
    
    if (!isValidKey) {
      console.log(`   ⚠️  Skipping invalid key for GitHub Secrets: ${key}`);
      return;
    }

    console.log(`   ➡️  Syncing: ${key}`);
    return new Promise((resolve, reject) => {
      const { exec } = require('child_process');
      const child = exec(`gh secret set ${key} --body -`, { 
        encoding: 'utf8',
        env: process.env 
      }, (error: any) => {
        if (error) {
            console.error(`      ❌ Failed to sync ${key}: ${error.message}`);
            reject(error);
        } else {
            console.log(`      ✅ Success: ${key}`);
            resolve();
        }
      });
      
      // Write value to stdin and end the stream
      child.stdin?.write(value);
      child.stdin?.end();
    });
  }

  // Upload all secrets in parallel
  const secretEntries = Object.entries(envConfig).filter(([_, value]) => value);
  console.log(`   📤 Uploading ${secretEntries.length} secrets in parallel...\n`);

  try {
    await Promise.all(
      secretEntries.map(([key, value]) => uploadSecret(key, value))
    );
    console.log('\n✨ GITHUB SECRETS SYNCED.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Secret synchronization failed.');
    process.exit(1);
  }
}

syncSecrets();
