import type { CookieConsentConfig, Category, Service } from 'vanilla-cookieconsent';
import { COOKIE_CATALOG } from '../../config/cookie-catalog';
import { CookieCategory, ProjectConfig } from '../../config/cookie-types';

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
  
  // 1. Determine active services per category based on config
  const activeServicesByCategory: Record<CookieCategory, Service[]> = {
    essential: [],
    analytics: [],
    marketing: [],
    personalization: []
  };

  // 1.5 Add a default essential service
  activeServicesByCategory.essential.push({
      label: 'Cookie Consent',
      cookies: [{name: /^cc_/}]
  });

  Object.keys(config.features).forEach(featureKey => {
    if (config.features[featureKey]) { // Only if enabled!
      const definition = COOKIE_CATALOG[featureKey];
      if (definition) {
        activeServicesByCategory[definition.category].push({
          label: definition.name,
          cookies: definition.test.cookies.map(name => ({ name }))
        });
      }
    }
  });

  // 2. Build Categories for the Plugin
  const categories: Record<string, Category> = {};

  categories['essential'] = {
    enabled: true,
    readOnly: true
  };

  (['analytics', 'marketing', 'personalization'] as CookieCategory[]).forEach(cat => {
    if (activeServicesByCategory[cat].length > 0) {
      categories[cat] = {
        enabled: false, 
        readOnly: false,
        autoClear: {
            cookies: activeServicesByCategory[cat].flatMap(s => s.cookies ? s.cookies : [])
        }
      };
    }
  });

  // 3. Helper to generate category blocks
  const getCategoryBlocks = (lang: 'de' | 'en') => {
    const blocks: any[] = [];
    (['analytics', 'marketing', 'personalization'] as CookieCategory[]).forEach(cat => {
      if (categories[cat]) {
        blocks.push({
          title: lang === 'de' ? CATEGORY_LABELS_DE[cat] : (cat.charAt(0).toUpperCase() + cat.slice(1)),
          description: lang === 'de' ? CATEGORY_DESCRIPTIONS_DE[cat] : `Manage your ${cat} cookies.`,
          toggle: { value: cat, enabled: false, readonly: false }
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
