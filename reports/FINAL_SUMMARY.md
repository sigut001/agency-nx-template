# 🛡️ Qualitäts-Bericht (V2 Pipeline)

*Generiert am: 22.2.2026, 03:48:05*
*Test-URL: [https://test-angular-automation--p2-728429-z2464vnl.web.app](https://test-angular-automation--p2-728429-z2464vnl.web.app)*

## 🧪 Funktionale Abnahme (E2E Tests)
| Testfall | Status | Details |
| :--- | :---: | :--- |
| Step 00: Bot Perspective (Banner Hidden) | ✅ | PASSED |
| Step 01: Baseline Check (Diagnostic Dump) | ✅ | PASSED |
| Step 02: API Category Staircase UP (Cumulative) | ✅ | PASSED |
| Step 03: API Category Staircase DOWN (Cumulative with Reloads) | ✅ | PASSED |
| Step 04: Minimal UI Assurance (Proof of Connection) | ✅ | PASSED |
| 404: Should show custom error page for non-existent routes | ✅ | PASSED |
| Footer: Should contain links to all legal pages including Lizenzen | ✅ | PASSED |
| SEO: Sitemap and Robots.txt should be accessible | ✅ | PASSED |
| Quality Audit: / | ✅ | PASSED |
| Quality Audit: /kontakt | ✅ | PASSED |
| Quality Audit: /impressum | ✅ | PASSED |
| Quality Audit: /datenschutz | ✅ | PASSED |
| Quality Audit: /agb | ✅ | PASSED |
| Quality Audit: /lizenzen | ✅ | PASSED |
| Quality Audit: /404 | ✅ | PASSED |
| Quality Audit: * | ✅ | PASSED |

## 🔦 Lighthouse Scores
| Kategorie | Score | Status |
| :--- | :--- | :--- |
| **Performance** | 97% | 🟢 |
| **Accessibility** | 96% | 🟢 |
| **Best Practices** | 96% | 🟢 |
| **SEO** | 63% | 🟡 |

> [Detaillierter HTML-Bericht](./lighthouse/audit-2026-02-22.report.html)

## 🔍 Detaillierte Qualitäts-Findings (Lighthouse)
Spezifische Punkte aus der Lighthouse-Analyse:

### 📁 Kategorie: Performance
#### 🔴 First Contentful Paint
**Problem:** First Contentful Paint marks the time at which the first text or image is painted. [Learn more about the First Contentful Paint metric](https://developer.chrome.com/docs/lighthouse/performance/first-contentful-paint/).

**Wert:** `1.8 s`

#### 🔴 Use efficient cache lifetimes
**Problem:** A long cache lifetime can speed up repeat visits to your page.

**Wert:** `Est savings of 78 KiB`

**Betroffene Elemente/Orte:**
- `https://test-angular-automation.firebaseapp.com/__/auth/iframe.js`

#### 🔴 Forced reflow
**Problem:** A forced reflow occurs when JavaScript queries geometric properties (such as offsetWidth) after styles have been invalidated by a change to the DOM state. This can result in poor performance. Learn more about [forced reflows](https://developers.google.com/web/fundamentals/performance/rendering/avoid-large-complex-layouts-and-layout-thrashing#avoid-forced-synchronous-layouts) and possible mitigations.

**Betroffene Elemente/Orte:**
- `Unbekannter Ort`

#### 🔴 Network dependency tree
**Problem:** [Avoid chaining critical requests](https://developer.chrome.com/docs/lighthouse/performance/critical-request-chains) by reducing the length of chains, reducing the download size of resources, or deferring the download of unnecessary resources to improve page load.

**Betroffene Elemente/Orte:**
- `Unbekannter Ort`
- `Unbekannter Ort`
- `Unbekannter Ort`

#### 🔴 Render blocking requests
**Problem:** Requests are blocking the page's initial render, which may delay LCP. [Deferring or inlining](https://web.dev/learn/performance/understanding-the-critical-path#render-blocking_resources) can move these network requests out of the critical path.

**Betroffene Elemente/Orte:**
- `https://test-angular-automation--p2-728429-z2464vnl.web.app/assets/root-Cut7gGuh.css`

#### 🔴 Time to Interactive
**Problem:** Time to Interactive is the amount of time it takes for the page to become fully interactive. [Learn more about the Time to Interactive metric](https://developer.chrome.com/docs/lighthouse/performance/interactive/).

**Wert:** `4.0 s`

#### 🔴 Max Potential First Input Delay
**Problem:** The maximum potential First Input Delay that your users could experience is the duration of the longest task. [Learn more about the Maximum Potential First Input Delay metric](https://developer.chrome.com/docs/lighthouse/performance/lighthouse-max-potential-fid/).

**Wert:** `130 ms`

#### 🔴 Reduce unused JavaScript
**Problem:** Reduce unused JavaScript and defer loading scripts until they are required to decrease bytes consumed by network activity. [Learn how to reduce unused JavaScript](https://developer.chrome.com/docs/lighthouse/performance/unused-javascript/).

**Wert:** `Est savings of 77 KiB`

**Betroffene Elemente/Orte:**
- `https://test-angular-automation--p2-728429-z2464vnl.web.app/assets/root-DJB0S51z.js`
- `https://test-angular-automation--p2-728429-z2464vnl.web.app/assets/chunk-JZWAC4HX-D_Ga21uE.js`
- `https://test-angular-automation--p2-728429-z2464vnl.web.app/assets/entry.client-B3PNv4sd.js`

#### 🔴 Avoid serving legacy JavaScript to modern browsers
**Problem:** Polyfills and transforms enable legacy browsers to use new JavaScript features. However, many aren't necessary for modern browsers. Consider modifying your JavaScript build process to not transpile [Baseline](https://web.dev/baseline) features, unless you know you must support legacy browsers. [Learn why most sites can deploy ES6+ code without transpiling](https://philipwalton.com/articles/the-state-of-es5-on-the-web/)

**Betroffene Elemente/Orte:**
- `https://apis.google.com/_/scs/abc-static/_/js/k=gapi.lb.de.cIr2f3DgAek.O/m=gapi_iframes/rt=j/sv=1/d=1/ed=1/rs=AHpOoo8eiOTTmVyE9N16BmLTiBHajktR2A/cb=gapi.loaded_0?le=scs`

#### 🔴 Serve static assets with an efficient cache policy
**Problem:** A long cache lifetime can speed up repeat visits to your page. [Learn more about efficient cache policies](https://developer.chrome.com/docs/lighthouse/performance/uses-long-cache-ttl/).

**Wert:** `1 resource found`

**Betroffene Elemente/Orte:**
- `https://test-angular-automation.firebaseapp.com/__/auth/iframe.js`

### 📁 Kategorie: Accessibility
#### 🔴 Background and foreground colors do not have a sufficient contrast ratio.
**Problem:** Low-contrast text is difficult or impossible for many users to read. [Learn how to provide sufficient color contrast](https://dequeuniversity.com/rules/axe/4.10/color-contrast).

**Betroffene Elemente/Orte:**
- `<span class="text-xs font-bold uppercase text-primary">`

#### 🔴 Elements with visible text labels do not have matching accessible names.
**Problem:** Visible text labels that do not match the accessible name can result in a confusing experience for screen reader users. [Learn more about accessible names](https://dequeuniversity.com/rules/axe/4.10/label-content-name-mismatch).

**Betroffene Elemente/Orte:**
- `<button type="button" class="flex items-center gap-2 p-2 rounded-lg border-2 border-primary bg-secondar…" aria-label="Toggle Theme" style="min-width:120px">`

### 📁 Kategorie: Best Practices
#### 🔴 Browser errors were logged to the console
**Problem:** Errors logged to the console indicate unresolved problems. They can come from network request failures and other browser concerns. [Learn more about this errors in console diagnostic audit](https://developer.chrome.com/docs/lighthouse/best-practices/errors-in-console/)

**Betroffene Elemente/Orte:**
- `Unbekannter Ort`
- `Unbekannter Ort`
- `Unbekannter Ort`
- `Unbekannter Ort`
- `Unbekannter Ort`
- *...und 1 weitere.*

### 📁 Kategorie: SEO
#### 🔴 Page is blocked from indexing
**Problem:** Search engines are unable to include your pages in search results if they don't have permission to crawl them. [Learn more about crawler directives](https://developer.chrome.com/docs/lighthouse/seo/is-crawlable/).

**Betroffene Elemente/Orte:**
- `Unbekannter Ort`

## 🚦 Pipeline-Status
- [x] Phase 03: Vorbereitung (Sitemap, Prerender): **ERFOLGREICH**
- [x] Phase 04: Funktionale Validierung (E2E-Check): **ERFOLGREICH**
- [x] Phase 05: Performance & Report: **ERFOLGREICH**

---
*Dieser Bericht wurde automatisch durch die v2-Pipeline erstellt.*