/**
 * SCRIPT: 04-build-and-test-deploy_c1-static-html-validator.ts
 * 
 * AUFGABE:
 * Lädt den statischen HTML-Inhalt einer URL herunter (ohne JavaScript-Ausführung)
 * und validiert das Vorhandensein von Pflicht-Metadaten (Title, Description).
 * Wird später in die Pipeline integriert, um Test-Deployments zu prüfen.
 * 
 * VERWENDUNG:
 * npx tsx scripts-new/04-build-and-test-deploy/04-build-and-test-deploy_c1-static-html-validator.ts --url <DOMAIN_ODER_URL>
 */

import { JSDOM } from 'jsdom';
import * as path from 'path';

async function validateStaticHtml(targetUrl: string) {
  console.log(`\n🔍 Validating Static HTML for: ${targetUrl}`);
  console.log('--------------------------------------------------');

  try {
    // 1. Download HTML (Bot-ähnlicher Request ohne JS-Ausführung)
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StaticHTMLValidator/1.0; +http://qubits-digital.de)',
        'Accept': 'text/html'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    // 2. Parsen mit JSDOM
    const dom = new JSDOM(html);
    const { document } = dom.window;

    // 3. Tests durchführen
    let success = true;

    // --- TEST 1: TITLE ---
    const titleElement = document.querySelector('title');
    const titleText = titleElement?.textContent;
    if (titleText && titleText.trim().length > 0) {
      console.log(`✅ [TITLE] gefunden: "${titleText.trim()}"`);
    } else {
      console.error('❌ [TITLE] FEHLT oder ist leer!');
      success = false;
    }

    // --- TEST 2: DESCRIPTION ---
    const descMeta = document.querySelector('meta[name="description"]');
    const descContent = descMeta?.getAttribute('content');
    if (descContent && descContent.trim().length > 0) {
      console.log(`✅ [DESCRIPTION] gefunden: "${descContent.trim()}"`);
    } else {
      console.error('❌ [DESCRIPTION] FEHLT oder ist leer!');
      success = false;
    }

    // --- INFO: HTML GRÖSSE ---
    console.log(`\n📄 Dokument geladen (${(html.length / 1024).toFixed(2)} KB)`);
    
    if (success) {
      console.log('\n✨ Validierung ERFOLGREICH: Alle statischen Basistags sind vorhanden.');
      process.exit(0);
    } else {
      console.error('\n❌ Validierung FEHLGESCHLAGEN: Kritische Tags fehlen im statischen HTML.');
      process.exit(1);
    }

  } catch (error: any) {
    console.error(`\n❌ Fehler bei der Validierung: ${error.message}`);
    process.exit(1);
  }
}

// Argument-Parsing
const args = process.argv.slice(2);
const urlArgIndex = args.indexOf('--url');
const url = urlArgIndex !== -1 ? args[urlArgIndex + 1] : null;

if (!url) {
  console.error('❌ Fehler: Bitte eine URL mit --url angeben.');
  console.log('Beispiel: npx tsx scripts-new/04-build-and-test-deploy/04-build-and-test-deploy_c1-static-html-validator.ts --url https://example.com');
  process.exit(1);
}

// Start
validateStaticHtml(url);
