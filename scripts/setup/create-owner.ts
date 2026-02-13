#!/usr/bin/env node
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * Create First Owner Account
 * Uses Firebase Admin SDK to create owner without authentication conflicts
 * 
 * IMPORTANT: Service Account Key is PROJECT-SPECIFIC
 * - Each customer project has its own Service Account
 * - No risk of exposing agency credentials
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createOwner() {
  console.log('👤 Create First Owner Account\n');

  // 1. Load Service Account (PROJECT-SPECIFIC!)
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 
                             path.join(__dirname, '../../firebase-service-account.json');

  if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Service account key not found!');
    console.log('   Please run: npm run init:firebase first');
    process.exit(1);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  // 2. Initialize Admin SDK (PROJECT-SPECIFIC!)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const auth = admin.auth();
  const db = admin.firestore();

  // 3. Get Owner Details
  const email = await question('Owner Email: ');
  const password = await question('Owner Password (min 6 chars): ');
  const displayName = await question('Display Name: ');

  try {
    // 4. Create User in Auth
    console.log('\n🔐 Creating authentication account...');
    const userRecord = await auth.createUser({
      email,
      password,
      displayName
    });

    console.log(`✅ Auth account created: ${userRecord.uid}`);

    // 5. Create User Profile in Firestore
    console.log('📝 Creating user profile...');
    await db.collection('users').doc(userRecord.uid).set({
      email,
      role: 'owner',
      displayName,
      createdAt: new Date().toISOString()
    });

    console.log('✅ User profile created with owner role');
    console.log('\n🎉 Owner account successfully created!');
    console.log(`   Email: ${email}`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Project: ${serviceAccount.project_id}`);
    console.log('\n💡 You can now login at /admin/login');

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error creating owner:', errorMessage);
    process.exit(1);
  } finally {
    rl.close();
  }
}

createOwner();
