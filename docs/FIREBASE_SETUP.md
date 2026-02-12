# Firebase Setup & Deployment Guide

## 🚀 Initiales Firebase-Projekt Setup

### 1. Firebase CLI installieren

```bash
npm install -g firebase-tools
```

### 2. Firebase Login

```bash
firebase login
```

### 3. Firebase-Projekt initialisieren

```bash
firebase init
```

**Wähle aus:**

- ✅ Firestore (Database)
- ✅ Hosting (Optional, für Deployment)

**Wichtig:**

- Wähle dein existierendes Projekt: `test-angular-automation`
- Firestore Rules: `firestore.rules` (bereits vorhanden)
- Firestore Indexes: `firestore.indexes.json` (bereits vorhanden)

### 4. Projekt auswählen

```bash
firebase use test-angular-automation
```

---

## 🔒 Security Rules Deployment

### Automatisches Deployment

```bash
npx jiti scripts/deploy-firebase-rules.ts
```

### Manuelles Deployment

```bash
firebase deploy --only firestore:rules
```

### Nur Rules validieren (ohne Deployment)

```bash
firebase deploy --only firestore:rules --dry-run
```

---

## 🧪 Security Rules Testen

### Lokaler Emulator

```bash
firebase emulators:start --only firestore
```

### Rules Playground

1. Öffne Firebase Console
2. Gehe zu **Firestore Database** → **Rules**
3. Klicke auf **Rules Playground**
4. Teste verschiedene Szenarien:
   - Owner erstellt neuen User
   - Editor bearbeitet Page
   - Unauthenticated User liest Page

---

## 📋 Firestore Security Rules Übersicht

### Users Collection

- **Read**: Eigenes Profil oder als Owner alle Profile
- **Create/Update**: Nur Owner
- **Delete**: Nur Owner

### Pages Collection

- **Read**: Öffentlich (für SSG)
- **Create/Update**: Owner & Editor
- **Delete**: Nur Owner

### Pages History Sub-Collection

- **Read**: Öffentlich
- **Create**: Owner & Editor
- **Delete**: Nur Owner

### Config Collection

- **Read**: Öffentlich
- **Update**: Nur Owner
- **Delete**: Verboten

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

Die Rules werden automatisch deployed bei:

- Push auf `main` Branch
- Manueller Trigger via Workflow Dispatch

### Workflow-Datei

`.github/workflows/deploy-firebase.yml` (wird noch erstellt)

---

## ⚠️ Troubleshooting

### "Permission denied" beim User-Erstellen

**Problem**: `ensure-test-user.ts` schlägt fehl  
**Lösung**:

1. Rules deployen: `npx jiti scripts/deploy-firebase-rules.ts`
2. Ersten User manuell in Firebase Console als 'owner' anlegen
3. Danach funktioniert die automatische User-Erstellung

### "Insufficient permissions"

**Problem**: Firestore-Operationen werden blockiert  
**Lösung**:

- Prüfe ob Rules deployed sind
- Prüfe ob User-Rolle korrekt in Firestore gesetzt ist

### Rules werden nicht übernommen

**Problem**: Änderungen an Rules sind nicht aktiv  
**Lösung**:

- Warte 1-2 Minuten (Propagation)
- Deploye erneut: `firebase deploy --only firestore:rules`
