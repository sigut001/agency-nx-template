/**
 * ROOT LAYOUT — React Router v7 Framework Mode Root
 *
 * Das ist der äußerste Container der gesamten App.
 * Er stellt <html>, <head> und <body> bereit, initialisiert Cookie Consent
 * und rendert alle Routen über <Outlet />.
 *
 * RR7 Framework Mode generiert automatisch:
 *  - Client-Side JS Entry
 *  - Server-Side Render Entry (für statische HTML-Generierung)
 *  - <Scripts /> injiziert automatisch die richtigen Bundles
 */

import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { useEffect } from 'react';

// Cookie Consent
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsent from 'vanilla-cookieconsent';
import { generateConsentConfig, runActiveServices } from './app/components/legal/CookieLogic';
import { projectConfig } from './app/config/project-config';
import { initFirebase } from './app/services/firebase.service';

// Global CSS
import './styles.css';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <base href="/" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-text transition-colors duration-300">
        {children}
        <ScrollRestoration />
        <Scripts />
        {/* Explicit Root for Cookie Consent to avoid body injection issues */}
        <div id="cc-root"></div>
      </body>
    </html>
  );
}

export default function Root() {
  useEffect(() => {
    console.error('🔥 [ROOT] useEffect EXECUTING ON CLIENT!');
    // Firebase Client SDK initialisieren (nur im Browser)
    try {
      console.error('🔥 [ROOT] Initializing Firebase...');
      initFirebase();
    } catch (e) {
      console.error('❌ [ROOT] Firebase initialization failed:', e);
    }

    try {
      const config = generateConsentConfig(projectConfig);
      
      console.error('🔥 [ROOT] Initializing CookieConsent');
      
      if (typeof window !== 'undefined') {
        (window as any).CookieConsent = CookieConsent;
        (window as any).CC_CONFIG = config;
      }
      
      CookieConsent.run({
        ...config,
        // Explicit Root to avoid React Body Hydration conflicts
        root: '#cc-root',
        onFirstConsent: () => runActiveServices(),
        onConsent: () => runActiveServices(),
        onChange: () => runActiveServices(),
      }).then(() => {
        console.error('🔥 [ROOT] CookieConsent.run() promise RESOLVED');
        
        if (!CookieConsent.getCookie().consentId) {
          console.error('🔥 [ROOT] No consent found, showing banner...');
          CookieConsent.show();
        }
      }).catch(err => {
        console.error('❌ [ROOT] CookieConsent REJECTED:', err);
      });
    } catch (e) {
      console.error('❌ [ROOT] CookieConsent CRASHED:', e);
    }
  }, []);

  return <Outlet />;
}
