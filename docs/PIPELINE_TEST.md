# Complete Pipeline Test Guide

## 🎯 One-Command Full Validation

```bash
npm run test:pipeline
```

**This single command executes the ENTIRE workflow:**

1. ✅ **Local Validation**
   - Linting
   - Build
   - SEO Generation
   - (Optional: Tests with Firebase)

2. ✅ **Git Workflow**
   - Create feature branch
   - Stage all changes
   - Commit with timestamp
   - Push to GitHub

3. ✅ **Pull Request**
   - Automatic PR creation
   - Descriptive title & body

4. ✅ **GitHub Actions**
   - Monitor CI/CD pipeline
   - Wait for all checks to pass

5. ✅ **Auto-Merge**
   - Enable auto-merge on success
   - Squash commits

---

## 🏗️ Pipeline Architecture & Dependencies

The following graph visualizes the automated dependency resolution. By using NX Targets, any high-level command (like `nx e2e`) will automatically trigger all necessary prerequisites in the correct order.

```mermaid
graph TD
    subgraph P0 ["Phase 0: Base Validation (Parallel)"]
        direction LR
        P1["00: Validate Keys"]
        P2["00: Schema Validation"]
        P3["00: Ensure Test User"]
    end

    subgraph P1_Health ["Phase 1: Service Health (Parallel)"]
        direction LR
        V1["01a: Firebase"]
        V2["01b: Brevo"]
        V3["01c: ImageKit"]
        V4["01d: reCAPTCHA"]
    end

    %% Unified flow from Phase 0 to Phase 1 block
    P0 --> P1_Health

    V5["01e: SEO Metadata Sync"]
    V1 --> V5

    subgraph P2 ["Phase 2: Build & Config (Sequential)"]
        B1["02a: Route Mapping Check"]
        B2["02b: Production Build"]
        B1 --> B2
    end

    %% Convergence before Build Phase
    P1_Health & V5 --> P2

    subgraph P3 ["Phase 3: Generation & Optimization"]
        direction LR
        G1["03: Sitemap & Robots"]
        G2["06: Prerendering"]
        G1 & G2 --> G3["06b: HTML Cleanup"]
    end

    P2 --> P3

    D1["07: Deploy to Firebase Preview"]
    P3 --> D1

    subgraph P5 ["Phase 5: Automated Verification (Parallel)"]
        direction LR
        E1["E2E: Robust Suite"]
        E2["E2E: Cookie Tests"]
        E3["E2E: Admin Suite"]
        E4["09: Lighthouse Audit"]
    end

    E0["Fetch Dynamic Routes Index"]
    D1 --> E0
    E0 --> P5

    R1["10: Unified Reporting"]
    P5 --> R1
```

---

## 📋 What Gets Validated

### Local Checks

- TypeScript compilation
- ESLint rules
- Vite build
- SEO file generation
- (Future: E2E tests, RBAC tests)

### GitHub Actions Checks

- PR validation workflow
- Lint checks
- Build verification
- (Future: Deployment preview)

---

## 🚀 Usage

### For New Customer Projects

```bash
# After initial setup
npm run test:pipeline

# Output:
# 🚀 Starting Complete End-to-End Pipeline
# ═══════════════════════════════════════
# 📋 PHASE 1: Local Validation
# ✅ Linting - Success
# ✅ Building - Success
# ✅ SEO Generation - Success
# 📋 PHASE 2: Git Workflow
# ✅ Create Feature Branch - Success
# ✅ Push to GitHub - Success
# 📋 PHASE 3: Pull Request & GitHub Actions
# ✅ Create Pull Request - Success
# ⏳ Waiting for GitHub Actions...
# ✅ All checks passed
# 📋 PHASE 4: Auto-Merge
# ✅ Auto-merge enabled
# 🎉 Complete Pipeline Test Successful!
```

### Before Client Handover

```bash
npm run test:pipeline
# Ensures everything works end-to-end
```

---

## ⚙️ Configuration

### Required Tools

- `gh` CLI (GitHub CLI)
- Git configured with remote
- GitHub repository with Actions enabled

### Setup

```bash
# Install GitHub CLI
winget install GitHub.cli

# Authenticate
gh auth login
```

---

## 🔧 Customization

Edit `scripts/test-complete-pipeline.ts` to:

- Add more validation steps
- Customize PR template
- Add deployment steps
- Configure merge strategy

---

## 📊 Success Criteria

Pipeline passes when:

- ✅ All local builds succeed
- ✅ No lint errors
- ✅ Git operations complete
- ✅ PR created successfully
- ✅ All GitHub Actions checks pass
- ✅ Auto-merge enabled

---

## 🎯 Purpose

This ensures that **every customer project** is:

- Properly configured
- Passes all quality checks
- Ready for production deployment
- CI/CD pipeline functional

**One command = Full confidence in project state!** 🚀
