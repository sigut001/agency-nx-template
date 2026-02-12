# 🔥 Firebase Setup für Kundenprojekte

## 📋 Erforderliche Credentials

### 1. Firebase Service Account Key (KRITISCH für Automatisierung)

**Was ist das?**
Ein JSON-File mit Admin-Rechten für dein Firebase-Projekt. Ermöglicht automatisches Deployment von Security Rules und User-Management.

**Wo bekomme ich das?**

1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Wähle dein Projekt (z.B. `test-angular-automation`)
3. ⚙️ **Project Settings** → **Service Accounts**
4. Klicke **"Generate new private key"**
5. Speichere als `firebase-service-account.json` im Projekt-Root

**Wichtig:**

- ⚠️ **NIEMALS committen!** (ist bereits in `.gitignore`)
- Für CI/CD: Als GitHub Secret `FIREBASE_SERVICE_ACCOUNT` speichern

---

## 🚀 Initialisierung eines neuen Kundenprojekts

### Schritt 1: Firebase CLI & Dependencies installieren

```bash
npm install
```

### Schritt 2: Service Account Key platzieren

```bash
# Kopiere firebase-service-account.json ins Projekt-Root
cp /path/to/downloaded/firebase-service-account.json ./
```

### Schritt 3: Vollständige Initialisierung ausführen

```bash
npm run init:firebase
```

**Das Skript führt automatisch aus:**

- ✅ Deployment der Firestore Security Rules
- ✅ Seeding der initialen CMS-Daten (Navigation, Config)
- ✅ Validierung der Firebase-Verbindung

### Schritt 4: Ersten Owner-Account erstellen

```bash
npm run create:owner
```

**Interaktive Eingabe:**

- Owner Email
- Password (min. 6 Zeichen)
- Display Name

---

## 🔐 GitHub Actions Setup (für CI/CD)

### Required Secrets

Gehe zu **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**

Füge folgende Secrets hinzu:

| Secret Name                 | Wert                      | Beschreibung                        |
| --------------------------- | ------------------------- | ----------------------------------- |
| `FIREBASE_SERVICE_ACCOUNT`  | Kompletter JSON-Inhalt    | Service Account Key (gesamte Datei) |
| `VITE_FIREBASE_PROJECT_ID`  | `test-angular-automation` | Firebase Project ID                 |
| `VITE_FIREBASE_API_KEY`     | Aus `.env`                | Firebase Web API Key                |
| `VITE_FIREBASE_AUTH_DOMAIN` | Aus `.env`                | Firebase Auth Domain                |

### Automatisches Rules-Deployment

Der Workflow `.github/workflows/deploy-firebase-rules.yml` deployt automatisch bei:

- ✅ Push auf `main` Branch (wenn `firestore.rules` geändert wurde)
- ✅ Manueller Trigger via "Actions" Tab

---

## 📦 NPM Scripts Übersicht

```json
{
  "init:firebase": "Vollständige Firebase-Initialisierung",
  "create:owner": "Ersten Owner-Account erstellen",
  "deploy:rules": "Nur Security Rules deployen",
  "seed:cms": "Nur CMS-Daten seeden"
}
```

---

## 🧪 Lokales Testen mit Firebase Emulator

### Emulator starten

```bash
firebase emulators:start
```

### Vorteile:

- Keine echten Firebase-Kosten
- Schnelleres Testing
- Isolierte Entwicklungsumgebung

### Konfiguration

Erstelle `firebase.json` mit:

```json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

---

## ⚠️ Troubleshooting

### "Permission denied" beim Rules-Deployment

**Problem:** Service Account hat keine Rechte  
**Lösung:**

1. Firebase Console → IAM & Admin
2. Service Account suchen
3. Rolle hinzufügen: **"Firebase Rules Admin"**

### "Project not found"

**Problem:** Falsche Project ID  
**Lösung:**

```bash
# Prüfe .env
cat .env | grep VITE_FIREBASE_PROJECT_ID

# Setze explizit
firebase use test-angular-automation
```

### Rules werden nicht übernommen

**Problem:** Caching  
**Lösung:**

- Warte 1-2 Minuten
- Lösche Browser-Cache
- Deploye erneut

---

## 🎯 Checkliste für neues Kundenprojekt

- [ ] Firebase-Projekt in Console erstellt
- [ ] Service Account Key heruntergeladen
- [ ] `.env` mit Firebase-Config ausgefüllt
- [ ] `npm install` ausgeführt
- [ ] `npm run init:firebase` erfolgreich
- [ ] `npm run create:owner` ausgeführt
- [ ] GitHub Secrets konfiguriert
- [ ] Erster Login im Admin-Panel getestet
- [ ] Security Rules in Firebase Console verifiziert

---

## 📚 Weiterführende Dokumentation

- [Firebase Security Rules Reference](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
