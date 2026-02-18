import { CookieDefinition } from './cookie-types';

export const COOKIE_CATALOG: Record<string, CookieDefinition> = {
  google_analytics: {
    id: 'google_analytics',
    name: 'Google Analytics 4',
    category: 'analytics',
    provider: 'Google Ireland Ltd.',
    description: 'Used to track website usage and traffic sources.',
    privacyPolicyUrl: 'https://policies.google.com/privacy',
    test: {
      cookies: ['_ga', '_gid'],
      trigger: 'page_load',
      blockedIfConsentMissing: true
    }
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube Video Embeds',
    category: 'marketing',
    provider: 'Google LLC',
    description: 'Used to display embedded videos. Sets cookies for bandwidth estimation and user tracking.',
    privacyPolicyUrl: 'https://policies.google.com/privacy',
    test: {
      cookies: ['VISITOR_INFO1_LIVE', 'YSC'],
      trigger: 'interaction',
      interactionSelector: '[data-cookie-placeholder="youtube"]', // Specific selector we will use in the UI
      blockedIfConsentMissing: true,
      expectedDomain: '.youtube.com'
    }
  }
};
