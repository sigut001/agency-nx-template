import { getFirebaseAnalytics } from './firebase.service';
import { logEvent as firebaseLogEvent } from 'firebase/analytics';

export const AnalyticsService = {
  logEvent(eventName: string, params?: Record<string, any>) {
    const analytics = getFirebaseAnalytics();
    if (analytics) {
      firebaseLogEvent(analytics, eventName, params);
    } else {
      console.log(`[Analytics Mock] Event: ${eventName}`, params);
    }
  },

  setConsent(consent: { analytics_storage?: 'granted' | 'denied' }) {
    // In einer echten Implementierung würde hier setConsent von Firebase aufgerufen
    console.log('[Analytics Mock] Consent set:', consent);
  }
};
