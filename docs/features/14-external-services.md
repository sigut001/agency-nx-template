# 🔌 14 - Externe Services & Integrationen

Dieses Dokument beschreibt die externen Dienste, die in unserem Template-Projekt standardmäßig oder optional eingebunden werden. Es erläutert, wie, wann und warum diese Services genutzt werden und welchen konkreten Mehrwert (Features) sie dem Endnutzer bieten.

Zudem enthält es eine detaillierte Analyse zur potenziellen Integration von **HubSpot** und den Möglichkeiten im **Free Plan**, um zu evaluieren, ob bestehende Services dadurch ersetzt werden können.

---

## 1. Aktuell integrierte Services

### 1.1 Firebase (Google Cloud)

- **Status:** Standardmäßig integriert (Core Service)
- **Wann:** Wird bei der Projekt-Initialisierung (`npm run init:firebase`) für jeden Kunden als isoliertes Projekt provisioniert.
- **Warum:** Bietet eine hochskalierbare, sichere und wartungsarme Serverless-Infrastruktur, die alle Backend-Bedürfnisse eines modernen Web-Projekts abdeckt, ohne eigene Server betreiben zu müssen.
- **Features für den Endnutzer / Webseitenbetreiber:**
  - **Hosting (CDN):** Globale, extrem schnelle Auslieferung der Webseite.
  - **Firestore (Datenbank):** Sichere und ausfallsichere Speicherung aller Inhalte (CMS-Daten) und eingehenden Kontaktanfragen. Keine Anfrage geht verloren.
  - **Authentication:** Sicherer Login-Bereich (Admin-Panel) für den Webseitenbetreiber zur Inhaltsverwaltung.

### 1.2 Brevo (ehem. Sendinblue)

- **Status:** Optional integriert (erfordert Firebase Blaze Plan für Cloud Functions)
- **Wann:** Wird aktiviert, wenn der Kunde automatisierte E-Mail-Workflows benötigt (z.B. nach dem Absenden eines Kontaktformulars).
- **Warum:** Firebase bietet out-of-the-box keinen SMTP-Server für den sicheren E-Mail-Versand. Brevo bietet ein starkes Free-Tier mit guten Deliverability-Raten für Transaktions-E-Mails.
- **Features für den Endnutzer / Webseitenbetreiber:**
  - **Echtzeit-Benachrichtigung:** Sofortige E-Mail an den Webseitenbetreiber bei neuen Leads.
  - **Autoresponder:** Professionelle, automatische Eingangsbestätigungen an den Interessenten.

---

## 2. Analyse: HubSpot Integration (Free Plan)

Die Überlegung steht im Raum, **HubSpot** als zentralen Service anzubinden. Im Folgenden wird das **HubSpot Free CRM** detailliert analysiert.

### Welche Features bietet der HubSpot Free Plan?

Der Free Plan von HubSpot ist für kleine bis mittlere Unternehmen sehr großzügig und umfasst:

1. **CRM (Customer Relationship Management):**
   - Verwaltung von bis zu 1.000.000 Kontakten und Unternehmen.
   - Visuelles Pipeline-Management (Deal-Tracking), um den Status von Anfragen (z.B. "Neu", "In Verhandlung", "Gewonnen") abzubilden.
   - Activity-Tracking (Notizen, Anrufe, E-Mails direkt am Kontakt protokollieren).

2. **Formulare & Lead-Generierung:**
   - Erstellung von direkt einbettbaren Formularen für die Webseite.
   - Alle Einreichungen landen automatisch als strukturierte Kontakte im CRM.

3. **E-Mail-Marketing:**
   - Versand von bis zu 2.000 Marketing-E-Mails pro Monat.
   - Einfache Auto-Follow-Ups nach Formular-Einsendungen.

