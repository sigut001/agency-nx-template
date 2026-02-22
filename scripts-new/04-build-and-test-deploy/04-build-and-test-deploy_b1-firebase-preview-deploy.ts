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

import * as fs from 'fs';
import * as path from 'path';
import { LogService } from '../utils/log-service';

const rootDir = path.resolve(__dirname, '../../');
const artifactsDir = path.join(rootDir, 'temp/artifacts');

// Ensure artifacts dir exists
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

async function deployToPreview() {
  LogService.init('DEPLOY', 'PREVIEW');
  console.log('🚀 PHASE 04: FIREBASE PREVIEW DEPLOYMENT');
  
  try {
    // 1. Deploy to a unique channel to ensure fresh URLs
    const timestamp = Math.floor(Date.now() / 1000).toString().slice(-6);
    const channelName = `p2-${timestamp}`;
    console.log(`   📤 Uploading to UNIQUE channel "${channelName}"...`);
    
    // Resolve path to local firebase binary to avoid npx prompts/issues. Make it cross-platform.
    const isWin = process.platform === 'win32';
    const firebaseBin = path.resolve(rootDir, 'node_modules', '.bin', isWin ? 'firebase.cmd' : 'firebase');
    
    // Set 1h expiration
    const deployOutput = await LogService.execAndLog(`"${firebaseBin}" hosting:channel:deploy ${channelName} --expires 1h --json`, { 
      cwd: rootDir,
      env: { ...process.env, FIREBASE_TOKEN: process.env.FIREBASE_TOKEN }
    });
    
    const result = JSON.parse(deployOutput);
    
    // The result object has keys based on the site name, e.g. { "test-angular-automation": { "url": "..." } }
    // We iterate to find the first valid entry with a URL.
    let channelUrl = '';
    let expireTime = '';
    if (result.result) {
      const siteKeys = Object.keys(result.result);
      if (siteKeys.length > 0) {
        const firstSiteKey = siteKeys[0];
        const siteData = result.result[firstSiteKey];
        channelUrl = siteData?.url;
        expireTime = siteData?.expireTime; // This is an ISO string from Firebase
        console.log(`   ℹ️  Detected Site: ${firstSiteKey}`);
        console.log(`   ⏱️  Channel expires at: ${expireTime}`);
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

    if (expireTime) {
      const expireFilePath = path.join(artifactsDir, 'preview-expire.txt');
      fs.writeFileSync(expireFilePath, expireTime);
      console.log(`   💾 Expiration time saved to: ${expireFilePath}`);
    }

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
