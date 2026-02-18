# Messaging & Brevo Strategy

This document outlines the dual-channel approach for handling customer inquiries in this project.

## Core Approach: Firestore First

All inquiries submitted via the website contact form are stored directly in **Firebase Firestore**. This ensures:

- **Zero Loss**: Even without an email service, messages are never lost.
- **Admin Dashboard**: The customer can view and manage all inquiries within their password-protected admin area.
- **Free Tier**: This approach works within the Firebase Spark (free) plan.

## Optional Channel: Email Notifications (Brevo)

If the customer wishes to receive real-time email notifications, we utilize **Brevo**.

### Requirements

- **Blaze Plan**: To use external APIs like Brevo, Firebase requires the project to be on the **Blaze (Pay-as-you-go) Plan** (requires credit card), as it uses Firebase Functions as a secure bridge.
- **Security**: Brevo API keys are stored as **Private Environment Variables** (no `VITE_` prefix) and are only accessible by the server-side Firebase Functions. This prevents API key theft and spam abuse.

## Configuration (Environment Variables)

The following keys are marked as **Private** and are not exposed to the browser:

- `BREVO_API_KEY`
- `BREVO_SMTP_KEY`
- `BREVO_MAIL` (Sender/Receiver)
- `BREVO_CONTACT_SENDER_NAME`
