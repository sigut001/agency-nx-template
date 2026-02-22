---
description: How to initialize a new customer project from the template
---

# Customer Project Initialization Workflow

Follow these steps to correctly bootstrap a new customer project with full automation.

## 1. Manual Prerequisites (Firebase)

Before starting the pipeline, the project administrator must:

1.  **Auth**: Enable **Email/Password** in the Firebase Console (Build > Authentication).
2.  **Firestore**: Initialize the database in **europe-west3** (Test Mode).
3.  **Analytics**: Enable Google Analytics in **Project Settings > Integrations**. This is mandatory for the initial validation step.

## 2. Brevo Security Configuration (CRITICAL for Initial Run)

To allow the initial service validation to pass, the API must be reachable.

// turbo

1.  Log in to the **Brevo Dashboard**.
2.  Go to `Security > Authorized IPs`.
3.  **Temporarily** add the current execution IP (visible in the terminal output) OR disable "Block unknown IPs".

## 3. Run Initialization Pipeline

Execute the follow-up command to bootstrap the project, create the test user, and verify all services.

// turbo

```bash
npx tsx scripts/test-complete-pipeline.ts --init
```

## 4. Post-Verification Security Hardening

Once the pipeline reports `FULL PIPELINE VERIFIED SUCCESSFULLY`:

1.  **Re-enable** the IP Whitelist in Brevo.
2.  The pipeline is now in "Fail-safe" mode for subsequent CI/CD runs.
3.  Future runs will log warnings for blocked IPs but will not fail.

## 5. Secret Synchronization Check

Verify that secrets are correctly set in the GitHub repository:

- `gh secret list`
