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
      </body>
    </html>
  );
}

export default function Root() {
  useEffect(() => {
    console.log('%c[ROOT] BUNDLE EXECUTING ON CLIENT', 'background: #00ff00; color: #000; font-size: 20px;');
    // Firebase Client SDK initialisieren (nur im Browser)
    try {
      initFirebase();
    } catch (e) {
      console.warn('Firebase initialization failed:', e);
    }

    const config = generateConsentConfig(projectConfig);
    console.log('%c[Root] Initializing CookieConsent...', 'color: #00f');
    CookieConsent.run({
      ...config,
      onFirstConsent: () => runActiveServices(),
      onConsent:      () => runActiveServices(),
      onChange:       () => runActiveServices(),
    });
  }, []);

  return <Outlet />;
}
