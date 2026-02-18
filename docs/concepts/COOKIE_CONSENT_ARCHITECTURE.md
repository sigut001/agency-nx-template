# 🍪 Cookie Consent Architektur: "The Automated Factory Approach"

Dieses Dokument beschreibt die Strategie für ein automatisiertes, DSGVO-konformes Cookie-Management in unserer Website-Factory.

---

## 1. Das "Factory Pattern" (Warum Config?)

### Das Problem

Wir haben 50 Kundenprojekte.

- Kunde A nutzt Analytics + YouTube.
- Kunde B nutzt nur Analytics.
- Kunde C nutzt gar nichts.

Wenn wir manuell Banner bauen, machen wir Fehler (z.B. Analytics Code drin lassen, obwohl nicht im Banner).

### Die Lösung

Wir trennen **Code** (Logik) von **Konfiguration** (Wunsch).

1.  **Code:** Kennt _alle_ möglichen Dienste (`COOKIE_CATALOG`).
2.  **Config:** Sagt nur "Ja/Nein" (`project.config`).

**Warum Interfaces?**
Damit wir uns nicht vertippen. Wenn der Katalog `google_analytics` heißt, darf die Config nicht `googleAnalytics` heißen. TypeScript erzwingt, dass Config und Katalog matchen.

---

## 2. Die "Test Matrix" (Das Sicherheits-Netz)

Wir müssen sicherstellen, dass die Realität (Website) mit der Konfiguration (Legal) übereinstimmt.
Dazu generieren wir automatisch Tests nach folgender Matrix für **JEDEN** Eintrag im Katalog:

| Config Status         | User Action (Banner) | Erwartetes Ergebnis      | Warum?                                                                                                                 |
| :-------------------- | :------------------- | :----------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **Aktiv** (`true`)    | **Ablehnen**         | 🟢 **Keine Cookies**     | Datenschutz eingehalten?                                                                                               |
| **Aktiv** (`true`)    | **Zustimmen**        | 🟢 **Cookies vorhanden** | Funktioniert das Feature?                                                                                              |
| **Inaktiv** (`false`) | **Ablehnen**         | 🟢 **Keine Cookies**     | Trivial, aber muss stimmen.                                                                                            |
| **Inaktiv** (`false`) | **Zustimmen**        | 🟢 **Keine Cookies**     | **Critical:** Haben wir versehentlich Code (z.B. YouTube Script) drin gelassen, obwohl der Kunde es nicht gebucht hat? |

Dieser Ansatz garantiert, dass wir niemals "heimlich" Cookies setzen.

---

## 3. Das "Trigger"-Konzept

Nicht alle Cookies kommen sofort.

- **Google Analytics:** Kommt sofort beim Laden (sofern Consent da ist). -> Trigger: `PageLoad`.
- **YouTube:** Kommt oft erst, wenn man auf "Play" drückt (Lazy Loading). -> Trigger: `ClickElement`.

Damit der Test nicht fehlschlägt ("Ich habe zugestimmt, aber kein Cookie gefunden!"), müssen wir ihm sagen, was er tun muss, um den Cookie zu provozieren.

---

## 4. Kategorien & UI

Rechtlich (ePrivacy / DSGVO) unterscheiden wir meist:

1.  **Essenziell (Technisch notwendig):**
    - Dürfen nicht abgelehnt werden.
    - Beispiele: Warenkorb, Login-Session, _Die Cookie-Entscheidung selbst_.
    - UI: Checkbox ist ausgegraut & angehakt.

2.  **Marketing / Analytics (Optional):**
    - Müssen aktiv zugestimmt werden (Opt-In).
    - Beispiele: GA4, Facebook Pixel, YouTube Embeds.
    - UI: Checkbox ist leer, User muss klicken (oder "Alle akzeptieren").

Unsere Architektur mapped jeden Dienst im `COOKIE_CATALOG` auf eine dieser Kategorien.

---

## 5. Implementierungs-Pfad

1.  **Typen:** `CookieDefinition`, `TestTrigger`.
2.  **Katalog:** Die Datenbank mit Texten + Test-Logik.
3.  **Config:** Der Schalter pro Projekt.
4.  **UI:** Der React-Wrapper, der Config + Katalog liest.
5.  **Test-Gen:** Das Skript, das die Matrix oben abfährt.
