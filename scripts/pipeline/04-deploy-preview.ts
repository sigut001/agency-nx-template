import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

/**
 * PIPELINE STEP 04: Deploy Preview
 * Responsibility: Create a Firebase Hosting Preview Channel and capture the URL.
 */

async function deploy() {
  const rootDir = path.resolve(__dirname, '../..');
  dotenv.config({ path: path.join(rootDir, '.env') });

  console.log('🚀 Deploying to Firebase Preview Channel...');

  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.error('❌ VITE_FIREBASE_PROJECT_ID missing.');
    process.exit(1);
  }

  const channelArg = process.argv.find(arg => arg.startsWith('--channel='));
  const channelId = channelArg ? channelArg.split('=')[1] : `test-${Math.floor(Date.now() / 1000)}`;
  const tempOutputFile = path.join(rootDir, 'firebase-temp.log');

  try {
    console.log(`📡 Creating Preview Channel: ${channelId} (Expires in 1h)`);
    
    // Use redirection to file for robust output capture on Windows
    execSync(
      `npx firebase hosting:channel:deploy ${channelId} --expires 1h --project ${projectId} --non-interactive > "${tempOutputFile}" 2>&1`, 
      { cwd: rootDir }
    );
    
    const deployOutput = fs.readFileSync(tempOutputFile, 'utf8');
    
    // Parse URL from output: "Channel URL: https://..."
    const urlMatch = deployOutput.match(/Channel URL.*?:\s*(https:\/\/[^\s]+)/i);
    if (urlMatch) {
      const liveUrl = urlMatch[1];
      console.log(`✅ Preview deployed to: ${liveUrl}`);
      
      // Output for the orchestrator to pick up
      console.log(`::SET_URL::${liveUrl}`); 

      console.log('\n✨ SUMMARY: Preview Deployment PASSED');
      console.log(`   - Channel: ${channelId}`);
      console.log(`   - URL:     ${liveUrl}`);
      console.log(`   - Expires: 1h`);
      process.exit(0);
    } else {
      console.error('❌ Deployment Failed: URL not found in output');
      console.error('   Expected: Output containing "Channel URL: https://..."');
      console.error('   Found:    Full log below:\n');
      console.log(deployOutput);
      process.exit(1);
    }
  } catch (err: any) {
    console.error('❌ Firebase Preview Deploy Exception');
    console.error(`   Error: ${err.message || err}`);
    if (fs.existsSync(tempOutputFile)) {
      console.log('\n--- Firebase Log Output ---');
      console.log(fs.readFileSync(tempOutputFile, 'utf8'));
      console.log('---------------------------\n');
    }
    process.exit(1);
  } finally {
    if (fs.existsSync(tempOutputFile)) fs.unlinkSync(tempOutputFile);
  }
}

deploy().catch(console.error);
