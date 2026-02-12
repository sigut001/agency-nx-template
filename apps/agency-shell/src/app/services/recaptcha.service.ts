const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export const initRecaptcha = () => {
    if (typeof window !== 'undefined' && siteKey) {
        // reCAPTCHA Enterprise injection logic or hook
    }
};

export const getSiteKey = () => siteKey;

export const RecaptchaService = {
  async execute(action: string): Promise<string | null> {
    
    if (!siteKey || siteKey === 'placeholder') {
      console.warn('reCAPTCHA site key missing. Skipping verification.');
      return 'mock-token';
    }

    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).grecaptcha) {
        (window as any).grecaptcha.ready(() => {
          (window as any).grecaptcha
            .execute(siteKey, { action })
            .then((token: string) => {
              resolve(token);
            });
        });
      } else {
        console.warn('grecaptcha not loaded');
        resolve(null);
      }
    });
  }
};
