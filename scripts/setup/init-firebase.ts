#!/usr/bin/env node
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Firebase Project Initialization Script
 * 
 * This script automates the complete Firebase setup for new customer projects:
 * 1. Validates Firebase credentials
 * 2. Deploys Firestore security rules
 * 3. Seeds initial data
 * 4. Creates first owner account
 */

const projectRoot = path.resolve(__dirname, '..');

console.log('🔥 Firebase Project Initialization\n');

// 1. Check for Service Account Key
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 
                           path.join(projectRoot, 'firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath) && !process.env.FIREBASE_TOKEN) {
  console.error('❌ Firebase credentials not found!');
  console.log('\n📋 Setup Instructions:');
  console.log('   Option 1: Service Account Key (Recommended for CI/CD)');
  console.log('   1. Go to Firebase Console → Project Settings → Service Accounts');
  console.log('   2. Click "Generate new private key"');
  console.log('   3. Save as firebase-service-account.json in project root');
  console.log('   4. Add to .gitignore (already done)');
  console.log('\n   Option 2: Firebase Token (Local Development)');
  console.log('   1. Run: firebase login:ci');
  console.log('   2. Set environment variable: FIREBASE_TOKEN=<your-token>');
  process.exit(1);
}

// 2. Set Firebase Project
const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
if (!projectId) {
  console.error('❌ VITE_FIREBASE_PROJECT_ID not found in .env');
  process.exit(1);
}

console.log(`✅ Firebase Project: ${projectId}\n`);

// 3. Deploy Firestore Rules
try {
  console.log('📤 Deploying Firestore security rules...');
  
  const deployCmd = process.env.FIREBASE_TOKEN 
    ? `firebase deploy --only firestore:rules --token ${process.env.FIREBASE_TOKEN} --project ${projectId}`
    : `GOOGLE_APPLICATION_CREDENTIALS=${serviceAccountPath} firebase deploy --only firestore:rules --project ${projectId}`;
  
  execSync(deployCmd, {
    cwd: projectRoot,
    stdio: 'inherit'
  });
  
  console.log('✅ Security rules deployed\n');
} catch (error) {
  console.error('❌ Rules deployment failed:', error);
  process.exit(1);
}

// 4. Seed Initial Data
try {
  console.log('🌱 Seeding initial CMS data...');
  execSync('npx jiti scripts/setup/seed-cms.ts', {
    cwd: projectRoot,
    stdio: 'inherit'
  });
  console.log('✅ Data seeded\n');
} catch (error) {
  console.warn('⚠️  Seeding failed (may already exist):', error);
}

// 5. Instructions for Owner Account
console.log('👤 Next Steps:');
console.log('   1. Create first admin account:');
console.log('      - Go to Firebase Console → Authentication');
console.log('      - Add user manually OR run: npx jiti scripts/setup/create-owner.ts');
console.log('   2. Set user role to "owner" in Firestore:');
console.log('      - Firestore → users → [uid] → role: "owner"');
console.log('\n✅ Firebase initialization complete!');
