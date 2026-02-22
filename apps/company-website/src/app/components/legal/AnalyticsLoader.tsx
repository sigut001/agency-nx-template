import { useEffect } from 'react';
import * as CookieConsent from 'vanilla-cookieconsent';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

interface AnalyticsLoaderProps {
    measurementId: string; // e.g. G-XXXXXXX
}

export const AnalyticsLoader = ({ measurementId }: AnalyticsLoaderProps) => {

    useEffect(() => {
        // Function to inject GA script
        const loadGA = () => {
            if (document.getElementById('ga-script')) return; // Already loaded

            const script = document.createElement('script');
            script.id = 'ga-script';
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
            document.head.appendChild(script);

            window.dataLayer = window.dataLayer || [];
            function gtag(...args: any[]) { window.dataLayer.push(args); }
            window.gtag = gtag;
            window.gtag('js', new Date());
            window.gtag('config', measurementId);

            console.log(`📊 Analytics Loaded (${measurementId})`);
        };

        // Check if already allowed
        if (CookieConsent.acceptedCategory('analytics')) {
            loadGA();
        }

        // Listen for changes (User clicks "Accept" later)
        // vanilla-cookieconsent doesn't expose a simple global listener for this in React outside the run config, 
        // but we can rely on the fact that we passed callbacks in CookieBanner.tsx 
        // OR simply poll/check. 
        // IMPROVEMENT: actually vanilla-cookieconsent 'onChange' in CookieBanner.tsx is where we should probably drive this,
        // BUT for decoupling, let's use the API provided.
        // There isn't a global event listener in v3 API exposed cleanly as a DOM event. 
        // So we will modify `CookieBanner.tsx` to trigger a custom event or use context.
        // FOR NOW: We will modify CookieBanner.tsx to handle the injection directly to keep it simple and robust.

    }, [measurementId]);

    return null;
};
