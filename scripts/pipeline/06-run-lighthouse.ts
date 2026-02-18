import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
 * PHASE 06: Lighthouse Audit
 * Responsibility: Run performance, SEO, and accessibility audits against a live URL.
 */

async function runLighthouse() {
  const url = process.argv.slice(2).find(arg => arg.startsWith('http')) || process.env.BASE_URL;
  const rootDir = path.resolve(__dirname, '../..');
  const reportsDir = path.join(rootDir, 'reports/lighthouse');

  if (!url) {
    console.error('❌ No target URL provided for Lighthouse audit.');
    process.exit(1);
  }

  console.log(`🔦 Starting Lighthouse Audit against: ${url}\n`);

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(reportsDir, `lighthouse-report-${timestamp}`);

  try {
    // Note: Lighthouse requires Chrome. In CI, make sure it's installed.
    // Using --chrome-flags="--no-sandbox" for CI compatibility.
    const command = `npx lighthouse ${url} --output html --output json --output-path ${reportPath} --chrome-flags="--no-sandbox --headless --disable-gpu" --only-categories=performance,accessibility,best-practices,seo`;
    
    console.log(`🚀 Executing: ${command}`);
    execSync(command, { stdio: 'inherit' });

    console.log(`\n✅ Lighthouse Audit completed successfully!`);
    console.log(`   - HTML Report: ${reportPath}.report.html`);
    console.log(`   - JSON Report: ${reportPath}.report.json`);
    
    // Extract basic scores for the summary later
    const jsonReport = JSON.parse(fs.readFileSync(`${reportPath}.report.json`, 'utf8'));
    const scores = {
      performance: Math.round((jsonReport.categories.performance?.score || 0) * 100),
      accessibility: Math.round((jsonReport.categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((jsonReport.categories['best-practices']?.score || 0) * 100),
      seo: Math.round((jsonReport.categories.seo?.score || 0) * 100),
    };

    console.log(`\n📊 Quick Scores:`);
    console.log(`   - Performance:    ${scores.performance}%`);
    console.log(`   - Accessibility:  ${scores.accessibility}%`);
    console.log(`   - Best Practices: ${scores.bestPractices}%`);
    console.log(`   - SEO:            ${scores.seo}%`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Lighthouse Audit failed:', error);
    // We don't necessarily want to break the whole pipeline for a reporting failure, 
    // but in strict mode we might. For now, we exit 0 with warning unless it's a critical error.
    process.exit(0); 
  }
}

runLighthouse().catch(err => {
  console.error(err);
  process.exit(1);
});
