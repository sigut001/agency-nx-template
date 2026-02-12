# Phase 14: Automated Customer Project Setup

## 🎯 Ziel

Vollautomatische Erstellung von Kundenprojekten mit einem einzigen Befehl:

```bash
npm run create:customer-project
```

---

## 🔧 Technische Komponenten

### 1. Google Cloud API Integration

**Erforderlich:**

- Google Cloud Service Account (für dein Agentur-Konto)
- Berechtigungen: `Firebase Admin`, `Service Account Admin`

**API-Calls:**

```typescript
// 1. Neues Firebase-Projekt erstellen
POST https://firebase.googleapis.com/v1beta1/projects

// 2. Service Account für Projekt erstellen
POST https://iam.googleapis.com/v1/projects/{projectId}/serviceAccounts

// 3. Service Account Key generieren
POST https://iam.googleapis.com/v1/projects/{projectId}/serviceAccounts/{email}/keys

// 4. Firestore aktivieren
POST https://firestore.googleapis.com/v1/projects/{projectId}/databases
```

---

## 🚀 Verwendung

### Einmalige Agentur-Setup

```bash
npm run setup:agency
# → Fordert agency-automation-key.json an
# → Speichert in ~/.qubits-digital/
```

### Neues Kundenprojekt

```bash
npm run create:customer-project

# Interaktive Prompts:
# Kundenname: Mustermann GmbH
# Domain: mustermann-gmbh.de
# Owner Email: admin@mustermann-gmbh.de

# Output:
# ✅ Firebase-Projekt: mustermann-gmbh-website
# ✅ GitHub Repo: qubits-digital/mustermann-gmbh
# ✅ Service Account Key gespeichert
# ✅ GitHub Secrets konfiguriert
# ✅ Lokales Projekt initialisiert
```

---

## 📚 API-Dokumentation

- [Firebase Management API](https://firebase.google.com/docs/projects/api/reference/rest)
- [Google Cloud IAM API](https://cloud.google.com/iam/docs/reference/rest)
- [GitHub REST API](https://docs.github.com/en/rest)
