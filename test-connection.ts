import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

async function test() {
  console.log('Testing Firestore Connection...');
  console.log('Project:', serviceAccount.projectId);
  console.log('Email:', serviceAccount.clientEmail);
  console.log('Key length:', serviceAccount.privateKey?.length);

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    const db = admin.firestore();
    const snap = await db.collection('static_pages').limit(1).get();
    console.log('✅ Connection Successful! Found', snap.size, 'documents.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection Failed:', err);
    process.exit(1);
  }
}

test();
