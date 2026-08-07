import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

function runCli(args: string[]) {
  return spawnSync(process.execPath, ['dist/cli.js', ...args], { encoding: 'utf8' });
}

test('CLI does not silently discard a positional patch source', () => {
  const result = runCli(['scan', 'examples/feature.patch', 'examples/secret.patch', '--json']);

  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr.trim(), 'Choose only one input source: file, --staged, --worktree, or --stdin.');
});

test('CLI does not fall back to stdout for an empty output target', () => {
  const result = runCli(['scan', 'examples/feature.patch', '--out=']);

  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr.trim(), '--out requires a file path');
});
