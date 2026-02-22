import React, { useEffect } from 'react';

export const HubspotContactForm: React.FC = () => {
  useEffect(() => {
    const scriptId = 'hubspot-form-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://js-eu1.hsforms.net/forms/embed/147862291.js';
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div 
      className="hs-form-frame" 
      data-region="eu1" 
      data-form-id="fbcd6e28-fc9e-4c6c-b293-9f8a10301967" 
      data-portal-id="147862291"
    ></div>
  );
};
