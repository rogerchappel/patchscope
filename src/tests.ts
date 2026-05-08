import { readPackageScripts, packageManagerCommand } from './package-scripts.js';
import { subsystemFor } from './paths.js';
import type { FilePatch, TestSuggestion } from './types.js';

function addUnique(target: TestSuggestion[], suggestion: TestSuggestion): void {
  if (!target.some((item) => item.command === suggestion.command)) target.push(suggestion);
}

export function suggestTests(files: FilePatch[], cwd = process.cwd()): TestSuggestion[] {
  const scripts = readPackageScripts(cwd);
  const suggestions: TestSuggestion[] = [];
  const scriptNames = Object.keys(scripts).sort();
  const hasSource = files.some((file) => subsystemFor(file.path) === 'source');
  const hasTooling = files.some((file) => subsystemFor(file.path) === 'tooling' || subsystemFor(file.path) === 'config');
  const hasDocsOnly = files.length > 0 && files.every((file) => subsystemFor(file.path) === 'docs');
  const hasCI = files.some((file) => subsystemFor(file.path) === 'ci');

  for (const preferred of ['test', 'check', 'build', 'lint']) {
    if (scriptNames.includes(preferred)) {
      addUnique(suggestions, { command: packageManagerCommand(preferred, cwd), reason: `package.json defines ${preferred}`, confidence: preferred === 'test' ? 'high' : 'medium' });
    }
  }

  if (hasSource || hasTooling) {
    if (scriptNames.includes('smoke')) addUnique(suggestions, { command: packageManagerCommand('smoke', cwd), reason: 'source or CLI tooling changed', confidence: 'high' });
    addUnique(suggestions, { command: 'git diff --check', reason: 'catch whitespace and conflict markers before review', confidence: 'medium' });
  }

  if (hasCI) addUnique(suggestions, { command: 'bash scripts/validate.sh', reason: 'CI/workflow files changed', confidence: 'medium' });
  if (hasDocsOnly) addUnique(suggestions, { command: 'markdown link/style review', reason: 'documentation-only patch', confidence: 'low' });
  if (!suggestions.length) addUnique(suggestions, { command: 'git diff --stat', reason: 'no package scripts detected; inspect patch footprint manually', confidence: 'low' });

  return suggestions.sort((a, b) => b.confidence.localeCompare(a.confidence) || a.command.localeCompare(b.command));
}
