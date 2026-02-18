import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

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

export const initFirebase = async () => {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    getAuth(app);
    
    /* 
    // Initialize Analytics if supported
    // Note: We currently load Analytics via CookieBanner.tsx for GDPR compliance
    if (typeof window !== 'undefined') {
        const { getAnalytics, isSupported } = await import('firebase/analytics');
        const supported = await isSupported();
        if (supported && firebaseConfig.measurementId) {
            getAnalytics(app);
        }
    }
    */
    
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
export const getFirebaseAnalytics = () => {
    // Analytics is currently handled via manual injection in CookieBanner.tsx 
    // to ensure user consent before any tracking starts.
    return undefined; 
};
