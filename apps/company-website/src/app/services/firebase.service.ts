import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

// Diese Konfiguration wird später durch echte Werte ersetzt
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app: FirebaseApp;
let analytics: Analytics;

export const initFirebase = async () => {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    
    // Initialize Analytics if supported
    if (typeof window !== 'undefined') {
        const supported = await isSupported();
        if (supported && firebaseConfig.measurementId) {
            analytics = getAnalytics(app);
            console.log('📊 Firebase Analytics initialized.');
        }
    }
    // Initialize Firestore with long-polling to prevent connectivity issues on localhost
    initializeFirestore(app, {
        experimentalForceLongPolling: true
    });
  } else {
    app = getApps()[0];
  }
  return app;
};

export const getFirebaseApp = () => app || initializeApp(firebaseConfig);
export const getFirebaseAuth = () => getAuth(getFirebaseApp());
export const getFirebaseDb = () => getFirestore(getFirebaseApp());
export const getFirebaseAnalytics = () => analytics;
