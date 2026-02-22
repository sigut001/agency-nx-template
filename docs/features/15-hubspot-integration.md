# 🤝 15 - HubSpot Integration Guide (Free Plan)

Dieses Dokument beschreibt die Möglichkeiten, Limitierungen und die technische Umsetzung einer **HubSpot Integration** im **Free Plan** für unsere Kundenprojekte.

Da HubSpot seit 2022 klassische API-Keys abgeschafft hat und spezifische Limits im Free-Tier besitzt, ist eine genaue Architektur-Planung notwendig.

---

## 1. Möglichkeiten im Free Plan (Vorausgesetzt: Account existiert)

Wenn wir für einen Kunden einen kostenlosen HubSpot-Account aufsetzen, haben wir programmatischen Zugriff auf folgende Kernbereiche:

### Was geht (API Features):

- **CRM Objekte lesen & schreiben:** Wir können Kontakte, Firmen und Deals (Pipelines) per API erstellen, aktualisieren und abfragen.
- **Formular-Einsendungen (Submissions):** Wir können Daten von unseren eigenen, komplett massgeschneiderten React-Formularen direkt an HubSpot senden, sodass diese als Leads im CRM auftauchen.
- **Rate Limits:** Der Free Plan erlaubt 100 API-Requests pro 10 Sekunden. Für eine normale Unternehmenswebseite ist dies mehr als ausreichend.

## 1. Warum Formulare einmalig "manuell" angelegt werden müssen

Ein großes Ziel war es, Formulare komplett automatisiert per API in HubSpot anzulegen, damit der Kunde nichts tun muss.
**Das ist im HubSpot Free Plan leider technisch nicht möglich.**

- **Der Grund:** HubSpot blockiert die sogenannte _Forms API_ (den Endpunkt zum Erstellen und Verwalten von Formularen) für Free-Nutzer. Diese API ist strikt an die kostenpflichtigen _Marketing Hub_ Pakete (ab Starter/Pro) gebunden.
- **Der Workaround:** Der Kunde (oder wir im Onboarding) muss einmalig in der HubSpot-Weboberfläche auf "Formular erstellen" klicken. Dabei wird eine eindeutige ID generiert (die `formGuid`). Diese ID kopieren wir und nutzen sie fortan in unserem Code.

---

## 2. Frontend-Only Integration (Ganz ohne Firebase Cloud Functions!)

Wir können Formulardaten **direkt aus dem React-Frontend** an HubSpot senden, völlig ohne Backend oder Cloud Functions.

HubSpot bietet hierfür einen speziellen, öffentlichen API-Endpunkt an, der **keine Authentifizierung (keinen Secret Key)** benötigt.

### Wie das funktioniert:

Normale API-Anfragen an das HubSpot CRM benötigen einen sicheren _Private App Token_. Dieser darf nie im Frontend stehen.
Aber für **Formular-Einsendungen** gibt es den öffentlichen Submit-Endpunkt:
`POST https://api.hsforms.com/submissions/v3/integration/submit/:portalId/:formGuid`

### Benötigte öffentliche "Keys":

Um diesen Endpunkt direkt aus dem Frontend aufzurufen, benötigen wir nur zwei IDs, die bei HubSpot als **öffentlich** gelten (sie stehen bei jedem HubSpot-Nutzer auch im HTML-Quellcode der Webseite, wenn ein HubSpot-Script integriert ist):

1. **Portal ID (`portalId`):** Die Account-ID des Kunden (steht oben rechts im HubSpot-Account).
2. **Form GUID (`formGuid`):** Die ID des manuell angelegten Formulars.

Da diese IDs nicht für den Lese-Zugriff auf das CRM genutzt werden können (man kann damit nur Daten _in_ das Formular kippen), ist es absolut sicher, diese direkt in unserer Frontend-App (z.B. als Umgebungsvariablen) zu speichern.

### Die Architektur:

1. **Kein eigenes Backend notwendig:** Wir sparen uns die Firebase Cloud Function komplett.
2. Der Nutzer füllt unser komplett eigenes, im CI-Design des Kunden gestaltetes React-Formular aus.
3. Unser React-Code sendet einen simplen HTTP-POST Request mit den Formulardaten direkt an `api.hsforms.com`.
4. HubSpot erfasst den Lead, ordnet ihn dem CRM zu und verschickt (falls konfiguriert) automatisiert eine Follow-Up E-Mail an den Nutzer.

---

## 3. Limitierungen dieser Methode

Wenn wir diesen öffentlichen, unauthentifizierten Endpunkt aus dem Frontend ansprechen, gilt ein bestimmtes Rate-Limit:

- Maximal **50 Requests pro 10 Sekunden**. (Völlig unproblematisch für normale Webseiten-Formulare).
- Um Spam zu vermeiden, sollten wir im React-Frontend weiterhin ein reCAPTCHA oder Turnstile integrieren, bevor wir den Request an HubSpot feuern.

---

## 4. Antigravity / MCP Unterstützung (Skills)

Basierend auf Recherchen gibt es **keinen** out-of-the-box MCP-Server unter dem Namen `mcp-hubspot` in den Standard-Registries, der magisch alles für uns aufsetzt.

**Unsere Strategie für Automatisierung mit Antigravity:**
Da die HubSpot Form-API extrem simpel ist (ein einziger POST-Request), benötigen wir keinen komplexen Skill.
Wenn wir ein neues Kundenprojekt aufsetzen, könnte Antigravity:

1. Den Code für die Frontend-REST-Aufrufe an HubSpot generieren.
2. Den Entwickler/Kunden auffordern, die `Portal ID` und `Form GUID` in die Umgebungsvariablen einzufügen.
