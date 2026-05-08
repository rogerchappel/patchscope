import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { parseUnifiedDiff } from './parser.js';

test('parses file paths and line counts from unified diff', () => {
  const diff = readFileSync('examples/feature.patch', 'utf8');
  const files = parseUnifiedDiff(diff);
  assert.equal(files.length, 2);
  assert.equal(files[0]?.path, 'src/service.ts');
  assert.equal(files[0]?.additions, 4);
  assert.equal(files[0]?.deletions, 1);
  assert.equal(files[1]?.path, 'README.md');
});

test('parses new files from /dev/null headers', () => {
  const diff = readFileSync('examples/secret.patch', 'utf8');
  const [file] = parseUnifiedDiff(diff);
  assert.equal(file?.path, 'config/prod.env');
  assert.equal(file?.isNew, true);
});
