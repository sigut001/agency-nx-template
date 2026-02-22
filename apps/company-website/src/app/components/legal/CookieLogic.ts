import type { CookieConsentConfig, Category, Service } from 'vanilla-cookieconsent';
import * as CookieConsent from 'vanilla-cookieconsent';
import { CookieCategory, CookieDefinition, ProjectConfig } from '../../config/cookie-types';

// Der generierte Katalog wird hier erwartet
// Hinweis: Im echten Build-Prozess wird diese Datei von der Factory injiziert.
import COOKIE_CATALOG_RAW from '../../config/legal/cookie-catalog.json';
const COOKIE_CATALOG = (COOKIE_CATALOG_RAW || {}) as Record<string, CookieDefinition>;

/**
 * Maps our internal categories to the plugin's category structure (German Labels).
 */
const CATEGORY_LABELS_DE: Record<CookieCategory, string> = {
  essential: 'Technisch notwendig',
  analytics: 'Analyse & Statistik',
  marketing: 'Marketing & Externe Medien',
  personalization: 'Personalisierung'
};

const CATEGORY_DESCRIPTIONS_DE: Record<CookieCategory, string> = {
  essential: 'Diese Cookies sind für die Funktion der Website zwingend erforderlich.',
  analytics: 'Helfen uns zu verstehen, wie Besucher mit der Website interagieren.',
  marketing: 'Werden verwendet, um Inhalte von Drittanbietern (z.B. YouTube) anzuzeigen.',
  personalization: 'Speichern Ihre Einstellungen.'
};

export function generateConsentConfig(config: ProjectConfig): CookieConsentConfig {
  
  // 2. Build Categories and Services for the Plugin
  const categories: Record<string, Category> = {};

  (['essential', 'analytics', 'marketing', 'personalization'] as CookieCategory[]).forEach(cat => {
    const servicesForCat: Record<string, Service> = {};
    
    Object.values(COOKIE_CATALOG).forEach(def => {
      if (def.category === cat) {
        servicesForCat[def.id] = {
          label: def.name
        };
      }
    });

    if (Object.keys(servicesForCat).length > 0 || cat === 'essential') {
      categories[cat] = {
        enabled: cat === 'essential', 
        readOnly: cat === 'essential',
        services: servicesForCat
      };
    }
  });

  // 3. Helper to generate category blocks
  const getCategoryBlocks = (lang: 'de' | 'en') => {
    const blocks: any[] = [];
    (['essential', 'analytics', 'marketing', 'personalization'] as CookieCategory[]).forEach(cat => {
      const categoryConfig = categories[cat];
      if (categoryConfig) {
        blocks.push({
          title: lang === 'de' ? CATEGORY_LABELS_DE[cat] : (cat.charAt(0).toUpperCase() + cat.slice(1)),
          description: lang === 'de' ? CATEGORY_DESCRIPTIONS_DE[cat] : `Manage your ${cat} cookies.`,
          linkedCategory: cat
        });
      }
    });
    return blocks;
  };

  return {
    guiOptions: {
      consentModal: {
        layout: 'box',
        position: 'bottom right',
        equalWeightButtons: true,
        flipButtons: false
      },
      preferencesModal: {
        layout: 'box',
        position: 'right',
        equalWeightButtons: true,
        flipButtons: false
      }
    },
    categories: categories,
    language: {
      default: 'de',
      translations: {
        de: {
          consentModal: {
            title: 'Cookie-Einstellungen',
            description: 'Wir nutzen Cookies für Analytics und Marketing.',
            acceptAllBtn: 'Alle akzeptieren',
            acceptNecessaryBtn: 'Nur notwendige akzeptieren',
            showPreferencesBtn: 'Einstellungen verwalten',
            footer: '<a href="/impressum">Impressum</a> <a href="/datenschutz">Datenschutz</a>',
          },
          preferencesModal: {
            title: 'Cookie-Einstellungen',
            acceptAllBtn: 'Alle akzeptieren',
            acceptNecessaryBtn: 'Nur notwendige akzeptieren',
            savePreferencesBtn: 'Einstellungen speichern',
            closeIconLabel: 'Schließen',
            serviceCounterLabel: 'Dienste',
            sections: [
              {
                title: 'Cookie-Nutzung',
                description: 'Wir verwenden Cookies, um die Benutzererfahrung zu verbessern.',
              },
              ...getCategoryBlocks('de')
            ],
          },
        },
        en: {
          consentModal: {
            title: 'Cookie Settings',
            description: 'We use cookies for analytics and marketing.',
            acceptAllBtn: 'Accept All',
            acceptNecessaryBtn: 'Accept Necessary',
            showPreferencesBtn: 'Manage Settings',
            footer: '<a href="/impressum">Imprint</a> <a href="/datenschutz">Privacy Policy</a>',
          },
          preferencesModal: {
            title: 'Cookie Settings',
            acceptAllBtn: 'Accept All',
            acceptNecessaryBtn: 'Accept Necessary',
            savePreferencesBtn: 'Save Settings',
            closeIconLabel: 'Close',
            serviceCounterLabel: 'Services',
            sections: [
              {
                title: 'Cookie Usage',
                description: 'We use cookies to improve user experience.',
              },
              ...getCategoryBlocks('en')
            ],
          },
        }
      },
    }
  };
}

