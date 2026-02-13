/**
 * MailService based on Brevo API (V3)
 * Used to avoid Firebase Cloud Functions (and related credit card requirements)
 * 
 * NOTE: For production, this should ideally be proxied through a small 
 * backend or Edge Function to keep the API key safe.
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const API_KEY = import.meta.env.VITE_BREVO_API_KEY;
const DEFAULT_SENDER_EMAIL = import.meta.env.VITE_BREVO_DEFAULT_SENDER_EMAIL;
const DEFAULT_SENDER_NAME = import.meta.env.VITE_BREVO_DEFAULT_SENDER_NAME;

export interface MailData {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  sender?: { email: string; name?: string };
}

export const sendMail = async (data: MailData) => {
  if (!API_KEY || API_KEY === 'placeholder') {
    console.error('MailService: Brevo API Key not configured.');
    return { success: false, error: 'API_KEY_MISSING' };
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': API_KEY,
      },
      body: JSON.stringify({
        sender: data.sender || { 
          email: DEFAULT_SENDER_EMAIL || 'noreply@agency-template.com', 
          name: DEFAULT_SENDER_NAME || 'Agency Template' 
        },
        to: data.to,
        subject: data.subject,
        htmlContent: data.htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send email');
    }

    return { success: true };
  } catch (error: any) {
    console.error('MailService Error:', error);
    return { success: false, error: error.message };
  }
};
