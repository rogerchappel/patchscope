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

test('CLI rejects missing and empty fail-on class lists', () => {
  for (const args of [
    ['scan', 'examples/feature.patch', '--fail-on'],
    ['scan', 'examples/feature.patch', '--fail-on=']
  ]) {
    const result = runCli(args);

    assert.equal(result.status, 2);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr.trim(), '--fail-on requires a non-empty class list');
  }
});

test('CLI rejects unsupported help and version operands and options', () => {
  for (const [command, argument] of [
    ['help', 'extra'],
    ['help', '--json'],
    ['version', 'extra'],
    ['version', '--json']
  ] as const) {
    const result = runCli([command, argument]);

    assert.equal(result.status, 2);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr.trim(), `${command} does not accept operands or options`);
  }
});
