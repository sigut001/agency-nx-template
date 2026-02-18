import { useEffect, useRef } from 'react';
import * as CookieConsent from 'vanilla-cookieconsent';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import { generateConsentConfig } from './CookieLogic';
import { projectConfig } from '../../config/project-config';

// Hardcoded for Demo/Test - in real world this comes from config or env
const GA_MEASUREMENT_ID = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID; 

export const CookieBanner = () => {
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        console.log('🍪 Initializing Cookie Consent...');
        const config = generateConsentConfig(projectConfig);
        
        // Helper to load Analytics
        const manageAnalytics = () => {
             console.log('🍪 Checking Analytics Consent...');
             if (CookieConsent.acceptedCategory('analytics')) {
                 if (!document.getElementById('ga-script')) {
                     const script = document.createElement('script');
                     script.id = 'ga-script';
                     script.async = true;
                     script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
                     document.head.appendChild(script);

                     window.dataLayer = window.dataLayer || [];
                     function gtag(...args: any[]) { window.dataLayer.push(args); }
                     window.gtag = gtag;
                     window.gtag('js', new Date());
                     window.gtag('config', GA_MEASUREMENT_ID);
                     console.log('📊 Google Analytics Loaded via Consent!');
                 }
             }
        };

        CookieConsent.run({
            ...config,
            onFirstConsent: () => manageAnalytics(),
            onConsent: () => manageAnalytics(),
            onChange: () => manageAnalytics()
        }).then(() => {
            console.log('🍪 Cookie Consent is RUNNING.');
            // Deep check
            const ccMain = document.getElementById('cc-main');
            console.log('🍪 #cc-main presence in DOM:', !!ccMain);
            if (ccMain) {
                console.log('🍪 #cc-main visibility:', window.getComputedStyle(ccMain).visibility);
            } else {
                console.log('🍪 Body children count:', document.body.children.length);
                // Log first bit of body
                console.log('🍪 Body HTML sample:', document.body.innerHTML.substring(0, 200));
            }
            
            // Force show if no consent is found (insurance policy)
            if (!CookieConsent.getCookie().consentId) {
                 console.log('🍪 No consent found, calling show()...');
                 CookieConsent.show();
            }
        }).catch(err => {
            console.error('❌ Cookie Consent run FAILED:', err);
        });
    }, []);

    return null; // The library injects its own UI
};

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (command: string, ...args: unknown[]) => void;
  }
}