/**
 * Executes the script snippets for all services that belong to an accepted category.
 */
export function runActiveServices() {
  console.log('[CookieLogic] Checking for services to inject...');
  
  Object.values(COOKIE_CATALOG).forEach(service => {
    // Check if the specific service is accepted (not just the category)
    if (CookieConsent.acceptedService(service.id, service.category)) {
      // Skip injection if snippet is empty (e.g. for essential consent cookie)
      if (!service.snippet) return;

      const scriptId = `cc-script-${service.id}`;
      
      if (!document.getElementById(scriptId)) {
        console.log(`[CookieLogic] Injecting script for: ${service.name}`);
        
        // Snippet kann mehrere Tags enthalten, daher nutzen wir ein temporäres Element
        const temp = document.createElement('div');
        
        let snippetRaw = service.snippet;
        // Dynamisch Platzhalter ersetzen, falls vorhanden (z. B. für HubSpot)
        if (snippetRaw.includes('{{PORTAL_ID}}')) {
          snippetRaw = snippetRaw.replace('{{PORTAL_ID}}', import.meta.env.VITE_HUBSPOT_PORTAL_ID || '');
        }
        if (snippetRaw.includes('{{REGION}}')) {
          snippetRaw = snippetRaw.replace('{{REGION}}', import.meta.env.VITE_HUBSPOT_REGION || 'eu1');
        }

        temp.innerHTML = snippetRaw;
        
        Array.from(temp.childNodes).forEach(node => {
          if (node.nodeName === 'SCRIPT') {
            const script = document.createElement('script');
            const original = node as HTMLScriptElement;
            
            // Attribute kopieren (async, src etc.)
            Array.from(original.attributes).forEach(attr => {
              script.setAttribute(attr.name, attr.value);
            });
            
            // Content kopieren
            script.innerHTML = original.innerHTML;
            script.id = scriptId;
            
            document.head.appendChild(script);
          }
        });
      }
    } else {
      // Opt-Out / Revoke Logic
      const scriptId = `cc-script-${service.id}`;
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        console.warn(`[CookieLogic] Revoking service: ${service.name}. Triggering page reload to clear state...`);
        
        // Cookies löschen (Best Effort)
        service.test.cookies.forEach(cookieName => {
           CookieConsent.eraseCookies(cookieName);
        });

        // Hard Reload, um bereits geladenes JS aus dem Speicher zu werfen
        window.location.reload();
        return; // Stoppe weitere Verarbeitung
      }
    }
  });
}
/**
 * Utility to open the preferences modal from anywhere in the app.
 */
export function showCookiePreferences() {
  CookieConsent.showPreferences();
}
