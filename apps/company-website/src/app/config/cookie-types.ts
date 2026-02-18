export type CookieCategory = 'essential' | 'analytics' | 'marketing' | 'personalization';

export type CookieTrigger = 'page_load' | 'interaction';

export interface CookieTestScenario {
  /**
   * List of cookie names that should appear (e.g. ['_ga', '_gid'])
   */
  cookies: string[];
  /**
   * When is the cookie expected to be set?
   * 'page_load' -> Immediately after consent
   * 'interaction' -> After clicking a specific element
   */
  trigger: CookieTrigger;
  /**
   * CSS selector for the interaction (required if trigger is 'interaction')
   * e.g. '.video-placeholder'
   */
  interactionSelector?: string;
  /**
   * If true, this cookie is expected to be BLOCKED if consent is NOT given.
   * (Should be true for almost all non-essential cookies)
   */
  blockedIfConsentMissing: boolean;
  /**
   * Domain where the cookie is set (useful for third-party checks)
   * e.g. '.youtube.com' or 'localhost'
   */
  expectedDomain?: string;
}

export interface CookieDefinition {
  id: string;
  name: string;
  category: CookieCategory;
  provider: string;
  description: string;
  /**
   * Technical details for the Test Automation
   */
  test: CookieTestScenario;
  /**
   * Technical details for the Banner (optional, maybe links to policy)
   */
  privacyPolicyUrl?: string;
}

export interface ProjectConfig {
  features: {
    [key: string]: boolean;
  };
  analyticsId?: string;
}
