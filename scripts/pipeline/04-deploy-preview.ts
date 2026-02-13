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

  const channelId = `test-${Math.floor(Date.now() / 1000)}`;
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
      process.exit(0);
    } else {
      console.error('❌ Could not find Preview URL in Firebase output.');
      console.error('Firebase Output:', deployOutput);
      process.exit(1);
    }
  } catch (err: unknown) {
    console.error('❌ Firebase Preview Deploy failed:', err);
    if (fs.existsSync(tempOutputFile)) {
      console.error('Firebase Output from log:', fs.readFileSync(tempOutputFile, 'utf8'));
    }
    process.exit(1);
  } finally {
    if (fs.existsSync(tempOutputFile)) fs.unlinkSync(tempOutputFile);
  }
}

deploy().catch(console.error);
