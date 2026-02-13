#!/usr/bin/env node
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Firebase Security Rules Deployment Script
 * Automatically deploys Firestore security rules to Firebase
 */

const projectRoot = path.resolve(__dirname, '..');
const firebaseJson = path.join(projectRoot, 'firebase.json');
const firestoreRules = path.join(projectRoot, 'firestore.rules');

console.log('🔒 Firebase Security Rules Deployment\n');

// 1. Check if firebase.json exists
if (!fs.existsSync(firebaseJson)) {
  console.error('❌ firebase.json not found. Please run setup first.');
  process.exit(1);
}

// 2. Check if firestore.rules exists
if (!fs.existsSync(firestoreRules)) {
  console.error('❌ firestore.rules not found. Please create security rules first.');
  process.exit(1);
}

console.log('✅ Configuration files found');
console.log(`   - firebase.json: ${firebaseJson}`);
console.log(`   - firestore.rules: ${firestoreRules}\n`);

// 3. Deploy rules
try {
  console.log('📤 Deploying Firestore security rules...');
  execSync('firebase deploy --only firestore:rules', {
    cwd: projectRoot,
    stdio: 'inherit'
  });
  
  console.log('\n✅ Security rules deployed successfully!');
  console.log('💡 Tip: Test your rules in the Firebase Console under Firestore > Rules');
  
} catch (error) {
  console.error('\n❌ Deployment failed:', error);
  console.log('\n💡 Make sure you are logged in: firebase login');
  console.log('💡 Make sure you have selected a project: firebase use <project-id>');
  process.exit(1);
}
