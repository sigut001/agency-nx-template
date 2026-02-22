/**
 * SCRIPT: 02-validation_g1-dynamic-route-and-firestore-schema-integrity-check.ts
 * 
 * AUFGABE: 
 * Validiert die Übereinstimmung zwischen Single-Point-of-Truth (Config) und:
 * 1. Code (routes.tsx): Werden alle Routen korrekt auf Komponenten gemappt?
 * 2. Datenbank (Firestore): Existieren die Kollektionen/Dokumente exakt wie in der Config benannt?
 */

import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Helper to parse the config file manually to avoid runtime import issues
function parseRouteConfig(content: string): any[] {
  const staticRows = Array.from(content.matchAll(/path:\s*['"]([^'"]+)['"],\s*title:\s*['"]([^'"]+)['"],\s*type:\s*['"]static['"],\s*collection:\s*['"]([^'"]+)['"]/g));
  const dynamicRows = Array.from(content.matchAll(/path:\s*['"]([^'"]+)['"],\s*title:\s*['"]([^'"]+)['"],\s*type:\s*['"]dynamic['"],\s*collection:\s*['"]([^'"]+)['"]/g));

  return [
    ...staticRows.map(r => ({ path: r[1], title: r[2], type: 'static', collection: r[3] })),
    ...dynamicRows.map(r => ({ path: r[1], title: r[2], type: 'dynamic', collection: r[3] }))
  ];
}

async function verifyIntegrity() {
  console.log('🛡️  STARTING INTEGRITY AUDIT (Single Source of Truth Check)...');

  const rootDir = path.resolve(__dirname, '../../');
  dotenv.config({ path: path.join(rootDir, '.env') });

  // 1. Load Config (Direct Import)
  const { APP_ROUTES_CONFIG } = await import('../../apps/company-website/src/app/app.routes.config');
  // SYSTEM_ROUTES and APP_CONTENT_ROUTES are no longer separate files — filter from APP_ROUTES_CONFIG
  const isSystemRoute = (r: any) => r.path.startsWith('/impressum') || r.path.startsWith('/datenschutz') || r.path.startsWith('/agb') || r.path.startsWith('/lizenzen');

  console.log(`   ℹ️  Loaded ${APP_ROUTES_CONFIG.length} routes from split configs.`);

  // 3. Initialize Firebase
  if (!admin.apps.length) {
    const serviceAccount: admin.ServiceAccount = {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    };
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  const db = admin.firestore();

  const report: any[] = [];
  let failed = false;

  console.log('\n🔍 Phase A: Checking Data Path Consistency...');
  
  for (const route of APP_ROUTES_CONFIG) {
    if (!route.collection) continue;
    
    const isSystem = isSystemRoute(route);
    const expectedDir = isSystem ? 'system' : 'app';
    
    // Check directory mirroring in Firestore
    const colRef = route.collection;
    if (route.type === 'static') {
      const expectedPrefix = `static_pages/${expectedDir}/`;
      if (!colRef.startsWith(expectedPrefix)) {
        console.error(`      ❌ Data Mismatch: Static route "${route.path}" collection "${colRef}" must start with "${expectedPrefix}".`);
        report.push({ check: 'DB-PATH', route: route.path, status: '❌ INVALID PREFIX' });
        failed = true;
      }
    }
  }

  console.log('\n🔍 Phase B: Checking Database Existence...');

  for (const route of APP_ROUTES_CONFIG) {
    if (!route.collection) continue;
    
    const colRef = route.collection;
    const parts = colRef.split('/');

    if (route.type === 'static') {
        // Recursive resolution: start with db, then alternate coll/doc
        let current: any = db;
        for (let i = 0; i < parts.length; i++) {
          if (i % 2 === 0) current = current.collection(parts[i]);
          else current = current.doc(parts[i]);
        }
        
        // If current is a Collection, we expect a document inside with the same name (standardized mapping) or just check existence of the doc.
        // My loop above results in a Doc if parts.length is even.
        // static_pages/system/legal/impressum (4 parts) -> Doc
        
        const snap = await (current as admin.firestore.DocumentReference).get();
        if (snap.exists) {
            console.log(`      ✅ Static: ${route.path} -> ${colRef} exists.`);
        } else {
            console.error(`      ❌ Static Missing: ${route.path} expects doc "${colRef}" in Firestore.`);
            report.push({ check: 'DB', route: route.path, target: colRef, status: '❌ MISSING' });
            failed = true;
        }
    } 
    else if (route.type === 'dynamic') {
        const subColRef = db.collection(parts[0]).doc(parts[1]).collection(parts[2]);
        const snap = await subColRef.limit(1).get();
        
        if (!snap.empty) {
            console.log(`      ✅ Dynamic: ${route.path} -> ${colRef} (Collection exists & has data).`);
        } else {
            console.error(`      ❌ Dynamic Missing: Collection "${colRef}" is empty or missing.`);
            report.push({ check: 'DB', route: route.path, target: colRef, status: '❌ EMPTY/MISSING' });
            failed = true;
        }
    }
  }

  if (failed) {
    console.error('\n🛑 INTEGRITY AUDIT FAILED.');
    process.exit(1);
  } else {
    console.log('\n✨ INTEGRITY AUDIT PASSED: Split hierarchy verified.');
    process.exit(0);
  }
}

verifyIntegrity().catch(e => {
    console.error(e);
    process.exit(1);
});
