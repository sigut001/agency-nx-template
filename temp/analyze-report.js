const fs = require('fs');
const path = require('path');

try {
  const reportPath = path.join(__dirname, 'artifacts/manual_test_report.json'); // Back to original
  let raw = fs.readFileSync(reportPath, 'utf8');
  const jsonStart = raw.indexOf('{');
  if (jsonStart > -1) {
    raw = raw.substring(jsonStart);
  }
  const report = JSON.parse(raw);

  console.log('--- FAILED TESTS ---');

  function scan(suite) {
    if (suite.specs) {
      for (const spec of suite.specs) {
        for (const test of spec.tests) {
          if (test.status === 'unexpected' || test.status === 'failed') {
            const result = test.results.find(r => r.status === 'failed');
            // Clean up error message (remove ANSI codes)
            const errorMsg = result?.error?.message?.replace(/\u001b\[.*?m/g, '') || 'No error message';
            console.log(`[FAILED] ${spec.title}`);
            console.log(`  File: ${spec.file}`);
            console.log(`  Error: ${errorMsg.split('\n')[0]}`); // First line only
            console.log('');
          }
        }
      }
    }
    if (suite.suites) {
      for (const child of suite.suites) {
        scan(child);
      }
    }
  }

  if (report.suites) {
    for (const root of report.suites) {
      scan(root);
    }
  }
} catch (e) {
  console.error('Error parsing report:', e.message);
}
