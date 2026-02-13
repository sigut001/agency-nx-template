# Handover & Operational Guide: Agency NX Template

This document outlines the automated pipeline features and the few manual steps required to maintain a secure and functional environment.

## Automated Features

### 1. Dynamic Test Environments

The pipeline now automatically generates:

- **Unique Test Users**: Created based on the customer slug (e.g., `test-customer-name@qubits-digital.de`).
- **Random Passwords**: Cryptographically secure passwords generated per project.
- **Firebase Preview Channels**: Every CI/CD run deploys to a temporary URL that automatically expires after **1 hour**.

### 2. Secret Synchronization

Credentials generated during initialization are automatically synced to:

- Local `.env` file.
- GitHub Repository Secrets (via `gh secret set`).

## Manual Requirements

### 1. Firebase Initial Setup (ONE-TIME per Project)

Before the pipeline can run successfully, the following must be enabled manually in the Firebase Console:

- **Authentication**: Go to _Build > Authentication > Sign-in method_ and enable **Email/Password**.
- **Firestore**: Go to _Build > Firestore Database_ and click **Create database**. Choose your location (e.g., `europe-west3`) and start in **Test mode** (the pipeline will deploy the correct rules automatically).
- **Analytics**: Go to _Project Settings > Integrations > Google Analytics_ and click **Enable**. This generates the `measurementId` required for tracking.

> [!NOTE]
> These steps currently require manual intervention as they are not supported by the standard Firebase CLI. We have noted this for future automation via Terraform.

### 2. Brevo IP Whitelisting (Initial Setup vs. Ongoing CI)

Brevo has a security feature that restricts API access to "Authorized IPs". The pipeline handles this in two stages:

- **A. INITIAL SETUP (Strict Mode)**:
  Run `npx tsx scripts/test-complete-pipeline.ts --init`.
  - **Action**: You MUST temporarily add your current IP in the Brevo Dashboard under `Security > Authorized IPs` or disable the "Block unknown IPs" setting.
  - **Goal**: Strict validation ensures that your API key and sender identity are correctly configured. The pipeline will FAIL if the IP is blocked.
- **B. ONGOING CI/CD (Fail-Safe Mode)**:
  Normal runs (e.g., `npm run test:pipeline`).
  - **Behavior**: If Brevo returns a 401 (Unauthorized IP) error during CI, it will log a WARNING but will NOT fail the build. This allows the pipeline to proceed while informing you that email validation was skipped.

> [!IMPORTANT]
> **Post-Validation Security**: After a successful `--init` run, remember to **RE-ENABLE** the IP Whitelist in Brevo for maximum security. The pipeline's console output will remind you of this.

### 3. Deployment Permissions

The automated secret sync requires the GitHub CLI (`gh`) to be authenticated and the project to be a Git repository.

- Ensure you have run `gh auth login` on your local machine before running the initialization scripts.

## Running the Pipeline

To verify the entire lifecycle locally, use the appropriate command:

**Initial Setup (Gatekeeper):**

```bash
npx tsx scripts/test-complete-pipeline.ts --init
```

**Standard Verification:**

```bash
npm run test:pipeline
```

This will execute:

1. Test User Setup
2. Service Validation (Firestore, Brevo, ImageKit)
3. Build & SEO Generation
4. Prerendering
5. Deployment to a temporary Firebase Channel
6. E2E Tests against the temporary URL
