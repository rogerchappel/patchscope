import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const workflow = readFileSync('.github/workflows/release-dry-run.yml', 'utf8');
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

function pullRequestPaths(source) {
  const block = source.match(/pull_request:\n\s+paths:\n((?:\s+- .+\n)+)/)?.[1];
  assert.ok(block, 'release dry-run workflow must define pull_request paths');
  return block
    .split('\n')
    .map((line) => line.match(/^\s+- ['"]?(.+?)['"]?\s*$/)?.[1])
    .filter(Boolean);
}

test('release dry-run watches every release-check and packed-surface input class', () => {
  assert.match(packageJson.scripts['release:check'], /test|check|build|smoke/);
  assert.ok(packageJson.files.includes('examples'));
  assert.ok(packageJson.files.includes('README.md'));

  const paths = pullRequestPaths(workflow);
  const required = [
    'releasebox.config.json',
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    '*.md',
    'src/**',
    'docs/**',
    'examples/**',
    '.github/workflows/release*.yml',
    'scripts/**',
  ];

  assert.deepEqual(paths, required);
  assert.ok(paths.includes('src/**'), 'a source-only PR must select Release dry run');
  assert.ok(paths.includes('docs/**'), 'a docs-only PR must select Release dry run');
});
