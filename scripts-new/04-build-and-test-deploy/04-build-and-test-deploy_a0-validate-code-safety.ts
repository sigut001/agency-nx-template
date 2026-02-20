import * as fs from 'fs';
import * as path from 'path';

/**
 * CODE SAFETY VALIDATOR
 * Scans for forbidden patterns like 'dangerouslySetInnerHTML'
 */

const FORBIDDEN_PATTERNS = [
  'dangerouslySetInnerHTML'
];

const IGNORE_DIRS = [
  'node_modules',
  '.nx',
  '.git',
  'dist',
  'build',
  'temp',
  'reports'
];

const ALLOWED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

function scanDirectory(dir: string, foundIssues: string[]) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        scanDirectory(fullPath, foundIssues);
      }
    } else if (ALLOWED_EXTENSIONS.includes(path.extname(file))) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      FORBIDDEN_PATTERNS.forEach(pattern => {
        if (content.includes(pattern)) {
          // Double check it's not a comment or this validator itself
          if (!fullPath.includes('04-build-and-test-deploy_a0-validate-code-safety.ts')) {
             foundIssues.push(`[${pattern}] found in ${fullPath}`);
          }
        }
      });
    }
  }
}

async function main() {
  console.log('🛡️ Starting Code Safety Validation...');
  const issues: string[] = [];
  const rootDir = path.resolve(__dirname, '../../');
  
  scanDirectory(rootDir, issues);

  if (issues.length > 0) {
    console.error('\n❌ SECURITY VIOLATION DETECTED:');
    issues.forEach(issue => console.error(`  - ${issue}`));
    console.error('\nUsage of "dangerouslySetInnerHTML" is strictly forbidden in this project.');
    console.error('Please refactor the affected code to use safer alternatives.\n');
    process.exit(1);
  } else {
    console.log('✅ Code safety check passed. No forbidden patterns found.');
    process.exit(0);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
