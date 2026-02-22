import React, { useEffect, useRef } from "react";

export const HubspotNewsletterForm: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scriptId = 'hubspot-v2-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = '//js-eu1.hsforms.net/forms/embed/v2.js';
      script.type = 'text/javascript';
      script.charset = 'utf-8';
      document.body.appendChild(script);
    }

    const loadForm = () => {
      // @ts-ignore
      if (window.hbspt && containerRef.current) {
        containerRef.current.innerHTML = '';
        // @ts-ignore
        window.hbspt.forms.create({
          portalId: '147862291',
          formId: '0652c720-2dad-4e92-bc21-dff1a3e0ba92',
          region: 'eu1',
          target: '#hubspot-newsletter-container'
        });
      }
    };

    script.addEventListener('load', loadForm);
    
    // @ts-ignore
    if (window.hbspt) {
      loadForm();
    }

    return () => {
      script.removeEventListener('load', loadForm);
    };
  }, []);

  return <div id="hubspot-newsletter-container" ref={containerRef}></div>;
};
