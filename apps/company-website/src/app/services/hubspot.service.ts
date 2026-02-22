/**
 * HubSpot Forms API Service
 * Used to submit form data directly to HubSpot CRM.
 */

const HUBSPOT_PORTAL_ID = import.meta.env.VITE_HUBSPOT_PORTAL_ID;
const CONTACT_FORM_GUID = import.meta.env.VITE_HUBSPOT_CONTACT_FORM_GUID;
const REGION = import.meta.env.VITE_HUBSPOT_REGION || 'na1';

export interface HubspotFormData {
  name: string;
  email: string;
  message: string;
  portalId?: string;
  formGuid?: string;
}

export const submitToHubspot = async (data: HubspotFormData) => {
  const portalId = data.portalId || HUBSPOT_PORTAL_ID;
  const formGuid = data.formGuid || CONTACT_FORM_GUID;

  if (!portalId || !formGuid) {
    console.error('HubSpotService: Portal ID or Form GUID missing.');
    return { success: false, error: 'CONFIG_MISSING' };
  }

  const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: [
          { name: 'firstname', value: data.name.split(' ')[0] },
          { name: 'lastname', value: data.name.split(' ').slice(1).join(' ') || '-' },
          { name: 'email', value: data.email },
          { name: 'message', value: data.message }
        ],
        context: {
          pageUri: window.location.href,
          pageName: document.title
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit to HubSpot');
    }

    return { success: true };
  } catch (error: any) {
    console.error('HubSpotService Error:', error);
    return { success: false, error: error.message };
  }
};
