import { initializeApp as initializeClientApp } from 'firebase/app';
import { getAuth as getClientAuth, signInWithEmailAndPassword } from 'firebase/auth';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { execSync } from 'child_process';

import * as dotenv from 'dotenv';

async function ensureUser() {
  const rootDir = path.resolve(__dirname, '..');
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

  // 2. Generate Credentials if missing
  const testEmail = env.TEST_USER_EMAIL || `test-${projectSlug}@qubits-digital.de`;
  const testPass = env.TEST_USER_PASSWORD || crypto.randomBytes(16).toString('hex') + '!';

  console.log(`👤 Customer Target: ${projectSlug}`);
  console.log(`📧 Test Email: ${testEmail}`);

  // Initialize Admin SDK
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
    console.log(`👤 Checking for test user via Admin SDK...`);
    let userUid = '';
    
    try {
      const userRecord = await adminAuth.getUserByEmail(testEmail);
      userUid = userRecord.uid;
      console.log('✅ User already exists in Firebase Auth.');
      
      // Update password to match .env/Secrets if it was regenerated
      await adminAuth.updateUser(userUid, { password: testPass });
      console.log('🔄 Password synchronized with .env.');
    } catch (e: any) {
      const fbError = e as { code?: string };
      if (fbError.code === 'auth/user-not-found') {
        console.log('✨ Creating new test owner account...');
        const userRecord = await adminAuth.createUser({
          email: testEmail,
          password: testPass,
          displayName: 'Test Owner'
        });
        userUid = userRecord.uid;
        console.log('✅ Test owner created.');
      } else {
        throw e;
      }
    }

    // Set role in Firestore (Bypassing rules)
    await adminDb.collection('users').doc(userUid).set({
      email: testEmail,
      role: 'owner',
      displayName: 'Test Owner'
    }, { merge: true });
    console.log('✅ Role "owner" synchronized in Firestore.');

    // 4. Verify Client Connectivity (Ensures API Key & Auth Provider are active)
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

    // 5. Update .env file
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
    console.log('📝 .env file updated.');

    // 6. Sync to GitHub Secrets
    try {
      console.log('☁️ Syncing credentials to GitHub Secrets...');
      execSync(`gh secret set TEST_USER_EMAIL --body "${testEmail}"`, { stdio: 'ignore' });
      execSync(`gh secret set TEST_USER_PASSWORD --body "${testPass}"`, { stdio: 'ignore' });
      console.log('✅ GitHub Secrets synchronized.');
    } catch {
      console.log('⚠️ GitHub Secret Sync skipped (gh CLI not logged in or not a repo).');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error ensuring test user:', error);
    process.exit(1);
  }
}

ensureUser();
