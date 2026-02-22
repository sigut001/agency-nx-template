/**
 * UTILS: bump-version.ts
 * ZWECK: Berechnet und führt den Version-Bump basierend auf PR-Labels oder Commit-Tags aus.
 *        Wird am Ende eines erfolgreichen Release-Workflows auf GitHub aufgerufen.
 */
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

function bumpVersion() {
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const currentVersion = packageJson.version;

  // Hole den Bump-Typ (Default auf patch, falls nichts übergeben wurde)
  // Auf GitHub übergeben wir den Typ als Argument
  const bumpTypeArg = process.argv[2] || 'patch';
  const validTypes = ['major', 'minor', 'patch'];
  
  if (!validTypes.includes(bumpTypeArg)) {
    console.error(`❌ Ungültiger Bump-Typ: ${bumpTypeArg}. Erlaubt sind: ${validTypes.join(', ')}`);
    process.exit(1);
  }

  console.log(`📦 Aktuelle Version: ${currentVersion}`);
  console.log(`✨ Führe ${bumpTypeArg.toUpperCase()} Bump aus...`);

  try {
    // Führe den Bump aus (ohne Git-Tag, das machen wir separat in der YAML)
    execSync(`npm version ${bumpTypeArg} --no-git-tag-version`, { stdio: 'inherit' });
    
    const newVersion = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')).version;
    console.log(`✅ Neue Version: ${newVersion}`);
    
    // Output für GitHub Actions setzen (falls in der Shell verfügbar)
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `new_version=${newVersion}\n`);
    }
  } catch (error) {
    console.error('❌ Fehler beim Version-Bump:', error);
    process.exit(1);
  }
}

bumpVersion();
