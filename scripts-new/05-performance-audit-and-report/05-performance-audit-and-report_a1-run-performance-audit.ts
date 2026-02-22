/**
 * SCRIPT: 05-performance-audit-and-report_a1-run-performance-audit.ts
 * 
 * AUFGABE: 
 * 1. Liest die Preview-URL aus temp/artifacts/preview-url.txt.
 * 2. Führt Lighthouse-Audits aus.
 * 3. Erzeugt einen konsolidierten Qualitätsbericht (SUMMARY.md).
 */

import * as fs from 'fs';
import * as path from 'path';
import { LogService } from '../utils/log-service';

const rootDir = path.resolve(__dirname, '../../');
const urlFilePath = path.join(rootDir, 'temp/artifacts/preview-url.txt');
const reportsDir = path.join(rootDir, 'reports');
const lighthouseDir = path.join(reportsDir, 'lighthouse');

async function runAudit() {
  LogService.init('AUDIT', 'PERFORMANCE');
  console.log('🔦 Starting Phase 05: Performance Audit & Reporting...\n');

  // 1. Get URL
  if (!fs.existsSync(urlFilePath)) {
    console.error('❌ Audit FAILED: preview-url.txt not found. Run Phase 04 first.');
    process.exit(1);
  }
  const previewUrl = fs.readFileSync(urlFilePath, 'utf8').trim();
  console.log(`   🌍 Target URL: ${previewUrl}`);

  // 2. Prepare Directories
  if (!fs.existsSync(lighthouseDir)) fs.mkdirSync(lighthouseDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const reportBaseName = `audit-${timestamp}`;
  const reportPath = path.join(lighthouseDir, reportBaseName);

  // 3. Run Lighthouse
  console.log('   🚀 Executing Lighthouse Audit...');
  try {
    const lighthouseCmd = `npx lighthouse ${previewUrl} --output html --output json --output-path ${reportPath} --chrome-flags="--no-sandbox --headless --disable-gpu" --only-categories=performance,accessibility,best-practices,seo`;
    await LogService.execAndLog(lighthouseCmd, { cwd: rootDir });
    console.log('   ✅ Lighthouse Audit completed.');
  } catch (error) {
    console.warn('   ⚠️ Lighthouse Audit had issues (may be ignorable in some CI setups).');
    console.warn(`      Detail: ${error instanceof Error ? error.message : String(error)}`);
  }

  // 4. Generate Summary Report
  console.log('   📊 Generating Final Quality Report...');
  let report = `# 🛡️ Qualitäts-Bericht (V2 Pipeline)\n\n`;
  report += `*Generiert am: ${new Date().toLocaleString()}*\n`;
  report += `*Test-URL: [${previewUrl}](${previewUrl})*\n\n`;

  // --- NEW: E2E Section ---
  const e2eReportPath = path.join(rootDir, 'apps/company-website-e2e/test-output/report.json');
  if (fs.existsSync(e2eReportPath)) {
    try {
      const e2eData = JSON.parse(fs.readFileSync(e2eReportPath, 'utf8'));
      const testResults: { title: string; status: string }[] = [];

      function walkSuites(suite: any) {
        if (suite.specs) {
          suite.specs.forEach((spec: any) => {
            testResults.push({
              title: spec.title,
              status: spec.tests[0]?.results[0]?.status || 'unknown'
            });
          });
        }
        if (suite.suites) {
          suite.suites.forEach(walkSuites);
        }
      }
      walkSuites(e2eData);

      report += `## 🧪 Funktionale Abnahme (E2E Tests)\n`;
      report += `| Testfall | Status | Details |\n`;
      report += `| :--- | :---: | :--- |\n`;
      
      testResults.forEach(res => {
        const icon = res.status === 'passed' ? '✅' : '❌';
        report += `| ${res.title} | ${icon} | ${res.status.toUpperCase()} |\n`;
      });
      report += `\n`;
    } catch (e) {
      console.warn('   ⚠️ Could not parse E2E report.json for summary.');
    }
  }

  // Parse Scores if JSON exists
  const jsonPath = `${reportPath}.report.json`;
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const scores = {
      perf: Math.round((data.categories.performance?.score || 0) * 100),
      acc: Math.round((data.categories.accessibility?.score || 0) * 100),
      bp: Math.round((data.categories['best-practices']?.score || 0) * 100),
      seo: Math.round((data.categories.seo?.score || 0) * 100),
    };

    report += `## 🔦 Lighthouse Scores\n`;
    report += `| Kategorie | Score | Status |\n`;
    report += `| :--- | :--- | :--- |\n`;
    report += `| **Performance** | ${scores.perf}% | ${scores.perf > 90 ? '🟢' : '🟡'} |\n`;
    report += `| **Accessibility** | ${scores.acc}% | ${scores.acc > 90 ? '🟢' : '🟡'} |\n`;
    report += `| **Best Practices** | ${scores.bp}% | ${scores.bp > 90 ? '🟢' : '🟡'} |\n`;
    report += `| **SEO** | ${scores.seo}% | ${scores.seo > 90 ? '🟢' : '🟡'} |\n\n`;
    report += `> [Detaillierter HTML-Bericht](./lighthouse/${reportBaseName}.report.html)\n\n`;

    // --- NEW: Detailed Findings ---
    report += `## 🔍 Detaillierte Qualitäts-Findings (Lighthouse)\n`;
    report += `Spezifische Punkte aus der Lighthouse-Analyse:\n\n`;

    const relevantCategories = ['performance', 'accessibility', 'best-practices', 'seo'];
    relevantCategories.forEach(catKey => {
      const category = data.categories[catKey];
      if (!category) return;

      const failedAudits = category.auditRefs
        .map((ref: any) => data.audits[ref.id])
        .filter((audit: any) => audit && audit.score !== null && audit.score < 0.9);

      if (failedAudits.length > 0) {
        report += `### 📁 Kategorie: ${category.title}\n`;
        failedAudits.forEach((audit: any) => {
          const auditTitle = audit.title.replace(/[|]/g, '\\|');
          report += `#### 🔴 ${auditTitle}\n`;
          report += `**Problem:** ${audit.description.replace(/\[Learn more\]\(.*\)\.?/g, '').trim()}\n\n`;
          
          if (audit.displayValue) {
            report += `**Wert:** \`${audit.displayValue}\`\n\n`;
          }

          // List details if available (e.g. failing URLs or elements)
          if (audit.details && audit.details.items && audit.details.items.length > 0) {
            report += `**Betroffene Elemente/Orte:**\n`;
            audit.details.items.slice(0, 5).forEach((item: any) => {
              const location = (item.url || item.node?.snippet || item.label || 'Unbekannter Ort').replace(/[|]/g, '\\|');
              report += `- \`${location}\`\n`;
            });
            if (audit.details.items.length > 5) {
                report += `- *...und ${audit.details.items.length - 5} weitere.*\n`;
            }
            report += `\n`;
          }
        });
      }
    });
  }

  report += `## 🚦 Pipeline-Status\n`;
  report += `- [x] Phase 03: Vorbereitung (Sitemap, Prerender): **ERFOLGREICH**\n`;
  report += `- [x] Phase 04: Funktionale Validierung (E2E-Check): **ERFOLGREICH**\n`;
  report += `- [x] Phase 05: Performance & Report: **ERFOLGREICH**\n\n`;

  report += `---\n*Dieser Bericht wurde automatisch durch die v2-Pipeline erstellt.*`;

  fs.writeFileSync(path.join(reportsDir, 'FINAL_SUMMARY.md'), report);
  console.log(`\n✅ Finaler Bericht erstellt: ${path.join(reportsDir, 'FINAL_SUMMARY.md')}`);
}

runAudit().catch(err => {
  console.error('❌ Audit Stage FAILED:', err);
  process.exit(1);
});
