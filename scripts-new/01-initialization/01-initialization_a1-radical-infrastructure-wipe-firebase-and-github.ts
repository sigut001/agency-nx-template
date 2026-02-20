/**
 * SCRIPT: 01-radical-infrastructure-wipe-firebase-and-github.ts
 * 
 * AUFGABE: 
 * Tabula Rasa. Dieses Skript löscht restlos alle Daten in Firestore, alle Benutzer in Firebase Auth 
 * und alle Secrets im verknüpften GitHub-Repository.
 * 
 * SCHRITTE:
 * 1. Firestore: Iteriert durch alle Kollektionen und löscht jedes Dokument.
 * 2. Auth: Holt alle User-UIDs und löscht diese massenweise.
 * 3. GitHub: Nutzt die GitHub CLI (gh), um alle Secrets des Repositories zu entfernen.
 */

import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { LogService } from '../utils/log-service';

LogService.init('ACTION', 'WIPE');

async function radicalWipe() {
  console.log('>>> STARTING: 01-radical-infrastructure-wipe-firebase-and-github.ts');
  console.log('🧨 STARTING RADICAL INFRASTRUCTURE WIPE...');

  const rootDir = path.resolve(__dirname, '../../');
  dotenv.config({ path: path.join(rootDir, '.env') });

  // Reconstructed ServiceAccount for Firebase Admin
  const serviceAccount: admin.ServiceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  };

  try {
    // Firebase Admin Init
    if (!admin.apps.length) {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || path.join(rootDir, 'firebase-service-account.json');
      let credential;

      if (serviceAccount.projectId && serviceAccount.privateKey && serviceAccount.clientEmail) {
        console.log('   🔐 Using individual FIREBASE_ADMIN_* credentials');
        credential = admin.credential.cert(serviceAccount);
      } else if (fs.existsSync(serviceAccountPath)) {
        console.log(`   🔐 Using credentials from file: ${serviceAccountPath}`);
        credential = admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')));
      } else {
        throw new Error('No Firebase credentials found (individual env variables or file).');
      }
      admin.initializeApp({ credential });
    }

    const auth = admin.auth();

    // 1. FIRESTORE WIPE (using Firebase CLI for absolute zero-state)
    console.log('   🔥 ACTION: Wiping Firestore via Firebase CLI...');
    
    const tempCredPath = path.join(rootDir, 'temp-wipe-creds.json');
    try {
      if (serviceAccount.projectId && serviceAccount.privateKey && serviceAccount.clientEmail) {
        fs.writeFileSync(tempCredPath, JSON.stringify(serviceAccount));
      } else {
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || path.join(rootDir, 'firebase-service-account.json');
        if (fs.existsSync(serviceAccountPath)) {
          fs.copyFileSync(serviceAccountPath, tempCredPath);
        } else {
          throw new Error('No Firebase credentials found for CLI wipe.');
        }
      }

      console.log('      🔍 DEBUG: Environment Information');
      console.log(`         CWD: ${process.cwd()}`);
      console.log(`         Node Version: ${process.version}`);
      
      const firebaseBin = path.join(rootDir, 'node_modules/.bin/firebase.cmd');
      const binExists = fs.existsSync(firebaseBin);
      const cmd = binExists ? firebaseBin : 'npx firebase';

      try {
        const fbVersionRaw = await LogService.execAndLog(`${cmd} --version`, { env: process.env });
        const fbVersion = fbVersionRaw.trim();
        console.log(`         Firebase CLI Version: ${fbVersion}`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`         ⚠️  Unable to get Firebase version: ${message}`);
      }

      console.log('      ➡️  Executing: firebase firestore:delete --all-collections');
      // Set GOOGLE_APPLICATION_CREDENTIALS for the child process
      
      await LogService.execAndLog(`${cmd} firestore:delete --all-collections --force`, {
        env: { ...process.env, GOOGLE_APPLICATION_CREDENTIALS: tempCredPath },
        cwd: rootDir
      });
      console.log('      ✅ Success: Firestore fully wiped.');
    } catch (fsError: unknown) {
      console.error('      ❌ Error: Firestore CLI wipe failed.');
      if (typeof fsError === 'object' && fsError !== null) {
        const errObj = fsError as { stdout?: string; stderr?: string; message?: string };
        if (errObj.stdout) console.error(`      📊 STDOUT: ${errObj.stdout}`);
        if (errObj.stderr) console.error(`      📊 STDERR: ${errObj.stderr}`);
        if (errObj.message) console.error(`      ℹ️  Message: ${errObj.message}`);
      }
      throw fsError;
    } finally {
      if (fs.existsSync(tempCredPath)) fs.unlinkSync(tempCredPath);
    }

    // 2. AUTH WIPE (Recursive)
    console.log('\n   🔥 ACTION: Wiping Firebase Auth Users...');
    let usersDeleted = 0;
    
    async function deletePage(nextPageToken?: string) {
      try {
        const listUsers = await auth.listUsers(1000, nextPageToken);
        if (listUsers.users.length > 0) {
          console.log(`      ➡️  Deleting batch of ${listUsers.users.length} users...`);
          await auth.deleteUsers(listUsers.users.map(u => u.uid));
          usersDeleted += listUsers.users.length;
          console.log(`      ✅ Success: Batch deleted. Total so far: ${usersDeleted}`);
          if (listUsers.pageToken) {
            await deletePage(listUsers.pageToken);
          }
        } else {
          console.log('      ℹ️  INFO: No users found in this page.');
        }
      } catch (authError: any) {
        console.error('      ❌ Error during Auth batch deletion:');
        console.error(`         Code: ${authError.code}`);
        console.error(`         Message: ${authError.message}`);
        throw authError;
      }
    }

    await deletePage();
    console.log(`      ✅ FINAL: Deleted ${usersDeleted} users total.`);

    // 3. GITHUB SECRETS WIPE
    console.log('\n   🔥 ACTION: Wiping GitHub Secrets...');
    try {
      const secretsRaw = (await LogService.execAndLog('gh secret list', { cwd: rootDir })).trim();
      if (!secretsRaw) {
        console.log('      ℹ️  INFO: No secrets found in GitHub.');
      } else {
        const lines = secretsRaw.split('\n');
        console.log(`      📊 INFO: Found ${lines.length} secrets.`);
        const secretNames = lines.map((line: string) => line.split('\t')[0]).filter(Boolean);
        for (const name of secretNames) {
          console.log(`      ➡️  Deleting secret: "${name}"...`);
          await LogService.execAndLog(`gh secret delete ${name}`, { cwd: rootDir });
          console.log(`      ✅ Success: Deleted "${name}".`);
        }
      }
    } catch (ghError: unknown) {
      const message = ghError instanceof Error ? ghError.message : String(ghError);
      console.warn('      ⚠️  WARNING: GitHub CLI failed or no access.');
      console.warn(`         Error: ${message}`);
    }

    console.log('\n✨ ACTION: RADICAL WIPE COMPLETED SUCCESSFULLY.');
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ FATAL ERROR: Radical Wipe failed.');
    console.error('   Expected: All infrastructure elements to be deleted.');
    console.error(`   Error details: ${error.stack || error}`);
    process.exit(1);
  }
}

radicalWipe();
