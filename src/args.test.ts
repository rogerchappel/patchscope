import assert from 'node:assert/strict';
import test from 'node:test';
import { parseArgs } from './args.js';

const oneSourceError = 'Choose only one input source: file, --staged, --worktree, or --stdin.';

test('rejects a second positional patch source', () => {
  assert.throws(
    () => parseArgs(['scan', 'first.patch', 'second.patch']),
    { message: oneSourceError }
  );
});

test('rejects every empty --out value form', () => {
  for (const argv of [
    ['scan', 'input.patch', '--out'],
    ['scan', 'input.patch', '--out', ''],
    ['scan', 'input.patch', '--out='],
    ['scan', 'input.patch', '--out', '--json']
  ]) {
    assert.throws(() => parseArgs(argv), { message: '--out requires a file path' });
  }
});
