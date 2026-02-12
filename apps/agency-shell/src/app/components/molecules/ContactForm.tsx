import React, { useState } from 'react';
import { sendMail } from '../../services/mail.service';

export const ContactForm: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      // 1. reCAPTCHA ausführen
      const { RecaptchaService } = await import('../../services/recaptcha.service');
      const token = await RecaptchaService.execute('contact_form');
      
      if (!token && import.meta.env.PROD) {
        throw new Error('reCAPTCHA verification failed');
      }

      // 2. Mail senden via Brevo API
      const result = await sendMail({
        to: [{ email: 'vertrieb@qubits-digital.de', name: 'Sales Team' }],
        subject: `Anfrage von ${formData.name}`,
        htmlContent: `
          <h3>Neue Kontaktanfrage</h3>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>E-Mail:</strong> ${formData.email}</p>
          <p><strong>Nachricht:</strong><br/>${formData.message}</p>
        `,
        sender: { email: 'vertrieb@qubits-digital.de', name: 'Website Contact' }
      });

      if (result.success) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Submit Error:', error);
      setStatus('error');
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input 
          type="text" 
          id="name" 
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required 
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">E-Mail</label>
        <input 
          type="email" 
          id="email" 
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required 
        />
      </div>
      <div className="form-group">
        <label htmlFor="message">Nachricht</label>
        <textarea 
          id="message" 
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          required
        ></textarea>
      </div>
      
      <button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Wird gesendet...' : 'Senden'}
      </button>

      {status === 'success' && <p className="success-msg">Vielen Dank! Ihre Nachricht wurde gesendet.</p>}
      {status === 'error' && <p className="error-msg">Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.</p>}
    </form>
  );
};