4. **Zusätzliche Conversion-Tools:**
   - **Meeting Scheduler:** Kunden können direkt freie Termine im Kalender buchen (wie Calendly).
   - **Live Chat:** Kostenloses Live-Chat-Widget für die Webseite.

_Einschränkung:_ Alle kundennahen Assets (Formulare, Meeting-Links, Chat, Marketing-E-Mails) enthalten im Free Plan ein dezentes **"Powered by HubSpot" Branding**.

---

### Kann HubSpot bestehende Services vollständig ersetzen?

Die Integration von HubSpot bietet enormes Potenzial und kann Teile unserer aktuellen Architektur obsolet machen:

#### 1. Formulare & Lead-Management (Früher: Firestore)

- **Bisher:** Wir speichern Kontaktanfragen in Firestore und müssen eine eigene Admin-UI dafür bauen, damit der Kunde diese ansehen und verwalten kann.
- **Mit HubSpot:** Wir binden direkt ein HubSpot-Formular in die Seite ein (oder senden die Daten via API an HubSpot).
- **Vorteil:** **Ja, HubSpot ersetzt hier unser eigenes System.** Wir sparen uns die Entwicklung einer komplexen Lead-Management-UI im eigenen Admin-Panel. Der Kunde nutzt stattdessen die exzellente HubSpot Web-App / Mobile App für die Lead-Verwaltung.

#### 2. E-Mail Benachrichtigungen & Autoresponder (Früher: Brevo)

- **Bisher:** Wir nutzen Cloud Functions + Brevo API, um nach einem Firestore-Eintrag eine E-Mail zu senden.
- **Mit HubSpot:** HubSpot übernimmt automatisch den Versand von Follow-up-E-Mails (Autoresponder) an den Kunden, sobald ein Formular ausgefüllt wurde, und benachrichtigt den Seitenbetreiber per App oder E-Mail.
- **Vorteil:** **Ja, für den Standard-Use-Case (Lead-Generierung) wird Brevo überflüssig.** Zudem muss der Kunde nicht in den kostenpflichtigen Firebase Blaze Plan wechseln, da keine Cloud Functions für den E-Mail-Versand mehr nötig sind.

#### 3. Content Management & Hosting (Firebase)

- **Nein**, Firebase bleibt bestehen. HubSpot bietet im Free Plan kein ausreichendes CMS und Hosting für unsere komplett maßgeschneiderten React/Nx-Architekturen. Firebase befeuert weiterhin das Hosting, das eigentliche Seiten-CMS (Texte, Bilder) und den Admin-Login dafür.

---

## 3. Fazit & Empfehlung

Die Integration von HubSpot in das Standard-Template bietet dem Kunden einen **massiven Mehrwert**, da er ein professionelles CRM direkt integriert bekommt, anstatt nur eine einfache Liste von Anfragen in einem eigenen Admin-Panel zu sehen.

**Empfohlene Architektur-Anpassung:**

1. **Lead-Generierung auslagern:** Kontaktformulare auf der Webseite werden direkt mit HubSpot verknüpft. (Erspart uns die Entwicklung eines Lead-Moduls im Admin-Panel).
2. **Brevo entfernen/optionalisieren:** Für reine Lead-Mails übernimmt HubSpot den Job. Brevo wird nur noch für sehr spezielle, non-marketing Transaktions-E-Mails benötigt.
3. **Kommunikation der Branding-Einschränkung:** Dem Kunden muss kommuniziert werden, dass der HubSpot Free Plan ein kleines Branding mit sich bringt. Möchte er dies nicht, muss er entweder auf HubSpot Starter upgraden oder wir nutzen unseren Fallback (Firebase + Brevo via API).

**Vorbereitung für HubSpot-Integration:**

- Wir benötigen einen Mechanismus zum Einbetten von HubSpot Form-IDs in die Kunden Konfiguration.
- Ein neues Formular-Komponenten-Template für React muss erstellt werden, welches das HubSpot Script asynchron lädt und das Formular rendert.
