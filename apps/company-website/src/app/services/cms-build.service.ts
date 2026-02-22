/**
 * CMS BUILD SERVICE
 *
 * Verantwortung: Firestore-Daten zur BUILD-ZEIT laden (Node.js Kontext).
 * Wird NUR in loader()-Funktionen und react-router.config.ts verwendet.
 * Im Browser läuft dieser Code NICHT — dafür existiert cms.service.ts weiterhin.
 *
 * Nutzt firebase-admin (Server SDK) statt des Client-SDKs,
 * da zur Build-Zeit kein Browser vorhanden ist.
 */

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// .env suchen (CWD, ../, ../..) - wichtig für monorepo builds
const possibleEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '..', '.env'),
  path.resolve(process.cwd(), '../..', '.env'),
];

for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

let adminApp: App | null = null;

function getAdminApp(): App {
  if (adminApp) return adminApp;

  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  const projectId = process.env['VITE_FIREBASE_PROJECT_ID'] || process.env['FIREBASE_PROJECT_ID'];

  if (!projectId) {
    throw new Error(
      '[CMS Build] FIREBASE_PROJECT_ID fehlt. Bitte .env prüfen.'
    );
  }

  // Option B: Flachgeklopfte Umgebungsvariablen aus der .env
  if (process.env['FIREBASE_ADMIN_PRIVATE_KEY']) {
    const serviceAccount = {
      projectId: process.env['FIREBASE_ADMIN_PROJECT_ID'] || projectId,
      privateKey: process.env['FIREBASE_ADMIN_PRIVATE_KEY']
        .replace(/^"|"$/g, '') // Gänsefüßchen am Anfang/Ende entfernen
        .replace(/\\n/g, '\n'),
      clientEmail: process.env['FIREBASE_ADMIN_CLIENT_EMAIL'],
    };
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId,
    });
    return adminApp;
  }

  // Option A: Service Account JSON als Umgebungsvariable (für CI/GitHub Actions)
  const serviceAccountJson = process.env['FIREBASE_SERVICE_ACCOUNT_JSON'];
  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId,
    });
    return adminApp;
  }

  // Option B: Application Default Credentials (für lokale Entwicklung mit `gcloud auth`)
  // firebase-admin nutzt automatisch GOOGLE_APPLICATION_CREDENTIALS env var
  adminApp = initializeApp({ projectId });
  return adminApp;
}

function getAdminDb() {
  return getFirestore(getAdminApp());
}

/**
 * Lädt ein einzelnes Firestore-Dokument anhand seines vollen Pfades.
 *
 * @param fullPath - Vollständiger Firestore-Dokumentpfad, z.B. "static_pages/system/legal/impressum"
 * @returns Dokumentdaten oder null wenn nicht gefunden
 *
 * @example
 * const content = await getPageAtBuildTime('static_pages/app/marketing/home');
 */
export async function getPageAtBuildTime(fullPath: string): Promise<Record<string, unknown> | null> {
  try {
    const db = getAdminDb();
    const ref = db.doc(fullPath);
    const snap = await ref.get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as Record<string, unknown>;
  } catch (err) {
    console.error(`[CMS Build] Fehler beim Laden von "${fullPath}":`, err);
    return null;
  }
}

/**
 * Lädt alle Dokument-IDs (slugs) einer Firestore-Collection.
 * Wird in react-router.config.ts genutzt, um dynamische Routen zu ermitteln.
 *
 * @param collectionPath - Firestore-Pfad zur Collection, z.B. "dynamic_pages/blog/documents"
 * @returns Array von Dokument-IDs
 *
 * @example
 * const blogSlugs = await getAllDocIds('dynamic_pages/blog/documents');
 * // → ['erster-beitrag', 'zweiter-beitrag', ...]
 */
export async function getAllDocIds(collectionPath: string): Promise<string[]> {
  try {
    const db = getAdminDb();
    const snap = await db.collection(collectionPath).get();
    return snap.docs.map(d => d.id);
  } catch (err) {
    console.error(`[CMS Build] Fehler beim Laden der Collection "${collectionPath}":`, err);
    return [];
  }
}
