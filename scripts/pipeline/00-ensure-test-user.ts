import { initializeApp as initializeClientApp } from 'firebase/app';
import { getAuth as getClientAuth, signInWithEmailAndPassword } from 'firebase/auth';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

/**
 * PIPELINE STEP 00: Ensure Test User
 * Responsibility: IAM, Credentials Generation, GitHub Secret Sync
 */

async function ensureUser() {
  const rootDir = path.resolve(__dirname, '../..');
  const envPath = path.join(rootDir, '.env');
  const projectConfigPath = path.join(rootDir, 'apps/company-website/project.json');

  // Load Environment Variables
  dotenv.config({ path: envPath });
  const env = process.env as Record<string, string>;

  // 1. Get Project Slug
  let projectSlug = 'template';
  if (fs.existsSync(projectConfigPath)) {
    const projectJson = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'));
    projectSlug = (projectJson.name || 'template').split('/').pop() || 'template';
  }

  // 2. Generate Brand New Password for Clean Setup
  const testEmail = env.TEST_USER_EMAIL || `test-${projectSlug}@qubits-digital.de`;
  const testPass = crypto.randomBytes(16).toString('hex') + '!';

  console.log(`👤 Customer Target: ${projectSlug}`);
  console.log(`📧 Test Email: ${testEmail}`);
  console.log(`🔑 New Password generated for fresh setup.`);

  // 3. Initialize Admin SDK
  if (!env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON is missing in .env');
  }
  const serviceAccount = JSON.parse(env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: env.VITE_FIREBASE_PROJECT_ID
    });
  }

  const adminAuth = admin.auth();
  const adminDb = admin.firestore();

  try {
    console.log(`👤 Checking for existing test user to perform clean setup...`);
    
    try {
      const existingUser = await adminAuth.getUserByEmail(testEmail);
      console.log(`🗑️  Existing user (UID: ${existingUser.uid}) found. Purging...`);
      
      // Delete from Auth
      await adminAuth.deleteUser(existingUser.uid);
      
      // Delete from Firestore
      await adminDb.collection('users').doc(existingUser.uid).delete();
      console.log('✅ Existing user and Firestore data purged.');
    } catch (e: any) {
      if (e.code !== 'auth/user-not-found') throw e;
      console.log('✨ No existing user found. Proceeding with fresh creation.');
    }

    // 1. Create New User
    console.log('✨ Creating new test owner account...');
    const userRecord = await adminAuth.createUser({
      email: testEmail,
      password: testPass,
      displayName: 'Test Owner'
    });
    const userUid = userRecord.uid;
    console.log(`✅ Test owner created (UID: ${userUid}).`);

    // 2. Set role in Firestore (Force clean doc)
    await adminDb.collection('users').doc(userUid).set({
      email: testEmail,
      role: 'owner',
      displayName: 'Test Owner',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isTestAccount: true,
      setupMode: 'clean_recreation'
    });
    console.log('✅ Role "owner" synchronized in Firestore.');

    // 3. Set Custom Claims for reliable Rules access
    await adminAuth.setCustomUserClaims(userUid, { role: 'owner' });
    console.log('✅ Custom Claim "role: owner" set.');

    // 4. Verify Client Connectivity
    console.log('🔗 Verifying client-side connectivity...');
    const clientFirebaseConfig = {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
    };
    const clientApp = initializeClientApp(clientFirebaseConfig);
    const clientAuth = getClientAuth(clientApp);
    
    await signInWithEmailAndPassword(clientAuth, testEmail, testPass);
    console.log('✅ Client-side authentication verified.');

    // 5. Update Local .env file
    console.log(`📝 Synchronizing credentials to ${envPath}...`);
    let envContent = fs.readFileSync(envPath, 'utf8');
    const updateEnv = (key: string, value: string) => {
      const regex = new RegExp(`^${key}=.*`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    };

    updateEnv('TEST_USER_EMAIL', testEmail);
    updateEnv('TEST_USER_PASSWORD', testPass);
    fs.writeFileSync(envPath, envContent.trim() + '\n');
    console.log('✅ Project .env file updated.');

    // 6. Sync to GitHub Secrets
    try {
      console.log('☁️  Syncing credentials to GitHub Secrets...');
      execSync(`gh secret set TEST_USER_EMAIL --body "${testEmail}"`, { stdio: 'ignore' });
      execSync(`gh secret set TEST_USER_PASSWORD --body "${testPass}"`, { stdio: 'ignore' });
      console.log('✅ GitHub Secrets synchronized.');
    } catch {
      console.log('⚠️  GitHub Secret Sync skipped (gh CLI not logged in or not a repo).');
    }

    console.log('🌈 Clean Identity Setup Complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during clean identity setup:', error);
    process.exit(1);
  }
}

ensureUser();
