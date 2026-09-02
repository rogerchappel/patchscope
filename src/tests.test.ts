import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { suggestTests } from './tests.js';

test('orders suggested commands by semantic confidence and then command', () => {
  const cwd = mkdtempSync(path.join(tmpdir(), 'patchscope-tests-'));
  writeFileSync(path.join(cwd, 'package.json'), JSON.stringify({
    scripts: { build: 'tsc', check: 'tsc --noEmit', smoke: 'node smoke.js', test: 'node --test' }
  }));

  const suggestions = suggestTests([{
    oldPath: 'src/index.ts', newPath: 'src/index.ts', path: 'src/index.ts',
    additions: 1, deletions: 0, hunks: [], isBinary: false, isDeleted: false, isNew: false
  }], cwd);

  assert.deepEqual(suggestions.map(({ confidence, command }) => [confidence, command]), [
    ['high', 'npm run smoke'],
    ['high', 'npm run test'],
    ['medium', 'git diff --check'],
    ['medium', 'npm run build'],
    ['medium', 'npm run check']
  ]);
});
