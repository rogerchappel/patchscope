import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { parseUnifiedDiff } from './parser.js';
import { scanPatch } from './scan.js';

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

test('decodes Git-quoted UTF-8 paths in diff and marker headers', () => {
  const diff = [
    'diff --git "a/src/caf\\303\\251 menu.ts" "b/src/caf\\303\\251 menu.ts"',
    'index 1111111..2222222 100644',
    '--- "a/src/caf\\303\\251 menu.ts"',
    '+++ "b/src/caf\\303\\251 menu.ts"',
    '@@ -1 +1 @@',
    '-export const menu = false;',
    '+export const menu = true;'
  ].join('\n');

  const result = scanPatch({ diffText: diff, cwd: process.cwd() });
  assert.equal(result.files[0]?.path, 'src/café menu.ts');
  assert.equal(result.files[0]?.oldPath, 'src/café menu.ts');
  assert.equal(result.files[0]?.newPath, 'src/café menu.ts');
  assert.deepEqual(result.summary.directories, { src: 1 });
  assert.deepEqual(result.summary.extensions, { '.ts': 1 });
  assert.deepEqual(result.summary.subsystems, { source: ['src/café menu.ts'] });
});

test('preserves ordinary parsing when Git-quoted paths contain escapes', () => {
  const diff = [
    'diff --git "a/docs/quote\\"and\\\\slash.md" "b/docs/quote\\"and\\\\slash.md"',
    '--- "a/docs/quote\\"and\\\\slash.md"',
    '+++ "b/docs/quote\\"and\\\\slash.md"',
    '@@ -0,0 +1 @@',
    '+quoted path'
  ].join('\n');

  const [file] = parseUnifiedDiff(diff);
  assert.equal(file?.path, 'docs/quote"and\\slash.md');
  assert.equal(file?.additions, 1);
});
