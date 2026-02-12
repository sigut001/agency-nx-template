# 🔐 Firebase Service Account - Wichtige Sicherheitshinweise

## ✅ Service Account = Pro Projekt (NICHT pro Agentur!)

### Wie funktioniert das?

Wenn du in deinem Agentur-Account ein neues Firebase-Projekt erstellst:

```
Agentur-Account (qubits-digital)
├── Projekt: kunde-a-website
│   └── Service Account Key: kunde-a-service-account.json
│       → Funktioniert NUR für kunde-a-website
│       → Kein Zugriff auf andere Projekte
│
├── Projekt: kunde-b-shop
│   └── Service Account Key: kunde-b-service-account.json
│       → Funktioniert NUR für kunde-b-shop
│       → Kein Zugriff auf andere Projekte
│
└── Projekt: test-angular-automation
    └── Service Account Key: test-angular-automation-key.json
        → Funktioniert NUR für test-angular-automation
        → Kein Zugriff auf andere Projekte
```

### 🛡️ Sicherheitsgarantien

1. **Projekt-Isolation**: Jeder Service Account Key ist auf EIN spezifisches Firebase-Projekt beschränkt
2. **Keine Agentur-Rechte**: Der Key gibt KEINE Rechte auf deinen Agentur-Account
3. **Kunden-Sicherheit**: Kunde A kann niemals auf Daten von Kunde B zugreifen
4. **Revozierbar**: Du kannst jeden Key jederzeit in der Firebase Console widerrufen

---

## 📋 Workflow: Neues Kundenprojekt anlegen

### 1. Firebase-Projekt erstellen

```
Firebase Console → "Add Project"
- Projekt-Name: kunde-xyz-website
- Owner: dein-agentur-account@qubits-digital.de
```

### 2. Service Account Key generieren

```
Projekt-Einstellungen → Service Accounts
→ "Generate new private key"
→ Speichern als: kunde-xyz-service-account.json
```

### 3. In Kundenprojekt integrieren

```bash
# Im Kunden-Repository
cp ~/Downloads/kunde-xyz-service-account.json ./firebase-service-account.json

# Initialisierung
npm run init:firebase
npm run create:owner
```

### 4. GitHub Secrets setzen

```
Repository Settings → Secrets
→ FIREBASE_SERVICE_ACCOUNT: [Inhalt von kunde-xyz-service-account.json]
→ VITE_FIREBASE_PROJECT_ID: kunde-xyz-website
```

---

## ⚠️ Was du NIEMALS tun solltest

❌ **Einen Service Account Key für mehrere Projekte verwenden**

- Technisch unmöglich (Key ist projekt-gebunden)

❌ **Service Account Key committen**

- Bereits in `.gitignore`
- Trotzdem: Immer doppelt prüfen!

❌ **Denselben Key in mehreren Repositories verwenden**

- Jedes Kundenprojekt = eigenes Firebase-Projekt = eigener Key

---

## ✅ Best Practices

### Für Entwicklung

```bash
# Lokale Datei (nicht committen!)
./firebase-service-account.json
```

### Für CI/CD

```bash
# GitHub Secret
FIREBASE_SERVICE_ACCOUNT

# Wird zur Laufzeit als Datei erstellt:
echo '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}' > firebase-service-account.json
```

### Für Produktion

```bash
# Umgebungsvariable auf Server
export FIREBASE_SERVICE_ACCOUNT_KEY=/secure/path/to/key.json
```

---

## 🔍 Service Account Key verifizieren

### Welches Projekt?

```bash
cat firebase-service-account.json | grep project_id
# Output: "project_id": "kunde-xyz-website"
```

### Berechtigungen prüfen

```bash
# In Firebase Console
IAM & Admin → Service Accounts
→ Suche nach: firebase-adminsdk-xxxxx@kunde-xyz-website.iam.gserviceaccount.com
→ Rollen: "Firebase Admin SDK Administrator Service Agent"
```

---

## 🚨 Notfall: Key kompromittiert

### Sofort-Maßnahmen

1. **Firebase Console öffnen**
2. **Project Settings → Service Accounts**
3. **"Manage service account permissions" → Google Cloud Console**
4. **Service Account auswählen → "Delete"**
5. **Neuen Key generieren**
6. **GitHub Secrets aktualisieren**

### Automatische Rotation (Optional)

```bash
# Alle 90 Tage neuen Key generieren
# Via GitHub Actions Workflow (Beispiel in docs/advanced/)
```

---

## 📚 Weiterführende Links

- [Firebase Service Accounts Explained](https://firebase.google.com/docs/admin/setup#initialize-sdk)
- [Google Cloud IAM Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)
- [Securing Service Account Keys](https://cloud.google.com/iam/docs/best-practices-for-securing-service-accounts)
