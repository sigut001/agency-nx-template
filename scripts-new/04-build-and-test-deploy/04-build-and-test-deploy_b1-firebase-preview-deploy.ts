/**
 * SCRIPT: 04-build-and-test-deploy_b1-firebase-preview-deploy.ts
 * 
 * TERM: "Deploy"
 * 
 * AUFGABE:
 * 1. Deployt den Build auf einen Firebase Preview Channel ("preview-validation").
 * 2. Extrahiert die temporäre Preview-URL.
 * 3. Speichert die URL in temp/artifacts/preview-url.txt für nachfolgende Tests.
 * 
 * HINWEIS:
 * Keine Validierung mehr! Die Validierung erfolgt jetzt durch Playwright (Target: test-deploy:e2e).
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const rootDir = path.resolve(__dirname, '../../');
const artifactsDir = path.join(rootDir, 'temp/artifacts');

// Ensure artifacts dir exists
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

async function deployToPreview() {
  console.log('🚀 PHASE 04: FIREBASE PREVIEW DEPLOYMENT');
  
  try {
    // 1. Deploy to "preview-validation" channel
    // --json allows us to parse the result reliable
    console.log('   📤 Uploading to channel "preview-validation"...');
    
    // Resolve path to local firebase binary to avoid npx prompts/issues
    const firebaseBin = path.resolve(rootDir, 'node_modules', '.bin', 'firebase.cmd');
    
    // Set 1h expiration to keep cache relevant but not stale forever
    const deployOutput = execSync(`"${firebaseBin}" hosting:channel:deploy preview-validation --expires 1h --json`, { 
      cwd: rootDir,
      encoding: 'utf8',
      env: { ...process.env, FIREBASE_TOKEN: process.env.FIREBASE_TOKEN }
    });
    
    const result = JSON.parse(deployOutput);
    
    // The result object has keys based on the site name, e.g. { "test-angular-automation": { "url": "..." } }
    // We iterate to find the first valid entry with a URL.
    let channelUrl = '';
    if (result.result) {
      const siteKeys = Object.keys(result.result);
      if (siteKeys.length > 0) {
        const firstSiteKey = siteKeys[0];
        channelUrl = result.result[firstSiteKey]?.url;
        console.log(`   ℹ️  Detected Site: ${firstSiteKey}`);
      }
    }

    if (!channelUrl) {
      console.error('DEBUG: Raw Output:', deployOutput);
      fs.writeFileSync(path.join(artifactsDir, 'debug-deploy-output.txt'), deployOutput);
      throw new Error('No Preview URL found in Firebase Output');
    }

    console.log(`   ✅ Deploy Successful: ${channelUrl}`);

    // 2. Save URL for E2E Tests
    const urlFilePath = path.join(artifactsDir, 'preview-url.txt');
    fs.writeFileSync(urlFilePath, channelUrl);
    console.log(`   💾 URL saved to: ${urlFilePath}`);

    process.exit(0);

  } catch (error: any) {
    console.error('   ❌ DEPLOYMENT FAILED');
    // Try to parse stdout if it's a shell error
    if (error.stdout) console.log('STDOUT:', error.stdout.toString());
    if (error.stderr) console.error('STDERR:', error.stderr.toString());
    else console.error(error.message);
    
    process.exit(1);
  }
}

deployToPreview();
