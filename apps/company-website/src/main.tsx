import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';

// Cookie Consent Imports
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsent from 'vanilla-cookieconsent';
import { generateConsentConfig } from './app/components/legal/CookieLogic';
import { projectConfig } from './app/config/project-config';

// Initialize Cookie Consent immediately
const config = generateConsentConfig(projectConfig);

const manageAnalytics = () => {
    console.log('🍪 Checking Analytics Consent...');
    if (CookieConsent.acceptedCategory('analytics')) {
        console.log('🍪 Consent GIVEN for Analytics. Loading GTAG...');
        if (!document.getElementById('gtag-script')) {
            const script = document.createElement('script');
            script.id = 'gtag-script';
            script.src = `https://www.googletagmanager.com/gtag/js?id=${projectConfig.analyticsId}`;
            script.async = true;
            document.head.appendChild(script);

            const inlineScript = document.createElement('script');
            inlineScript.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${projectConfig.analyticsId}');
            `;
            document.head.appendChild(inlineScript);
        }
    } else {
        console.log('🍪 Consent REJECTED for Analytics.');
    }
};

console.log('🍪 Global Cookie Consent Initialization...');
CookieConsent.run({
    ...config,
    onFirstConsent: () => manageAnalytics(),
    onConsent: () => manageAnalytics(),
    onChange: () => manageAnalytics()
}).then(() => {
    console.log('🍪 Global Cookie Consent is RUNNING.');
}).catch(err => {
    console.error('❌ Global Cookie Consent failed:', err);
});

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <StrictMode>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </StrictMode>,
    );
}
